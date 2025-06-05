import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { motion } from 'framer-motion'
import { useWaste } from '../context/WasteContext'

const Camera = () => {
  const webcamRef = useRef(null)
  const { setDetectedObject, classifyObject, setClassification, backendType } = useWaste()
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  
  const capture = useCallback(async () => {
    if (webcamRef.current) {
      setIsCapturing(true)
      
      try {
        const imageSrc = webcamRef.current.getScreenshot()
        
        const mockObject = {
          id: Date.now(),
          name: 'Unknown Object',
          imageSrc: imageSrc,
          confidence: Math.floor(Math.random() * 30) + 70,
        }
        
        setDetectedObject(mockObject)
        const classification = await classifyObject(imageSrc)
        setClassification(classification)
      } catch (error) {
        console.error('Error capturing image:', error)
      } finally {
        setIsCapturing(false)
      }
    }
  }, [webcamRef, setDetectedObject, classifyObject, setClassification, backendType])
  
  const handleUserMediaError = useCallback(() => {
    setCameraError(true)
  }, [])
  
  if (cameraError) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl aspect-video bg-black/20 backdrop-blur-lg rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-white/10"
      >
        <span className="text-6xl mb-6">📸</span>
        <h3 className="text-2xl font-bold text-white mb-4">Camera Access Required</h3>
        <p className="text-white/90 text-lg mb-6 max-w-md">
          Please allow camera access to start identifying and classifying waste items
        </p>
        <motion.button 
          onClick={() => setCameraError(false)}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium backdrop-blur-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
      </motion.div>
    )
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto relative"
    >
      <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
        
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }}
          className="absolute inset-0 w-full h-full object-cover"
          onUserMediaError={handleUserMediaError}
        />
        
        {/* Camera UI Elements */}
        <motion.div 
          className="absolute inset-0 z-20 pointer-events-none"
          initial={false}
          animate={isCapturing ? { opacity: [0, 1, 0] } : { opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Scanning Animation */}
          <motion.div
            className="absolute inset-x-[10%] h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent"
            animate={{
              y: ['20%', '80%', '20%'],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          {/* Corner Brackets */}
          <div className="absolute inset-0 p-8">
            <div className="w-full h-full border-2 border-white/30 rounded-2xl" />
            <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-green-400 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-green-400 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-green-400 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-green-400 rounded-br-2xl" />
          </div>
        </motion.div>
        
        {/* Capture Button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <motion.button
            onClick={capture}
            disabled={isCapturing}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-lg border-2 border-white/30 flex items-center justify-center group hover:bg-white/20 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isCapturing ? (
              <motion.div 
                className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 group-hover:bg-white/30 transition-all" />
            )}
          </motion.button>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="text-white/70 text-sm">
          Center the waste item in frame and tap the button to scan
        </p>
      </motion.div>
    </motion.div>
  )
}

export default Camera