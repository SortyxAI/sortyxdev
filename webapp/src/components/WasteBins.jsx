import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { usePoints } from '../context/PointsContext';

// Fix the import statement for the arrow-down image
import arrowDown from "../assets/arrow-down.gif";

const WasteBins = ({
  classification,
  onAnimationComplete,
  onCorrectBin,
  onWrongBin,
  onNextItem,
  components = []
}) => {
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [showWellDone, setShowWellDone] = useState(false);
  const speechSynthesisRef = useRef(null);
  const { addPoints } = usePoints();
  const [fullBin, setFullBin] = useState(null);
  const [lastFullBinId, setLastFullBinId] = useState(null);

  // Determine if we're using components or just the main classification
  const hasComponents = components && components.length > 0;
  
  // Get current component or fallback to main classification
  const currentComponent = hasComponents 
    ? components[currentComponentIndex] 
    : { classification };

  // Get the target bin for the current component
  const targetBin = currentComponent?.classification?.id || classification?.id || 'unknown';

  // Display name for the current item
  const currentItemName = hasComponents 
    ? components[currentComponentIndex].name 
    : classification?.name || 'this item';

  // Reset animation state when component or classification changes
  useEffect(() => {
    setAnimationCompleted(false);
    setFeedback(null);
    setShowPointsAnimation(false);
    setShowWellDone(false);
  }, [currentComponentIndex, classification]);

  // Add a key to force re-render of animation components
  const animationKey = `${currentComponentIndex}-${currentItemName}`;

  // Function to speak text using the Web Speech API
  const speak = (text, rate = 1) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak instructions when animation completes
  useEffect(() => {
    if (animationCompleted && targetBin) {
      const instructionText = `Please put ${currentItemName} in the ${currentComponent.classification?.name || classification?.name} bin.`;
      speak(instructionText);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [animationCompleted, targetBin, currentComponent, classification, currentItemName]);

  // Move fillLevels to state so it can be updated
  const [fillLevels, setFillLevels] = useState({
    recyclable: 80,
    hazardous: 20,
    solid: 60,
    organic: 98
  });

  const handleBinClick = (binId) => {
    if (feedback || showWellDone) return; // Prevent multiple clicks during feedback or after completion

    if (binId === targetBin) {
      // Hide the arrow immediately when correct bin is clicked
      setAnimationCompleted(false);
      
      // Calculate and add points
      const earnedPoints = addPoints(targetBin, true);
      setPointsEarned(earnedPoints);
      setShowPointsAnimation(true);

      // INCREMENT the fill level by 2% for the correct bin, max 100%
      setFillLevels(prev => ({
        ...prev,
        [binId]: Math.min((prev[binId] ?? 0) + 2, 100)
      }));

      const feedbackMessage = `Great job! ${currentItemName} goes in the ${currentComponent.classification?.name || classification?.name} bin.`;
      setFeedback({
        type: 'correct',
        message: feedbackMessage
      });

      speak(feedbackMessage, 1.1);

      if (onCorrectBin) onCorrectBin();

      setTimeout(() => {
        setFeedback(null);
        setShowPointsAnimation(false);

        // Move to next component if available
        if (hasComponents && currentComponentIndex < (components.length - 1)) {
          setCurrentComponentIndex(prevIndex => prevIndex + 1);
        } else {
          // All components done, show "Well done" message
          setShowWellDone(true);
          setTimeout(() => {
            setShowWellDone(false);
            // Call onNextItem to reset the entire flow
            if (onNextItem) onNextItem();
          }, 2500);
        }
      }, 1800);
    } else {
      // Add fewer points for incorrect attempt
      const earnedPoints = addPoints(targetBin, false);
      setPointsEarned(earnedPoints);

      const feedbackMessage = `Oops! ${currentItemName} belongs in the ${currentComponent.classification?.name || classification?.name} bin.`;

      setFeedback({
        type: 'wrong',
        message: feedbackMessage
      });

      speak(feedbackMessage);

      if (onWrongBin) onWrongBin();

      setTimeout(() => {
        setFeedback(null);
      }, 1200);
    }
  };

  // Add this effect to set animation as completed after component mounts
  useEffect(() => {
    // Short delay to simulate animation completion
    const timer = setTimeout(() => {
      setAnimationCompleted(true);
      if (onAnimationComplete) onAnimationComplete();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentComponentIndex, classification, onAnimationComplete]);

  // Rest of the component remains the same
  const bins = [
    {
      id: 'recyclable',
      icon: '♻️',
      color: 'bg-primary-500',
      label: 'Recyclable',
      gradient: 'from-primary-400 to-primary-600',
      description: 'Paper, Glass, Plastic, Metal'
    },
    {
      id: 'hazardous',
      icon: '⚠️',
      color: 'bg-error-500',
      label: 'Hazardous',
      gradient: 'from-error-400 to-error-600',
      description: 'Batteries, Paint, Medical, Sharp Objects'
    },
    {
      id: 'solid',
      icon: '🗑️',
      color: 'bg-gray-600',
      label: 'Solid',
      gradient: 'from-gray-500 to-gray-700',
      description: 'Non-recyclable Items'
    },
    {
      id: 'organic',
      icon: '🌱',
      color: 'bg-secondary-500',
      label: 'Organic',
      gradient: 'from-secondary-400 to-secondary-600',
      description: 'Food & Plant Waste'
    }
  ];

  // Example fill levels for each bin (replace with real data as needed)
  // REMOVE THIS DUPLICATE BLOCK:
  // const fillLevels = {
  //   recyclable: 80, // 80% full
  //   hazardous: 20,  // 100% full
  //   solid: 60,      // 60% full
  //   organic: 98     // 90% full
  // };
  
  // Check for any bin that is 100% full and show popup
  useEffect(() => {
    const full = Object.entries(fillLevels).find(([id, level]) => level === 100);
    if (full) {
      if (lastFullBinId !== full[0]) {
        const binInfo = bins.find(b => b.id === full[0]);
        setFullBin(binInfo);
        setLastFullBinId(full[0]);
      }
    } else {
      setFullBin(null);
      setLastFullBinId(null);
    }
  }, [fillLevels, bins, lastFullBinId]);

  // Example temperature and humidity (replace with real data as needed)
  const temperature = 27; // °C
  const humidity = 65;    // %
  
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Popup for full bin */}
      {fullBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg px-8 py-6 flex flex-col items-center">
            <div className="text-4xl mb-2">{fullBin.icon}</div>
            <h2 className="text-xl font-bold mb-2 text-red-600">{fullBin.label} Bin is Full!</h2>
            <p className="mb-4 text-gray-700">Please empty the bin before adding more waste.</p>
            <button
              className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
              onClick={() => setFullBin(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {/* Temperature and Humidity display above classification/component indicator */}
      <div className="flex items-center justify-end gap-6 mb-1">
        <div className="flex items-center gap-1 text-blue-700 font-semibold text-lg">
          <span className="text-2xl">🌡️</span>
          <span>{temperature}°C</span>
        </div>
        <div className="flex items-center gap-1 text-blue-700 font-semibold text-lg">
          <span className="text-2xl">💧</span>
          <span>{humidity}%</span>
        </div>
      </div>

      {/* Current component indicator */}
      {hasComponents && (
        <div className="mb-16 text-center">
          <div className="inline-block bg-green-500 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-white font-medium">
              Component {currentComponentIndex + 1} of {components.length}: {currentItemName}
            </span>
          </div>
        </div>
      )}

      {/* Feedback message */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 px-6 py-3 rounded-lg shadow-lg z-20 ${
              feedback.type === 'correct' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points animation */}
      <AnimatePresence>
        {showPointsAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: -100,
              scale: 1.5
            }}
            transition={{
              duration: 2,
              times: [0, 0.2, 0.8, 1]
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <div className="flex items-center bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full shadow-lg font-bold">
              <span className="text-xl mr-1">+</span>
              <span className="text-2xl">{pointsEarned}</span>
              <span className="text-lg ml-1">pts</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Well done message */}
      <AnimatePresence>
        {showWellDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-green-100 border-2 border-green-500 rounded-xl shadow-lg px-8 py-6"
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">🎉</span>
              <h2 className="text-2xl font-bold text-green-700 mb-1">Well done!</h2>
              <p className="text-green-700">You sorted all components correctly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed horizontal layout with 4 bins */}
      <div className="grid grid-cols-4 gap-3 w-full">
        {bins.map((bin, index) => (
          <motion.div
            key={bin.id}
            className="relative flex flex-col items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Navigation arrow - only show after item animation completes */}
            {animationCompleted && targetBin === bin.id && !feedback && !showWellDone && (
              <motion.div
                className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: -10 }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  y: [-10, -5, -10]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <img src={arrowDown} alt="Arrow pointing down" className="w-12 h-12" />
              </motion.div>
            )}

            <motion.div
              className={`w-full h-36 relative ${bin.color} rounded-t-lg overflow-hidden
                bg-gradient-to-b ${bin.gradient} shadow-lg
                ${targetBin === bin.id ? 'ring-2 ring-white/30' : ''}
                transform-gpu transition-all duration-300
                hover:scale-105 hover:shadow-xl
                cursor-pointer`}
              onClick={() => handleBinClick(bin.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="h-full flex flex-col items-center justify-center p-2">
                <motion.div
                  className="text-3xl mb-2"
                  animate={targetBin === bin.id ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, 0]
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {bin.icon}
                </motion.div>
                <span className="text-white font-medium text-xs mb-1">{bin.label}</span>
                <span className="text-white/70 text-xs text-center line-clamp-2">{bin.description}</span>
              </div>

              {/* Remove the AnimatePresence block below that shows the dropping item */}
              {/* 
              <AnimatePresence mode="wait">
                {targetBin === bin.id && (
                  <motion.div
                    key={animationKey}
                    className="absolute -top-16 left-1/2 transform -translate-x-1/2"
                    initial={{ y: -50, scale: 0.5, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 100, scale: 0.5, opacity: 0 }}
                    onAnimationComplete={handleAnimationComplete}
                  >
                    <motion.div
                      className="relative"
                      animate={{
                        y: [0, 140],
                      }}
                      transition={{
                        duration: 1,
                        ease: "easeIn"
                      }}
                    >
                      <div className="text-3xl">{currentComponent.classification?.icon || classification?.icon || '📦'}</div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              */}
            </motion.div>

            {/* Show fill percentage below each bin */}
            <div className="mt-2 text-center text-sm font-semibold text-gray-700">
              {fillLevels[bin.id] ?? 0}% full
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WasteBins;