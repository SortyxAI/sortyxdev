import cv2
import requests
import time

# URL of the Flask app's prediction endpoint
FLASK_URL = "http://127.0.0.1:5000/classify"

# Try multiple camera indices if the default one fails
for index in range(3):
    camera = cv2.VideoCapture(index)
    if camera.isOpened():
        print(f"Camera initialized with index {index}.")
        break
else:
    print("Error: Could not access any camera. Please check your system settings.")
    exit()

print("Press 'q' to quit.")

while True:
    ret, frame = camera.read()
    if not ret:
        print("Error: Failed to capture image.")
        break

    # Display the captured frame
    cv2.imshow("Camera", frame)

    # Detect objects in the frame (using a placeholder for now)
    # You can integrate YOLO or another object detection model here
    detected_object = "placeholder_object"  # Replace with actual detection logic
    confidence = 0.85  # Placeholder confidence value
    confidence = int(confidence * 100)  # Convert to percentage
    confidence = min(max(confidence, 0), 100)  # Ensure confidence is between 0 and 100
    print(f"Detected: {detected_object} with confidence: {confidence}%")
    # Check if the label is empty or None
    if not detected_object:
        print("Error: No label detected.")
        continue
    # Check if the confidence is within a valid range
    if confidence < 0 or confidence > 100:
        print("Error: Invalid confidence level.")
        continue
    # Check if the label is a string
    if not isinstance(detected_object, str):
        print("Error: Detected object is not a string.")
        continue

    # Draw a rectangle around the detected object (placeholder coordinates)
    # Replace with actual bounding box coordinates from the detection model
    cv2.rectangle(frame, (50, 50), (200, 200), (0, 255, 0), 2)
    cv2.putText(frame, detected_object, (50, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    cv2.putText(frame, f"Confidence: {confidence}%", (50, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    # Show the frame with the detected object
    cv2.imshow("Detected Object", frame)
    # Save the frame to a file (optional)
    cv2.imwrite("detected_frame.jpg", frame)
    # Convert the frame to a format suitable for sending to the Flask app
    # Resize the frame to a smaller size for faster processing
    frame = cv2.resize(frame, (640, 480))  # Resize to 640x480 for example
    # Encode the frame as JPEG
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # Convert to RGB if needed

    # Convert the frame to a binary stream
    _, buffer = cv2.imencode('.jpg', frame)
    files = {'image': ('image.jpg', buffer.tobytes(), 'image/jpeg')}

    # Send the image to the Flask app for prediction
    try:
        response = requests.post(FLASK_URL, files=files)
        if response.status_code == 200:
            print("Prediction:", response.json())
        else:
            print("Error from server:", response.json())
    except Exception as e:
        print("Error sending image to server:", e)

    # Wait for a short period before capturing the next frame
    time.sleep(2)

    # Exit on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the camera and close all OpenCV windows
camera.release()
cv2.destroyAllWindows()