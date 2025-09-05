# 🔥 Firebase Authentication Setup Guide

## Quick Setup (Recommended)

### Step 1: Run the Interactive Setup
```bash
cd frontend
npm run setup-auth
```

This will guide you through entering your Firebase configuration values.

### Step 2: Manual Setup (Alternative)

1. **Create Firebase Project**:
   - Go to https://console.firebase.google.com/
   - Click "Create a project"
   - Enter project name: `ecogame`
   - Enable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication**:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password** authentication
   - Enable **Phone** authentication (optional)
   - Click "Save"

3. **Get Configuration**:
   - Go to **Project Settings** (gear icon)
   - Scroll to **Your apps** section
   - Click **Add app** → **Web app** (</> icon)
   - App nickname: `EcoGame Frontend`
   - Click "Register app"
   - Copy the configuration object

4. **Create Environment File**:
   - Create a file called `.env.local` in the `frontend` directory
   - Copy the content from `firebase-config-template.txt`
   - Replace the placeholder values with your actual Firebase config

## Configuration Values

Your `.env.local` file should look like this:

```env
VITE_FIREBASE_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnopqrstuvwxyz
```

## Testing Authentication

1. **Start the development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open your browser** to http://localhost:5173

3. **Test the login form**:
   - Try registering with a new email/password
   - Try logging in with existing credentials
   - Test phone authentication (if enabled)

## Troubleshooting

### Common Issues

**"Firebase: Error (auth/api-key-not-valid)"**
- Check that your `.env.local` file exists
- Verify the API key is correct
- Make sure you're using the web app configuration

**"Firebase: Error (auth/operation-not-allowed)"**
- Enable Email/Password authentication in Firebase Console
- Go to Authentication → Sign-in method → Email/Password → Enable

**"Firebase: Error (auth/invalid-email)"**
- Check email format
- Make sure the email is valid

**"Firebase: Error (auth/weak-password)"**
- Password must be at least 6 characters
- Try a stronger password

### Debug Steps

1. **Check browser console** for error messages
2. **Verify Firebase configuration** in `.env.local`
3. **Check Firebase Console** for authentication settings
4. **Restart development server** after configuration changes

## Security Notes

- Never commit `.env.local` to version control
- Keep your Firebase API keys secure
- Use Firebase Security Rules for database protection
- Enable only necessary authentication methods

## Next Steps

Once authentication is working:

1. **Test user registration and login**
2. **Try the interactive games**
3. **Test the quiz system**
4. **Check progress tracking**
5. **Verify leaderboards**

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review Firebase Console settings
3. Check browser console for errors
4. Verify all configuration values are correct

---

**Happy coding! 🚀**
