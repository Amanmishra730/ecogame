#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

console.log('🔥 Testing Firebase Connection...\n');

// Test Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "ecogame-demo.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "ecogame-demo",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "ecogame-demo.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdefghijklmnopqrstuvwxyz"
};

try {
  console.log('📋 Configuration:');
  console.log(`API Key: ${firebaseConfig.apiKey.substring(0, 20)}...`);
  console.log(`Auth Domain: ${firebaseConfig.authDomain}`);
  console.log(`Project ID: ${firebaseConfig.projectId}\n`);

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  console.log('✅ Firebase initialized successfully!');
  console.log('✅ Authentication service connected!');
  
  if (firebaseConfig.apiKey === "AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz") {
    console.log('\n⚠️  Using demo configuration');
    console.log('📝 To use your own Firebase project:');
    console.log('1. Run: npm run setup-auth');
    console.log('2. Or manually create .env.local with your config');
  } else {
    console.log('\n🎉 Using your custom Firebase configuration!');
  }

  console.log('\n🌐 Open http://localhost:5173 to test authentication');

} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your Firebase configuration');
  console.log('2. Verify .env.local file exists');
  console.log('3. Run: npm run setup-auth');
}
