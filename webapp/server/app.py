from flask import Flask, request, jsonify,render_template
from ultralytics import YOLO
import ollama
from flask_cors import CORS
from PIL import Image
import io

app = Flask(__name__)
CORS(app, resources={r"/classify": {"origins": "http://localhost:5173"}})

model = YOLO('yolov8n.pt')  # smallest default model
 
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/classify', methods=['POST'])
def classify_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = Image.open(request.files['image'].stream)
    results = model(image)

    label = results[0].names[int(results[0].boxes.cls[0])] if results[0].boxes else "Unknown"
  
    prompt = f"Give a waste disposal instruction and category for '{label}'. Also say confidence level (0-100%)"
    response = ollama.chat(model='llama3.2:latest', messages=[{'role': 'user', 'content': prompt}])
    content = response['message']['content']

    # Try to extract fake components to mimic your original structure
    import re
    confidence_match = re.search(r'confidence.*?(\d+)', content, re.IGNORECASE)
    confidence = int(confidence_match.group(1)) if confidence_match else 80

    fake_component = {
        "name": label,
        "classification": {
            "id": label.lower().replace(" ", "_"),
            "name": label,
            "description": "AI generated category",
            "icon": "🔍",
            "color": "bg-gray-500",
            "gradient": "from-gray-400 to-gray-600"
        },
        "reason": content
    }

    return jsonify({
        'success': True,
        'objectName': label,
        'classification': fake_component['classification'],
        'components': [fake_component],
        'confidence': confidence
    })

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=5001)