# import numpy as np
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing import image
# from flask import Flask, request, jsonify, render_template
# from flask_cors import CORS
# import base64
# import io
# from PIL import Image
# import os


# app = Flask(__name__)
# CORS(app)  


# model_path = r'C:\\Users\\HP\\Downloads\\waste_classifier_model.h5'
# if not os.path.exists(model_path):
#     print(f"Error: Model file not found at {model_path}")
# model = load_model(model_path)

# class_labels = ['Hazardous', 'Non-Recyclable', 'Organic', 'Recyclable']

# @app.route('/')
# def index():
#     """Serve the main HTML page."""
#     return render_template('index.html')

# @app.route('/predict', methods=['POST'])
# def predict_waste():
#     """Receive image data, predict waste type, and return result."""
#     data = request.json
#     if 'image' not in data:
#         return jsonify({'error': 'No image data provided'}), 400

#     try:
       
#         image_data = data['image'].split(',')[1]
#         image_bytes = base64.b64decode(image_data)
#         img = Image.open(io.BytesIO(image_bytes)).convert('RGB')

#         img = img.resize((224, 224))
#         img_array = image.img_to_array(img)
#         img_array = np.expand_dims(img_array, axis=0)
#         img_array /= 255.0

    
#         prediction = model.predict(img_array)
#         predicted_index = np.argmax(prediction)
#         predicted_class = class_labels[predicted_index]  
#         confidence = float(np.max(prediction)) 

#         print(f"Prediction: {predicted_class}, Confidence: {confidence:.2f}")  # Log prediction

#         return jsonify({
#             'prediction': predicted_class,
#             'confidence': confidence
#         })

#     except Exception as e:
#         print(f"Error during prediction: {e}")  
#         return jsonify({'error': f'Error processing image: {str(e)}'}), 500

# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=5000) 


from flask import Flask, request, jsonify,render_template
from ultralytics import YOLO
import ollama
from flask_cors import CORS
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

model = YOLO('yolov8n.pt')  # smallest default model
 
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/classify', methods=['POST'])
def classify_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = Image.open(request.files['image'].stream)
    # Convert the image to RGB if it's not already
    if image.mode != 'RGB':
        image = image.convert('RGB')
    # Resize the image to the model's expected input size
    image = image.resize((640, 640))
    # Convert the image to a format suitable for the model
    image = image.convert('RGB')
    results = model(image)

    label = results[0].names[int(results[0].boxes.cls[0])] if results[0].boxes else "Unknown"
    confidence = results[0].boxes.conf[0] if results[0].boxes else 0.0
    confidence = int(confidence * 100)
    confidence = min(max(confidence, 0), 100)
    print(f"Detected: {label} with confidence: {confidence}%")
    # Check if the label is empty or None
    if not label:
        return jsonify({'error': 'No label detected'}), 400
    # Check if the confidence is within a valid range
    if confidence < 0 or confidence > 100:
        return jsonify({'error': 'Invalid confidence level'}), 400
    # Check if the label is a string
    if not isinstance(label, str):
        return jsonify({'error': 'Invalid label type'}), 400
    # Check if the label is too long
    if len(label) > 50:
        return jsonify({'error': 'Label too long'}), 400
    # Check if the label contains invalid characters
    if not all(c.isalnum() or c.isspace() for c in label):
        return jsonify({'error': 'Label contains invalid characters'}), 400
    # Check if the label is a known category
    known_categories = ['plastic', 'paper', 'metal', 'glass', 'organic']
    if label.lower() not in known_categories:
        return jsonify({'error': 'Unknown category'}), 400
    

    # Use the label to get a waste disposal instruction
    prompt = f"Give a waste disposal instruction for '{label}'"
    response = ollama.chat(model='llama3.2:latest', messages=[{'role': 'user', 'content': prompt}])

    return jsonify({
        'label': label,
        'instruction': response['message']['content']
    })

if __name__ == '__main__':
    app.run(debug=True)
