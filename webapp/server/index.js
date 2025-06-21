import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { verifyAdmin } from './firebase-admin.js';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
const db = getFirestore();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const wasteCategories = [
  { 
    id: 'recyclable', 
    name: 'Recyclable Waste',
    icon: '♻️',
    color: 'bg-primary-500',
    gradient: 'from-primary-400 to-primary-600',
    description: 'Paper, Glass, Metal, Plastic',
    examples: [
      'Paper', 
      'Glass bottles', 
      'Plastic bottles', 
      'Aluminum cans', 
      'Cardboard boxes', 
      'Aluminum foil', 
      'Metal items', 
      'Pens', 
      'Pencils'
    ]
  },
  { 
    id: 'hazardous', 
    name: 'Hazardous Waste',
    icon: '⚠️',
    color: 'bg-error-500',
    gradient: 'from-error-400 to-error-600',
    description: 'Dangerous Materials',
    examples: ['Batteries', 'Paint', 'Pesticides', 'Medical waste', 'Scissors', 'Injections', 'Syringes', 'Sharp objects']
  },
  { 
    id: 'solid', 
    name: 'Solid Waste',
    icon: '🗑️',
    color: 'bg-gray-600',
    gradient: 'from-gray-500 to-gray-700',
    description: 'Non-recyclable Items',
    examples: ['Broken toys', 'Used tissue',  'Old shoes', 'Styrofoam', 'Mixed material items']
  },
  { 
    id: 'organic', 
    name: 'Organic Waste',
    icon: '🌱',
    color: 'bg-secondary-500',
    gradient: 'from-secondary-400 to-secondary-600',
    description: 'Biodegradable Waste',
    examples: ['Fruit peels', 'Vegetable scraps', 'Leaves', 'Food leftovers']
  },
];

// Gemini setup
const genAI = new GoogleGenerativeAI("AIzaSyC6zSYRumGI1yQemEvz58LxqlEcvpiIbLQ");

async function classifyWaste(imageBase64) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze this image and classify the waste item with high accuracy:

1. Identify the specific waste object and its materials
2. Identify if the object has multiple components (e.g., plastic bottle with metal cap)
3. For each component, classify it into exactly one of these categories:
   - Recyclable Waste (e.g., paper, glass bottles, plastic bottles, aluminum cans, cardboard boxes, aluminum foil, metal items, pens, pencils)
   - Hazardous Waste (e.g., batteries, paint, pesticides, medical waste)
   - Solid Waste (e.g., broken toys, used tissue, plastic wrappers, old shoes, styrofoam)
   - Organic Waste (e.g., fruit peels, vegetable scraps, leaves, food leftovers)
4. IMPORTANT: All medical-related objects like scissors, needles, syringes, or any sharp objects MUST be classified as Hazardous Waste
5. IMPORTANT: Cardboard, paper, aluminum foil, metal items, pens, and pencils should be classified as Recyclable Waste, not Solid Waste or Organic Waste
6. Provide a detailed explanation of why each component belongs in that category
7. Estimate classification confidence (0-100%)

Format the response exactly as:
Object: [detailed object name]
Components: [list of components, separated by semicolons]
Categories: [category for each component, in same order, separated by semicolons]
Reasons: [reason for each component, in same order, separated by semicolons]
Confidence: [number]`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();
  
  // Parse the response
  const objectMatch = text.match(/Object: (.*)/i);
  const componentsMatch = text.match(/Components: (.*)/i);
  const categoriesMatch = text.match(/Categories: (.*)/i);
  const reasonsMatch = text.match(/Reasons: (.*)/i);
  const confidenceMatch = text.match(/Confidence: (\d+)/i);

  // Extract components and their categories
  const components = componentsMatch ? componentsMatch[1].split(';').map(c => c.trim()) : ['Unknown component'];
  const categories = categoriesMatch ? categoriesMatch[1].split(';').map(c => c.trim().toLowerCase()) : ['unknown'];
  const reasons = reasonsMatch ? reasonsMatch[1].split(';').map(r => r.trim()) : [''];

  // Map components to their waste categories
  const componentDetails = components.map((component, index) => {
    return {
      name: component,
      category: categories[index] || 'unknown',
      reason: reasons[index] || ''
    };
  });

  return {
    object: objectMatch ? objectMatch[1].trim() : 'Unknown object',
    components: componentDetails,
    confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50
  };
}

app.post('/api/classify', async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image data provided' 
      });
    }

    // Use the base64 image data directly
    const base64Image = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
    
    // Process the image with Gemini
    const result = await classifyWaste(base64Image);

    // Map component categories to our defined waste categories
    const mappedComponents = result.components.map(component => {
      const matchedCategory = wasteCategories.find(cat =>
        component.category.includes(cat.id) || 
        component.category.includes(cat.name.toLowerCase())
      ) || { id: 'unknown', name: 'Unclassified Waste' };

      return {
        name: component.name,
        classification: matchedCategory,
        reason: component.reason
      };
    });

    // Determine the main classification (first component or most common)
    const mainClassification = mappedComponents.length > 0 
      ? mappedComponents[0].classification 
      : { id: 'unknown', name: 'Unclassified Waste' };

    // Send response with more detailed information
    const response = {
      success: true,
      objectName: result.object,
      classification: mainClassification,
      components: mappedComponents,
      confidence: result.confidence,
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error in classification:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to classify image',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

app.get('/api/categories', (req, res) => {
  res.json({ success: true, categories: wasteCategories });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Sortyx API is running',
    timestamp: new Date().toISOString()
  });
});

// Admin-only endpoint to add rewards
app.post('/api/admin/rewards', verifyAdmin, async (req, res) => {
  try {
    const { title, description, pointsCost, image } = req.body;

    if (!title || !description || pointsCost === undefined || !image) {
      return res.status(400).json({ error: 'Missing required reward fields.' });
    }

    const newReward = {
      title,
      description,
      pointsCost: Number(pointsCost),
      image,
      createdAt: Timestamp.now(),
    };

    const docRef = await db.collection('rewards').add(newReward);

    res.status(201).json({ success: true, id: docRef.id, ...newReward });
  } catch (err) {
    console.error("Error creating reward:", err);
    res.status(500).json({ 
      error: 'Failed to create reward on the server.',
      details: err.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});