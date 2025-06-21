import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Sign up function
  const signup = async (email, password, displayName, requestAdmin = false) => {
    try {
      setError('');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName: displayName,
        createdAt: new Date(),
        points: 0,
        level: 1,
        environmentalImpact: {
          co2Saved: 0,
          plasticSaved: 0,
          waterSaved: 0,
          treesEquivalent: 0,
          wasteRecycled: 0,
        },
        totalClassifications: 0,
        correctClassifications: 0,
        adminRequest: !!requestAdmin
      });
      
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Password reset function
  const resetPassword = async (email) => {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Get user data from Firestore
  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  // Update user data in Firestore
  const updateUserData = async (uid, data) => {
    try {
      await setDoc(doc(db, 'users', uid), data, { merge: true });
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Refresh token to get latest custom claims
        await user.getIdToken(true);
        const idTokenResult = await user.getIdTokenResult();
        setIsAdmin(!!idTokenResult.claims.admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Helper to force refresh and check admin claim
  const refreshAdminStatus = async () => {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
      const idTokenResult = await auth.currentUser.getIdTokenResult();
      setIsAdmin(!!idTokenResult.claims.admin);
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    getUserData,
    updateUserData,
    error,
    setError,
    isAdmin,
    refreshAdminStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 