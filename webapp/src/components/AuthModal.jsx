import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './Login';
import Signup from './Signup';

const AuthModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToSignup = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {isLogin ? (
          <Login 
            key="login"
            onSwitchToSignup={switchToSignup}
            onClose={onClose}
          />
        ) : (
          <Signup 
            key="signup"
            onSwitchToLogin={switchToLogin}
            onClose={onClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthModal; 