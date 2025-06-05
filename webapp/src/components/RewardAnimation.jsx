import { useCallback } from 'react'
import ReactConfetti from 'react-confetti'
import { motion } from 'framer-motion'

const RewardAnimation = () => {
  const getWindowDimensions = useCallback(() => {
    const { innerWidth: width, innerHeight: height } = window
    return { width, height }
  }, [])
  
  const dimensions = getWindowDimensions()
  
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <ReactConfetti
        width={dimensions.width}
        height={dimensions.height}
        numberOfPieces={200}
        gravity={0.2}
        colors={['#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9', '#009688', '#4DB6AC']}
        recycle={false}
      />
      
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 10
          }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-green-600 drop-shadow-lg">Great Job!</h2>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-xl text-yellow-400 drop-shadow-md"
          >
            +10 points
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default RewardAnimation