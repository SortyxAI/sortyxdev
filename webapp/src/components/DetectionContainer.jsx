import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWaste } from '../context/WasteContext'
import Camera from './Camera'
import ResultsPanel from './ResultsPanel'
import RewardAnimation from './RewardAnimation'
import BackendToggle from './BackendToggle'

const DetectionContainer = () => {
  const { 
    detectedObject, 
    classification, 
    showConfetti,
    resetDetection
  } = useWaste()
  
  const [showCamera, setShowCamera] = useState(true)
  
  useEffect(() => {
    // This effect will run whenever detectedObject or classification changes
    if (detectedObject && classification) {
      setShowCamera(false);
    } else {
      setShowCamera(true);
    }
  }, [detectedObject, classification]);
  
  return (
    <div className="w-full relative">
      {showConfetti && <RewardAnimation />}
      
      {/* Show BackendToggle only when camera is visible */}
      {showCamera && <BackendToggle />}
      
      <AnimatePresence mode="wait">
        {showCamera ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <Camera />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-full mx-auto"
          >
            <ResultsPanel />
            
            <motion.button
              onClick={resetDetection}
              className="mt-8 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium backdrop-blur-lg mx-auto block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Scan Another Item
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DetectionContainer