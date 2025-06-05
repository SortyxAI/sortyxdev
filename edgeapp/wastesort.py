import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel, QVBoxLayout, QWidget
from PyQt5.QtGui import QImage, QPixmap, QFont
from PyQt5.QtCore import QTimer, Qt
import cv2
from ultralytics import YOLO
import numpy as np
from picamera2 import Picamera2
import picamera2.array

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("SORTYX Waste Classifier")
        self.setGeometry(100, 100, 800, 600)
        self.setStyleSheet("background-color: #f0f0f0;")

        # Initialize camera
        self.camera = picamera2.PiCamera()
        self.camera.resolution = (640, 480)
        self.stream = picamera2.array.PiRGBArray(self.camera)

        # Load YOLOv8n classification model
        self.model = YOLO('yolov8n-cls.pt')  # Replace with actual model path

        # Set up UI
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.layout = QVBoxLayout(self.central_widget)

        # Image display
        self.image_label = QLabel()
        self.image_label.setAlignment(Qt.AlignCenter)
        self.layout.addWidget(self.image_label)

        # Classification result
        self.result_label = QLabel("Classification: Waiting...")
        self.result_label.setFont(QFont("Arial", 24, QFont.Bold))
        self.result_label.setStyleSheet("""
            color: #ffffff;
            background-color: #4CAF50;
            padding: 10px;
            border-radius: 5px;
        """)
        self.result_label.setAlignment(Qt.AlignCenter)
        self.layout.addWidget(self.result_label)

        # Sensor data
        self.sensor_label = QLabel("Sensor Data: N/A")
        self.sensor_label.setFont(QFont("Arial", 18))
        self.sensor_label.setStyleSheet("""
            color: #ffffff;
            background-color: #2196F3;
            padding: 8px;
            border-radius: 5px;
        """)
        self.sensor_label.setAlignment(Qt.AlignCenter)
        self.layout.addWidget(self.sensor_label)

        # Timer for updating sensor data
        self.sensor_timer = QTimer()
        self.sensor_timer.timeout.connect(self.update_sensor_data)
        self.sensor_timer.start(500)  # Update every 500 ms

        # Timer for checking object proximity
        self.proximity_timer = QTimer()
        self.proximity_timer.timeout.connect(self.check_proximity_and_capture)
        self.proximity_timer.start(1000)  # Check every 1000 ms

    def update_sensor_data(self):
        # Simulate receiving multiple sensor data (replace with actual sensor logic)
        sensor_values = {
            "Temperature": np.random.randint(20, 30),
            "Humidity": np.random.randint(40, 60),
            "Proximity": np.random.randint(0, 100)
        }

        # Update sensor data in the UI
        sensor_text = "\n".join([f"{key}: {value}" for key, value in sensor_values.items()])
        self.sensor_label.setText(f"Sensor Data:\n{sensor_text}")

    def check_proximity_and_capture(self):
        # Simulate proximity sensor logic (replace with actual proximity sensor logic)
        proximity_value = np.random.randint(0, 100)
        if proximity_value < 20:  # Trigger capture if object is close
            self.capture_and_classify()

    def capture_and_classify(self):
        try:
            # Capture frame
            self.stream.seek(0)
            self.stream.truncate()
            self.camera.capture(self.stream, format='bgr', use_video_port=True)
            frame = self.stream.array

            # Convert to RGB and resize for inference
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            small_frame = cv2.resize(rgb_frame, (224, 224))

            # Run YOLOv8 classification
            results = self.model(small_frame)
            pred = results[0].probs.top1
            class_name = results[0].names[pred]

            # Update classification result
            self.result_label.setText(f"Classification: {class_name}")
            if class_name.lower() == "recyclable":
                self.result_label.setStyleSheet("""
                    color: #ffffff;
                    background-color: #4CAF50;
                    padding: 10px;
                    border-radius: 5px;
                """)
            else:
                self.result_label.setStyleSheet("""
                    color: #ffffff;
                    background-color: #F44336;
                    padding: 10px;
                    border-radius: 5px;
                """)

            # Display frame
            h, w, ch = rgb_frame.shape
            bytes_per_line = ch * w
            qimg = QImage(rgb_frame.data, w, h, bytes_per_line, QImage.Format_RGB888)
            self.image_label.setPixmap(QPixmap.fromImage(qimg).scaled(640, 480, Qt.KeepAspectRatio))

        except Exception as e:
            self.result_label.setText(f"Error: {str(e)}")

    def closeEvent(self, event):
        self.camera.close()
        event.accept()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())