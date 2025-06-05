import React from 'react';
import { useWaste } from '../context/WasteContext';
import { motion } from 'framer-motion';

const ClassificationResult = () => {
  const { detectedObject, classification, components, processingTime, backendType } = useWaste();

  if (!detectedObject || !classification) {
    return null;
  }

  // Find the matching waste category for additional info
  const categoryInfo = components[0]?.classification || classification;
  
  // Format processing time
  const formattedTime = processingTime 
    ? processingTime > 1000 
      ? `${(processingTime / 1000).toFixed(2)}s` 
      : `${Math.round(processingTime)}ms`
    : 'N/A';

  return (
    <div className="w-full max-w-[100vw] mx-auto p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Main Result Header */}
        <div className={`p-6 ${categoryInfo.gradient || categoryInfo.color}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{categoryInfo.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-700">{detectedObject.name}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600 opacity-90">
                  <p>Confidence: {detectedObject.confidence}%</p>
                  <span className="hidden sm:inline">•</span>
                  <p>Processing time: {formattedTime}</p>
                  <span className="hidden sm:inline">•</span>
                  <p>Backend: {backendType === 'api' ? 'Gemini API' : 'YOLO+LLM'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-25 px-4 py-2 rounded-lg">
              <p className="text-gray-600 font-semibold">{categoryInfo.name}</p>
            </div>
          </div>
        </div>
        
        {/* Rest of your component remains the same */}
        {/* ... */}
      </motion.div>
    </div>
  );
};

export default ClassificationResult;