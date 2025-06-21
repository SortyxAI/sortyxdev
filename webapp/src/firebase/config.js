import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace these with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBpJEQ_uKzti4x1Vmz6RyBvUu4z5ld9kek",
  authDomain: "sortyx-f21e5.firebaseapp.com",
  projectId: "sortyx-f21e5",
  storageBucket: "sortyx-f21e5.firebasestorage.app",
  messagingSenderId: "26265181198",
  appId: "1:26265181198:web:2af04860dbd6fab8f1b05f",
  measurementId: "G-J8BFS640Y0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 