import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePoints } from '../context/PointsContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ onClose }) => {
  const { points, level, environmentalImpact, rewards, redeemReward, addReward, loadingRewards } = usePoints();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [redeemingReward, setRedeemingReward] = useState(null);
  
  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };
  
  const handleRedeemClick = (reward) => {
    setRedeemingReward(reward);
  };
  
  const confirmRedeem = () => {
    if (redeemingReward) {
      const success = redeemReward(redeemingReward.id);
      if (success) {
        // Show success message
        alert(`You've successfully redeemed: ${redeemingReward.title}`);
      }
      setRedeemingReward(null);
    }
  };
  
  const cancelRedeem = () => {
    setRedeemingReward(null);
  };
  
  // Calculate progress to next level
  const nextLevelPoints = level * 100;
  const currentLevelPoints = (level - 1) * 100;
  const progressPercentage = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Sortyx Dashboard</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="bg-white/20 rounded-full p-3">
              <span className="text-3xl">🌍</span>
            </div>
            <div className="ml-4">
              <div className="text-sm opacity-80">Level {level} Eco Warrior</div>
              <div className="text-2xl font-bold">{points} Points</div>
              <div className="mt-2 w-full bg-white/20 rounded-full h-2.5">
                <div 
                  className="bg-white h-2.5 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">
                {points - currentLevelPoints} / {nextLevelPoints - currentLevelPoints} to Level {level + 1}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview' 
                  ? 'border-b-2 border-primary-500 text-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'impact' 
                  ? 'border-b-2 border-primary-500 text-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Environmental Impact
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'rewards' 
                  ? 'border-b-2 border-primary-500 text-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Rewards
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Overview content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Points Summary */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Points Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current Points</span>
                        <span className="font-bold text-xl">{points}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current Level</span>
                        <span className="font-bold">{level}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Next Level</span>
                        <span>{nextLevelPoints} points</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Environmental Highlights */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Environmental Highlights</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                          🌲
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">CO₂ Saved</div>
                          <div className="font-semibold">{formatNumber(environmentalImpact.co2Saved)} kg</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 mr-3">
                          ♻️
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Plastic Saved</div>
                          <div className="font-semibold">{formatNumber(environmentalImpact.plasticSaved)} kg</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          💧
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Water Saved</div>
                          <div className="font-semibold">{formatNumber(environmentalImpact.waterSaved)} L</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'impact' && (
              <motion.div
                key="impact"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Impact content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
                    <div className="text-4xl mb-4">🌲</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">CO₂ Saved</h3>
                    <div className="text-3xl font-bold text-green-700">{formatNumber(environmentalImpact.co2Saved)} kg</div>
                    <p className="text-sm text-gray-600 mt-2">
                      Equivalent to the CO₂ absorbed by {formatNumber(environmentalImpact.co2Saved / 21)} trees in a year
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
                    <div className="text-4xl mb-4">♻️</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Plastic Saved</h3>
                    <div className="text-3xl font-bold text-blue-700">{formatNumber(environmentalImpact.plasticSaved)} kg</div>
                    <p className="text-sm text-gray-600 mt-2">
                      Equivalent to {formatNumber(environmentalImpact.plasticSaved * 50)} plastic bottles
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200 shadow-sm">
                    <div className="text-4xl mb-4">💧</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Water Saved</h3>
                    <div className="text-3xl font-bold text-cyan-700">{formatNumber(environmentalImpact.waterSaved)} L</div>
                    <p className="text-sm text-gray-600 mt-2">
                      Equivalent to {formatNumber(environmentalImpact.waterSaved / 2.5)} showers
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200 shadow-sm">
                    <div className="text-4xl mb-4">🌱</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Trees Equivalent</h3>
                    <div className="text-3xl font-bold text-amber-700">{formatNumber(environmentalImpact.treesEquivalent)}</div>
                    <p className="text-sm text-gray-600 mt-2">
                      Your impact is equivalent to planting these many trees
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm">
                    <div className="text-4xl mb-4">🗑️</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Waste Recycled</h3>
                    <div className="text-3xl font-bold text-purple-700">{formatNumber(environmentalImpact.wasteRecycled)} kg</div>
                    <p className="text-sm text-gray-600 mt-2">
                      You've helped divert this much waste from landfills
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Rewards content */}
                {isAdmin ? (
                  <AddRewardForm addReward={addReward} />
                ) : (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-center text-sm">
                    Only admins can create new rewards. You can view and redeem available rewards below.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loadingRewards ? (
                    <p>Loading rewards...</p>
                  ) : (
                    rewards
                      .filter(reward => isAdmin ? !reward.isDefault : true)
                      .map((reward) => (
                        <div 
                          key={reward.id}
                          className={`rounded-xl p-6 border shadow-sm ${
                            reward.unlocked 
                              ? reward.redeemed 
                                ? 'bg-gray-100 border-gray-300' 
                                : 'bg-white border-primary-200' 
                              : 'bg-gray-100 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="text-4xl mr-4">{reward.image}</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-1">{reward.title}</h3>
                              <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-primary-600 mr-1">
                                    {reward.pointsCost}
                                  </span>
                                  <span className="text-xs text-gray-500">points</span>
                                </div>
                                {reward.redeemed ? (
                                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                                    Redeemed
                                  </span>
                                ) : reward.unlocked ? (
                                  <button
                                    onClick={() => handleRedeemClick(reward)}
                                    className="px-4 py-1.5 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-colors"
                                  >
                                    Redeem
                                  </button>
                                ) : (
                                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                                    Locked
                                  </span>
                                )}
                              </div>
                              {!reward.unlocked && (
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-primary-500 h-1.5 rounded-full" 
                                    style={{ width: `${Math.min(100, (points / reward.pointsCost) * 100)}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Redeem Confirmation Modal */}
      <AnimatePresence>
        {redeemingReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">Redeem Reward</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to redeem <span className="font-medium">{redeemingReward.title}</span> for {redeemingReward.pointsCost} points?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelRedeem}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRedeem}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Level Up Animation */}
      <AnimatePresence>
        {/* This would be triggered when the user levels up */}
        {false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.2, 1],
                opacity: [0, 1, 1]
              }}
              transition={{ duration: 1.5 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-white mb-2">Level Up!</h2>
              <p className="text-xl text-white/80">
                You've reached Level {level}
              </p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8"
              >
                <button
                  className="px-6 py-3 bg-primary-600 text-white rounded-full text-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AddRewardForm = ({ addReward }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pointsCost, setPointsCost] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !pointsCost || !image) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await addReward({
        title,
        description,
        pointsCost: parseInt(pointsCost, 10),
        image,
        unlocked: false,
        redeemed: false,
      });
      setTitle('');
      setDescription('');
      setPointsCost('');
      setImage('');
    } catch (err) {
      setError('Failed to add reward. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Reward</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Reward Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Points Cost"
            value={pointsCost}
            onChange={(e) => setPointsCost(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          rows="2"
        />
        <input
            type="text"
            placeholder="Image (Emoji or URL)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add Reward'}
        </button>
      </form>
    </motion.div>
  );
};

export default Dashboard;