#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🔥 Firebase Authentication Setup for EcoGame\n');

console.log('📋 Before we start, make sure you have:');
console.log('1. Created a Firebase project at https://console.firebase.google.com/');
console.log('2. Enabled Authentication > Email/Password in Firebase Console');
console.log('3. Got your Firebase configuration from Project Settings\n');

const setupFirebase = async () => {
  try {
    console.log('Please enter your Firebase configuration values:\n');
    
    const apiKey = await question('API Key: ');
    const authDomain = await question('Auth Domain (e.g., your-project.firebaseapp.com): ');
    const projectId = await question('Project ID: ');
    const storageBucket = await question('Storage Bucket (e.g., your-project.appspot.com): ');
    const messagingSenderId = await question('Messaging Sender ID: ');
    const appId = await question('App ID: ');

    const envContent = `# Firebase Configuration
VITE_FIREBASE_API_KEY=${apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain}
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
VITE_FIREBASE_APP_ID=${appId}
`;

    const envPath = path.join(__dirname, '.env.local');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Firebase configuration saved to .env.local');
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Open http://localhost:5173 in your browser');
    console.log('3. Try logging in with email/password');
    console.log('\n📖 For detailed instructions, see FIREBASE_SETUP.md');

  } catch (error) {
    console.error('❌ Error setting up Firebase:', error.message);
  } finally {
    rl.close();
  }
};

setupFirebase();
