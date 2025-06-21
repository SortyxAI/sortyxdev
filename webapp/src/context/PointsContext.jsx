import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const PointsContext = createContext();

export const usePoints = () => useContext(PointsContext);

const DEFAULT_REWARDS = [
  {
    id: 'default-1',
    title: 'Eco Badge',
    description: 'Awarded for joining Sortyx!',
    pointsCost: 0,
    image: '🏅',
    unlocked: true,
    redeemed: false,
    isDefault: true
  },
  {
    id: 'default-2',
    title: 'First 100 Points',
    description: 'Earn 100 points to unlock this badge.',
    pointsCost: 100,
    image: '🎉',
    unlocked: false,
    redeemed: false,
    isDefault: true
  }
];

export const PointsProvider = ({ children }) => {
  const { currentUser, getUserData, updateUserData } = useAuth();
  
  // Load saved data from localStorage if available (for non-authenticated users)
  const [points, setPoints] = useState(() => {
    if (!currentUser) {
      const savedPoints = localStorage.getItem('ecosort_points');
      return savedPoints ? parseInt(savedPoints, 10) : 0;
    }
    return 0;
  });
  
  const [level, setLevel] = useState(() => {
    if (!currentUser) {
      const savedLevel = localStorage.getItem('ecosort_level');
      return savedLevel ? parseInt(savedLevel, 10) : 1;
    }
    return 1;
  });
  
  const [environmentalImpact, setEnvironmentalImpact] = useState(() => {
    if (!currentUser) {
      const savedImpact = localStorage.getItem('ecosort_environmental_impact');
      return savedImpact ? JSON.parse(savedImpact) : {
        co2Saved: 0, // in kg
        plasticSaved: 0, // in kg
        waterSaved: 0, // in liters
        treesEquivalent: 0, // equivalent trees planted
        wasteRecycled: 0, // in kg
      };
    }
    return {
      co2Saved: 0,
      plasticSaved: 0,
      waterSaved: 0,
      treesEquivalent: 0,
      wasteRecycled: 0,
    };
  });
  
  const [rewards, setRewards] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(true);

  // Fetch rewards from Firestore
  useEffect(() => {
    setLoadingRewards(true);
    const rewardsCollection = collection(db, 'rewards');
    const unsubscribe = onSnapshot(rewardsCollection, (snapshot) => {
      const rewardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Merge default rewards with Firestore rewards
      setRewards([
        ...DEFAULT_REWARDS.map(dr => ({
          ...dr,
          unlocked: points >= dr.pointsCost
        })),
        ...rewardsData
      ]);
      setLoadingRewards(false);
    }, (error) => {
      console.error("Error fetching rewards: ", error);
      setLoadingRewards(false);
    });

    return () => unsubscribe();
  }, [points]);

  // Load user data from Firestore when user is authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          const userData = await getUserData(currentUser.uid);
          if (userData) {
            setPoints(userData.points || 0);
            setLevel(userData.level || 1);
            setEnvironmentalImpact(userData.environmentalImpact || {
              co2Saved: 0,
              plasticSaved: 0,
              waterSaved: 0,
              treesEquivalent: 0,
              wasteRecycled: 0,
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [currentUser, getUserData]);
  
  // Calculate level based on points
  useEffect(() => {
    const newLevel = Math.floor(points / 100) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
    }
    
    // Update rewards unlocked status
    setRewards(prevRewards => 
      prevRewards.map(reward => ({
        ...reward,
        unlocked: points >= reward.pointsCost
      }))
    );
    
    // Save to localStorage for non-authenticated users
    if (!currentUser) {
      localStorage.setItem('ecosort_points', points.toString());
      localStorage.setItem('ecosort_level', level.toString());
    }
  }, [points, level, currentUser]);
  
  // Save environmental impact to localStorage when it changes (for non-authenticated users)
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('ecosort_environmental_impact', JSON.stringify(environmentalImpact));
    }
  }, [environmentalImpact, currentUser]);

  // Save user data to Firestore when authenticated user's data changes
  useEffect(() => {
    const saveUserData = async () => {
      if (currentUser) {
        try {
          await updateUserData(currentUser.uid, {
            points,
            level,
            environmentalImpact,
            lastUpdated: new Date()
          });
        } catch (error) {
          console.error('Error saving user data:', error);
        }
      }
    };

    if (currentUser && points > 0) {
      saveUserData();
    }
  }, [points, level, environmentalImpact, currentUser, updateUserData]);
  
  // Add points and update environmental impact based on waste category
  const addPoints = (category, isCorrect = true) => {
    // Base points for correct classification
    const basePoints = isCorrect ? 10 : 5;
    
    // Bonus points based on waste category
    let bonusPoints = 0;
    let impactUpdate = {};
    
    switch(category) {
      case 'recyclable':
        bonusPoints = 5;
        impactUpdate = {
          co2Saved: 0.5,
          plasticSaved: 0.2,
          wasteRecycled: 0.5
        };
        break;
      case 'hazardous':
        bonusPoints = 10; // Higher points for properly handling hazardous waste
        impactUpdate = {
          co2Saved: 1.0,
          waterSaved: 10
        };
        break;
      case 'organic':
        bonusPoints = 3;
        impactUpdate = {
          co2Saved: 0.3,
          treesEquivalent: 0.01,
          waterSaved: 5
        };
        break;
      case 'solid':
        bonusPoints = 2;
        impactUpdate = {
          co2Saved: 0.1,
          wasteRecycled: 0.3
        };
        break;
      default:
        bonusPoints = 0;
    }
    
    // Add points
    setPoints(prevPoints => prevPoints + basePoints + bonusPoints);
    
    // Update environmental impact
    setEnvironmentalImpact(prev => {
      const updated = { ...prev };
      Object.keys(impactUpdate).forEach(key => {
        updated[key] = +(prev[key] + impactUpdate[key]).toFixed(2);
      });
      return updated;
    });
    
    return basePoints + bonusPoints;
  };
  
  // Add a new reward via the admin endpoint
  const addReward = async (rewardData) => {
    if (!currentUser) throw new Error('Not authenticated');
    const token = await currentUser.getIdToken();
    const res = await fetch('/api/admin/rewards', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rewardData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add reward');
    }
    return await res.json();
  };
  
  // Redeem a reward
  const redeemReward = (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward || !reward.unlocked || reward.redeemed) {
      return false;
    }
    
    // Update the reward status
    setRewards(prevRewards => 
      prevRewards.map(r => 
        r.id === rewardId ? { ...r, redeemed: true } : r
      )
    );
    
    return true;
  };
  
  return (
    <PointsContext.Provider value={{
      points,
      level,
      environmentalImpact,
      rewards,
      loadingRewards,
      addPoints,
      redeemReward,
      addReward
    }}>
      {children}
    </PointsContext.Provider>
  );
};