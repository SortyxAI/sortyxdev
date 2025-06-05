# EcoSort - Waste Classification App

EcoSort is an interactive web application that uses real-time object detection to identify waste items and classify them into appropriate disposal categories. The app gamifies the experience of learning proper waste sorting practices, contributing to environmental sustainability efforts.

## Features

- Real-time object detection and classification
- Intuitive user interface with visual feedback
- Educational information about waste categories
- Gamification elements with points and streaks
- Nature-themed visuals to reinforce eco-friendly messaging

## Technologies Used

- React 18 for the user interface
- Framer Motion for smooth animations
- Tailwind CSS for styling
- React Webcam for camera access
- React Confetti for reward animations
- Express for the backend server

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. To run the backend server (in a separate terminal):
   ```
   npm run server
   ```

## How It Works

1. The app accesses the device camera to scan waste items
2. When the user captures an image, it's sent to the backend for classification
3. The app displays the predicted waste category
4. The user confirms or corrects the classification
5. If correct, the user earns points and a reward animation is displayed
6. The interaction helps users learn proper waste sorting practices

## License

This project is licensed under the MIT License - see the LICENSE file for details