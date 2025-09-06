import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// For demo purposes, using a public demo project
// Replace with your own Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBvOkBw3cLxZ6Q1w2E3fR4tY5uI6oP7aS8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ecogame-demo-12345.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ecogame-demo-12345",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ecogame-demo-12345.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "987654321098",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:987654321098:web:abcdefghijklmnopqrstuvwxyz123"
};

// Show setup instructions if using demo config
if (firebaseConfig.apiKey === "AIzaSyBvOkBw3cLxZ6Q1w2E3fR4tY5uI6oP7aS8") {
  console.warn('⚠️  Using demo Firebase configuration');
  console.warn('📝 To use your own Firebase project:');
  console.warn('1. Create a .env.local file in the frontend directory');
  console.warn('2. Add your Firebase config values');
  console.warn('3. See FIREBASE_SETUP.md for detailed instructions');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
