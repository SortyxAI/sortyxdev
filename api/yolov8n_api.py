# yolov8_api.py
from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
from PIL import Image
import io

model = YOLO("yolov8n.pt")  # or path to your trained model
app = FastAPI()

@app.post("/classify/")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    results = model(image)
    output = results[0].boxes.cls.cpu().numpy().tolist()
    return {"classes": output}