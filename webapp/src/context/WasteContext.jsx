import { createContext, useState, useContext } from 'react'
import { usePoints } from './PointsContext'

const WasteContext = createContext()

export const useWaste = () => useContext(WasteContext)

export const WasteProvider = ({ children }) => {
  const [detectedObject, setDetectedObject] = useState(null)
  const [classification, setClassification] = useState(null)
  const [components, setComponents] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Add these new state variables
  const [wasteQueue, setWasteQueue] = useState([]);
  const [currentWasteIndex, setCurrentWasteIndex] = useState(0);
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);
  const [processingComponents, setProcessingComponents] = useState(false);
  
  // Add backend selection state
  const [backendType, setBackendType] = useState('api'); // 'api' or 'local'
  
  // Add processing time tracking
  const [processingTime, setProcessingTime] = useState(null);
  
  // Use the addPoints function from PointsContext
  const { addPoints } = usePoints();

  const wasteCategories = [
    { 
      id: 'recyclable', 
      name: 'Recyclable Waste', 
      color: 'bg-blue-500',
      icon: '♻️',
      description: 'Materials that can be reprocessed into new products',
      examples: ['Paper', 'Glass', 'Metal cans', 'Plastic bottles']
    },
    { 
      id: 'organic', 
      name: 'Organic Waste', 
      color: 'bg-green-500',
      icon: '🍃',
      description: 'Biodegradable waste from food or plant material',
      examples: ['Fruit scraps', 'Vegetable peels', 'Coffee grounds', 'Yard trimmings']
    },
    { 
      id: 'hazardous', 
      name: 'Hazardous Waste', 
      color: 'bg-red-500',
      icon: '⚠️',
      description: 'Waste that poses substantial danger to health or environment',
      examples: ['Batteries', 'Paint', 'Chemicals', 'Electronics']
    },
    { 
      id: 'landfill', 
      name: 'Landfill Waste', 
      color: 'bg-gray-500',
      icon: '🗑️',
      description: 'Waste that cannot be recycled or composted',
      examples: ['Styrofoam', 'Certain plastics', 'Dirty paper products', 'Diapers']
    },
    { 
      id: 'solid', 
      name: 'Solid Waste', 
      color: 'bg-gray-600',
      gradient: 'from-gray-500 to-gray-700',
      icon: '🗑️',
      description: 'Non-recyclable solid materials that require proper disposal',
      examples: ['Broken electronics', 'Mixed materials', 'Non-recyclable plastics']
    },
    { 
      id: 'unknown', 
      name: 'Unclassified Waste',
      color: 'bg-yellow-500',
      icon: '❓',
      description: 'Items that could not be classified into a specific category',
      examples: ['Unidentified materials', 'Complex composite items']
    }
  ]
  
  // Remove the uploadToCloudinary function entirely
  
  const classifyObject = async (imageData) => {
    try {
      // Start timing the process
      const startTime = performance.now();
      
      let response;
      
      if (backendType === 'api') {
        // Use Gemini API backend (Node.js)
        // Convert base64 image data to a format suitable for sending
        const base64Data = imageData.includes('base64')
          ? imageData.split(',')[1]
          : imageData;
    
        console.log("Sending image data of length:", base64Data.length);
    
        // Using Node.js server with direct image data
        response = await fetch('http://localhost:3001/api/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageData: base64Data 
          }),
        });
      } else {
        // Use local YOLO+LLM backend (Python Flask)
        // Create FormData for Python backend
        const formData = new FormData();
        
        // Convert base64 to blob
        const fetchResponse = await fetch(imageData);
        const blob = await fetchResponse.blob();
        
        // Append the image to FormData
        formData.append('image', blob, 'image.jpg');
        
        // Send to Python backend
        response = await fetch('http://localhost:5001/classify', {
          method: 'POST',
          body: formData,
        });
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to classify image');
      }
  
      const data = await response.json();
      
      // Calculate processing time
      const endTime = performance.now();
      setProcessingTime(endTime - startTime);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to classify image');
      }
      console.log(data);
        
      setDetectedObject({
        imageSrc: imageData, // Use the local image data directly
        name: data.objectName,
        confidence: data.confidence,
        reason: data.components?.[0]?.reason || ''
      });
      
      setClassification(data.classification);
      
      // Set components if available
      if (data.components && data.components.length > 0) {
        setComponents(data.components.filter(comp => comp.name || comp.reason));
      } else {
        setComponents([]);
      }
      
      return data.classification;
    } catch (error) {
      console.error('Error classifying object:', error);
      setProcessingTime(null);
      return null;
    }
  };
  
  const handleCorrectClassification = () => {
    if (!detectedObject) return;
    
    // Generate a unique ID for this classification
    const itemId = `${detectedObject.name}-${Date.now()}`;
    
    // Try to add points - this will return false if already awarded
    const pointsAdded = addPoints(10, itemId);
    
    // Only show confetti if points were actually added
    if (pointsAdded) {
      setShowConfetti(true);
      // Use a shorter timeout for confetti to not delay the user experience
      setTimeout(() => {
        setShowConfetti(false);
      }, 1500);
    }
  };

  // Add the handleIncorrectClassification function
  const handleIncorrectClassification = (selectedCategory) => {
    if (!selectedCategory || !detectedObject) return;
    
    // Update the classification with the selected category
    setClassification(selectedCategory);
    
    // If we have components, update the first component's classification
    if (components.length > 0) {
      const updatedComponents = [...components];
      updatedComponents[0] = {
        ...updatedComponents[0],
        classification: selectedCategory
      };
      setComponents(updatedComponents);
    }
    
    // Show confetti for user engagement
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  const resetDetection = () => {
    setDetectedObject(null)
    setClassification(null)
    setComponents([])
  }

  // Add this function to process the next waste item
  const processNextWasteItem = () => {
    if (currentWasteIndex < wasteQueue.length - 1) {
      setCurrentWasteIndex(currentWasteIndex + 1);
      setDetectedObject(wasteQueue[currentWasteIndex + 1].object);
      setClassification(wasteQueue[currentWasteIndex + 1].classification);
    } else {
      // All items processed, reset
      resetDetection();
    }
  };
  
  // Add this function to process components sequentially
  const processNextComponent = () => {
    if (components && components.length > 0) {
      if (currentComponentIndex < components.length - 1) {
        // Move to the next component
        setCurrentComponentIndex(currentComponentIndex + 1);
        setProcessingComponents(true);
      } else {
        // All components processed, reset
        setCurrentComponentIndex(0);
        setProcessingComponents(false);
      }
    }
  };
  
  return (
    <WasteContext.Provider value={{
      detectedObject, 
      setDetectedObject,
      classification, 
      setClassification,
      components,
      showConfetti,
      wasteCategories,
      classifyObject,
      handleCorrectClassification,
      handleIncorrectClassification, // Add this function to the context
      resetDetection,
      // Add the new values to the context
      wasteQueue,
      setWasteQueue,
      currentWasteIndex,
      processNextWasteItem,
      currentComponentIndex,
      processingComponents,
      processNextComponent,
      // Add backend selection
      backendType,
      setBackendType,
      // Add processing time
      processingTime
    }}>
      {children}
    </WasteContext.Provider>
  )
}
