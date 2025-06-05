import { motion } from 'framer-motion'
import { useWaste } from '../context/WasteContext'

const InfoPanel = ({ onClose }) => {
  const { wasteCategories } = useWaste()
  
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
  
  const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <motion.div 
          className="relative w-screen max-w-md"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Waste Classification Guide</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <p className="text-gray-600 mb-6">
                Learn how to properly sort and dispose of different types of waste to help protect our environment.
              </p>
              
              <div className="space-y-6">
                {wasteCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    className={`p-4 rounded-xl ${category.color} bg-opacity-10 border border-opacity-20 ${category.color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex items-start">
                      <span className="text-3xl mr-3">{category.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{category.name}</h3>
                        <p className="text-gray-600 mb-3">{category.description}</p>
                        
                        <h4 className="font-medium text-gray-700 mb-1">Examples:</h4>
                        <ul className="grid grid-cols-2 gap-1">
                          {category.examples.map((example, i) => (
                            <li key={i} className="flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2"></span>
                              <span className="text-sm text-gray-600">{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h3 className="text-lg font-bold text-primary-800 mb-2">Why Waste Classification Matters</h3>
                <p className="text-gray-700 mb-3">
                  Proper waste classification and disposal:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">✓</span>
                    <span className="text-gray-700">Reduces landfill waste</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">✓</span>
                    <span className="text-gray-700">Conserves natural resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">✓</span>
                    <span className="text-gray-700">Prevents pollution of air, water and soil</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">✓</span>
                    <span className="text-gray-700">Saves energy used in manufacturing</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full btn-primary"
              >
                Got it!
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default InfoPanel