import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWaste } from '../context/WasteContext'
import WasteBins from './wastebins'
import ClassificationAnimation from './ClassificationAnimation'
import ComponentsBreakdown from './ComponentsBreakdown'

const ResultsPanel = () => {
  const { 
    detectedObject, 
    classification, 
    wasteCategories,
    components,
    currentComponentIndex,
    processingComponents,
    processNextComponent,
    setProcessingComponents,
    handleCorrectClassification, 
    handleIncorrectClassification,
    resetDetection
  } = useWaste()
  
  const [showCorrection, setShowCorrection] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [expandedComponent, setExpandedComponent] = useState(null)
  const [animationCompleted, setAnimationCompleted] = useState(false)
  
  if (!detectedObject || !classification) {
    return null
  }
  
  // Get the current component to process
  const currentComponent = components && components.length > 0 && processingComponents
    ? components[currentComponentIndex]
    : { classification };
  
  const handleConfirm = () => {
    // Call the correct classification handler
    handleCorrectClassification();
    
    // Reset the showCorrection state
    setShowCorrection(false);
    
    // Reset the selected category
    setSelectedCategory(null);
    
    // Reset detection after a short delay to allow animations to complete
    setTimeout(() => {
      resetDetection();
    }, 1000);
  };
  
  const handleCorrect = () => {
    // Immediately hide the confirmation buttons
    setShowCorrection(false);
    
    // Call the correct classification handler
    handleCorrectClassification();
    
    // Reset detection immediately without any delay
    resetDetection();
    
    // Remove the setTimeout that's causing the delay
    // setTimeout(() => {
    //   resetDetection();
    // }, 1000);
  };
  
  const handleIncorrect = () => {
    // Show the correction UI
    setShowCorrection(true);
  };
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }
  
  const handleSubmitCorrection = () => {
    if (selectedCategory) {
      handleIncorrectClassification(selectedCategory)
      setShowCorrection(false)
    }
  }

  const toggleComponentDetails = (index) => {
    setExpandedComponent(expandedComponent === index ? null : index)
  }
  
  const handleAnimationComplete = () => {
    setAnimationCompleted(true)
  }
  
  const handleCorrectBin = () => {
    if (processingComponents) {
      processNextComponent();
    } else {
      handleCorrectClassification();
    }
  }
  
  const handleWrongBin = () => {
    console.log('Wrong bin selected')
  }
  
  const handleNextItem = () => {
    if (components && components.length > 1 && !processingComponents) {
      setProcessingComponents(true);
      processNextComponent();
    } else {
      resetDetection();
    }
  }
  
  const imageContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 } 
    }
  }
  
  const resultVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: 0.3 + (i * 0.1),
        duration: 0.5
      } 
    })
  }

  const arrowVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { 
      opacity: 1, 
      pathLength: 1,
      transition: { 
        duration: 1,
        delay: 0.5
      }
    }
  }
  
  return (
    <div className="card max-w-7xl mx-auto overflow-hidden bg-white rounded-xl shadow-lg">
      {/* Top header with classification badge */}
      <div className="relative w-full bg-gradient-to-r from-blue-50 to-green-50 p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Waste Classification</h2>
          
          {/* Classification badge - positioned at top right */}
          <div className="flex items-center">
            <div className={`px-4 py-2 rounded-full ${currentComponent.classification.color} bg-opacity-20 border border-opacity-40 ${currentComponent.classification.color} flex items-center`}>
              <span className="text-2xl mr-2">{currentComponent.classification.icon}</span>
              <div>
                <span className="font-bold text-gray-800">{currentComponent.classification.name}</span>
                <span className="ml-2 text-sm bg-white bg-opacity-70 px-2 py-1 rounded-full">
                  Confidence: {detectedObject.confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="flex flex-col lg:flex-row p-6 gap-8"
        initial="hidden"
        animate="visible"
      >
        {/* Left column - Image */}
        <motion.div 
          className="lg:w-1/2"
          variants={imageContainerVariants}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-3">Detection Result</h3>
          <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-inner border border-gray-200 aspect-video">
            {detectedObject.imageSrc && (
              <img 
                src={detectedObject.imageSrc} 
                alt="Detected object" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-3 px-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{detectedObject.name}</span>
              </div>
            </div>
          </div>

          {/* How to dispose section */}
          <motion.div
            variants={resultVariants}
            custom={1}
            className="mt-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500"
          >
            <h4 className="text-md font-semibold text-blue-700 mb-2">How to dispose</h4>
            <p className="text-blue-800">
              Place in {currentComponent.classification.name.toLowerCase()} bin.
              {currentComponent.classification.id === 'organic' && ' Can be composted.'}
              {currentComponent.classification.id === 'recyclable' && ' Ensure it\'s clean and dry.'}
              {currentComponent.classification.id === 'hazardous' && ' Take to a special collection point.'}
            </p>
          </motion.div>
        </motion.div>
        
        {/* Right column - Classification details */}
        <motion.div className="md:w-1/2">
          {!showCorrection ? (
            <>
              <motion.div
                className="mb-6"
                variants={resultVariants}
                custom={0}
              >
                <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                  {processingComponents 
                    ? `Component ${currentComponentIndex + 1}/${components.length}: ${currentComponent.name}` 
                    : 'Classification Details'}
                </h4>
                <div className={`p-4 rounded-lg ${currentComponent.classification.color} bg-opacity-10 border border-opacity-30 ${currentComponent.classification.color}`}>
                  <div className="flex items-start">
                    <span className="text-3xl mr-3">{currentComponent.classification.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {processingComponents ? currentComponent.name : detectedObject.name}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {processingComponents ? currentComponent.reason : detectedObject.reason || classification.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Interactive Waste Bins with Navigation */}
              <motion.div
                variants={resultVariants}
                custom={1}
                className="mb-6"
              >
                <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Where should this go?</h4>
                
                <WasteBins 
                  classification={classification}
                  components={components}
                  onAnimationComplete={handleAnimationComplete}
                  onCorrectBin={handleCorrectBin}
                  onWrongBin={handleWrongBin}
                  onNextItem={handleNextItem}
                />
              </motion.div>
              
              {/* Only show components breakdown if not currently processing components */}
              {components && components.length > 0 && !processingComponents && (
                <motion.div
                  variants={resultVariants}
                  custom={2}
                  className="mb-6"
                >
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Components</h4>
                  <div className="space-y-3">
                    {/* Rest of your components code... */}
                  </div>
                </motion.div>
              )}
              
              {/* Only show confirmation buttons if not processing components */}
              {!processingComponents && (
                <motion.div
                  variants={resultVariants}
                  custom={3}
                  className="mt-8"
                >
                  <p className="text-center mb-4 text-gray-600">Is this classification correct?</p>
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      onClick={handleIncorrect} // Changed from handleWrong to handleIncorrect
                      className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 shadow-sm transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      No
                    </motion.button>
                    <motion.button
                      onClick={handleCorrect}
                      className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-md transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Yes, Correct!
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            // Fix the wasteCategories mapping - ensure it's an array
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-5 rounded-lg shadow-md"
            >
              <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Select the correct category:</h4>
              <div className="grid grid-cols-1 gap-3 mb-4">
                {Array.isArray(wasteCategories) 
                  ? wasteCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category)}
                        className={`p-3 rounded-lg flex items-center transition-all ${
                          selectedCategory?.id === category.id
                            ? `${category.color} bg-opacity-30 border-2 border-opacity-70 ${category.color}`
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span className="text-2xl mr-3">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </button>
                    ))
                  : Object.values(wasteCategories).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category)}
                        className={`p-3 rounded-lg flex items-center transition-all ${
                          selectedCategory?.id === category.id
                            ? `${category.color} bg-opacity-30 border-2 border-opacity-70 ${category.color}`
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span className="text-2xl mr-3">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </button>
                    ))
                }
              </div>
              <div className="flex justify-center">
                <motion.button
                  onClick={handleSubmitCorrection}
                  disabled={!selectedCategory}
                  className={`px-6 py-2 rounded-full ${
                    selectedCategory
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } transition-all`}
                  whileHover={selectedCategory ? { scale: 1.05 } : {}}
                  whileTap={selectedCategory ? { scale: 0.95 } : {}}
                >
                  Submit Correction
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ResultsPanel