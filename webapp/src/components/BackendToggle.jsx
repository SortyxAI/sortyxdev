import React from 'react';
import { motion } from 'framer-motion';
import { useWaste } from '../context/WasteContext';

const BackendToggle = () => {
  const { backendType, setBackendType } = useWaste();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-20 right-6 z-30 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2"
    >
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={() => setBackendType('api')}
          className={`px-3 py-1.5 rounded-md transition-all ${
            backendType === 'api' 
              ? 'bg-primary-500 text-white font-medium' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Gemini API</span>
          </div>
        </button>
        <button
          onClick={() => setBackendType('local')}
          className={`px-3 py-1.5 rounded-md transition-all ${
            backendType === 'local' 
              ? 'bg-primary-500 text-white font-medium' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span>YOLO+LLM</span>
          </div>
        </button>
      </div>
      <div className="text-xs text-center mt-1 text-gray-500">
        {backendType === 'api' ? 'Using Gemini API' : 'Using local YOLO + LLM'}
      </div>
    </motion.div>
  );
};

export default BackendToggle;