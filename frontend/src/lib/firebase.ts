import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// For demo purposes, using a public demo project
// Replace with your own Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ecogame-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ecogame-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ecogame-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdefghijklmnopqrstuvwxyz"
};

// Show setup instructions if using demo config
if (firebaseConfig.apiKey === "AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz") {
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
export default app;
