#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 Firebase Setup Helper for EcoGame\n');

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists');
  console.log('If you\'re getting API key errors, please check your Firebase configuration.\n');
} else {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Firebase Configuration
# Replace these values with your actual Firebase project configuration
# Get these values from: https://console.firebase.google.com/

VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Instructions:
# 1. Go to https://console.firebase.google.com/
# 2. Create a new project or select existing one
# 3. Go to Project Settings > General > Your apps
# 4. Add a web app and copy the config values
# 5. Replace the placeholder values above with your actual config
# 6. Enable Authentication > Sign-in method > Email/Password
# 7. Restart your development server: npm run dev
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
}

console.log('\n📋 Next Steps:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project or select existing one');
console.log('3. Go to Project Settings > General > Your apps');
console.log('4. Add a web app and copy the config values');
console.log('5. Update the values in .env.local file');
console.log('6. Enable Authentication > Sign-in method > Email/Password');
console.log('7. Restart your development server: npm run dev');
console.log('\n📖 For detailed instructions, see FIREBASE_SETUP.md');
