import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';

const UserProfile = ({ onClose }) => {
  const { currentUser, resetPassword, isAdmin } = useAuth();
  const { points, level, environmentalImpact } = usePoints();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const formatNumber = (num) => num?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0;

  const handlePasswordReset = async () => {
    if (!currentUser?.email) {
      setMessage('No email address available');
      return;
    }
    try {
      setLoading(true);
      setMessage('');
      await resetPassword(currentUser.email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      setMessage('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* User Info */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="ml-4">
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  {currentUser?.displayName || 'User'}
                  {isAdmin && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">Admin</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{currentUser?.email}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Member since: {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
            <div className="text-2xl font-bold text-primary-700">{points}</div>
            <div className="text-sm text-primary-600">Total Points</div>
          </div>
          <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-4 border border-secondary-200">
            <div className="text-2xl font-bold text-secondary-700">Level {level}</div>
            <div className="text-sm text-secondary-600">Current Level</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{formatNumber(environmentalImpact.co2Saved)}</div>
            <div className="text-sm text-green-600">CO₂ Saved (kg)</div>
          </div>
        </div>
        {/* Environmental Impact */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Environmental Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">💧</div>
              <div>
                <div className="text-sm text-gray-500">Water Saved</div>
                <div className="font-semibold">{formatNumber(environmentalImpact.waterSaved)} L</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">♻️</div>
              <div>
                <div className="text-sm text-gray-500">Plastic Saved</div>
                <div className="font-semibold">{formatNumber(environmentalImpact.plasticSaved)} kg</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">🌲</div>
              <div>
                <div className="text-sm text-gray-500">Trees Equivalent</div>
                <div className="font-semibold">{formatNumber(environmentalImpact.treesEquivalent)}</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">📦</div>
              <div>
                <div className="text-sm text-gray-500">Waste Recycled</div>
                <div className="font-semibold">{formatNumber(environmentalImpact.wasteRecycled)} kg</div>
              </div>
            </div>
          </div>
        </div>
        {/* Account Actions */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handlePasswordReset}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile; 