import React, { createContext, useContext, useState, useEffect } from 'react';

const PointsContext = createContext();

export const usePoints = () => useContext(PointsContext);

export const PointsProvider = ({ children }) => {
  // Load saved data from localStorage if available
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem('ecosort_points');
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });
  
  const [level, setLevel] = useState(() => {
    const savedLevel = localStorage.getItem('ecosort_level');
    return savedLevel ? parseInt(savedLevel, 10) : 1;
  });
  
  const [environmentalImpact, setEnvironmentalImpact] = useState(() => {
    const savedImpact = localStorage.getItem('ecosort_environmental_impact');
    return savedImpact ? JSON.parse(savedImpact) : {
      co2Saved: 0, // in kg
      plasticSaved: 0, // in kg
      waterSaved: 0, // in liters
      treesEquivalent: 0, // equivalent trees planted
      wasteRecycled: 0, // in kg
    };
  });
  
  const [rewards, setRewards] = useState([
    {
      id: 'discount10',
      title: '10% Discount on Eco Products',
      description: 'Get 10% off on any eco-friendly product from our partner stores',
      pointsCost: 100,
      unlocked: false,
      redeemed: false,
      image: '🏷️'
    },
    {
      id: 'plantTree',
      title: 'Plant a Tree',
      description: 'We\'ll plant a real tree in your name through our reforestation partners',
      pointsCost: 250,
      unlocked: false,
      redeemed: false,
      image: '🌳'
    },
    {
      id: 'ecoWorkshop',
      title: 'Free Eco Workshop',
      description: 'Join our exclusive workshop on sustainable living practices',
      pointsCost: 500,
      unlocked: false,
      redeemed: false,
      image: '🧠'
    },
    {
      id: 'premiumBadge',
      title: 'Premium Eco Warrior Badge',
      description: 'Unlock a special profile badge showing your commitment to sustainability',
      pointsCost: 750,
      unlocked: false,
      redeemed: false,
      image: '🏅'
    }
  ]);
  
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
    
    // Save to localStorage
    localStorage.setItem('ecosort_points', points.toString());
    localStorage.setItem('ecosort_level', level.toString());
  }, [points, level]);
  
  // Save environmental impact to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('ecosort_environmental_impact', JSON.stringify(environmentalImpact));
  }, [environmentalImpact]);
  
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
      addPoints,
      redeemReward
    }}>
      {children}
    </PointsContext.Provider>
  );
};