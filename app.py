from flask import Flask, request, jsonify,render_template
from ultralytics import YOLO
import ollama
from flask_cors import CORS
from PIL import Image
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Apply CORS to the entire app

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
    
  
    prompt = f"Give a waste disposal instruction for '{label}'"
    response = ollama.chat(model='llama3.2', messages=[{'role': 'user', 'content': prompt}])

    return jsonify({
        'label': label,
        'instruction': response['message']['content']
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
