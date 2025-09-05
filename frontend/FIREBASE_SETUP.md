# Firebase Setup Guide

## 🔥 Quick Firebase Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `ecogame` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Enable **Phone** authentication (optional)
4. Save changes

### Step 3: Get Configuration Keys
1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Add app** → **Web app** (</> icon)
4. Register your app with name: `EcoGame Frontend`
5. Copy the configuration object

### Step 4: Create Environment File
Create a file named `.env.local` in the `frontend` directory with:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-actual-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 5: Test Configuration
1. Restart your development server: `npm run dev`
2. Check browser console for any errors
3. Try logging in with a test account

## 🔧 Troubleshooting

### Common Issues:
- **API Key Error**: Make sure `.env.local` file exists and has correct values
- **CORS Error**: Add your domain to Firebase authorized domains
- **Phone Auth Error**: Enable phone authentication in Firebase console

### Example Configuration:
```env
VITE_FIREBASE_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_AUTH_DOMAIN=ecogame-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ecogame-12345
VITE_FIREBASE_STORAGE_BUCKET=ecogame-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnopqrstuvwxyz
```

## 📱 Phone Authentication Setup (Optional)

If you want to use phone authentication:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Phone** authentication
3. Add your domain to authorized domains
4. Test with a real phone number

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Keep your Firebase API keys secure
- Use Firebase Security Rules for database protection
