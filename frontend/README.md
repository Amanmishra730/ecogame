# EcoGame Frontend

A modern, interactive environmental education game built with React, TypeScript, and Firebase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Set up Firebase (required for authentication)
npm run setup-firebase

# Start development server
npm run dev
```

## 🔥 Firebase Setup

The app requires Firebase for authentication. Follow these steps:

### Option 1: Quick Setup (Demo Mode)
The app comes with demo Firebase configuration that works out of the box for testing.

### Option 2: Your Own Firebase Project
1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication → Email/Password

2. **Get Configuration:**
   - Go to Project Settings → General → Your apps
   - Add a web app and copy the config

3. **Create Environment File:**
   Create `.env.local` in the frontend directory:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Restart the server:**
   ```bash
   npm run dev
   ```

For detailed instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 🎮 Features

- **Authentication**: Email/phone login with Firebase
- **Interactive Games**: Waste sorting, water simulation
- **Quiz System**: Environmental knowledge tests
- **Progress Tracking**: XP, levels, badges, achievements
- **Leaderboards**: Global and game-specific rankings
- **Responsive Design**: Works on all devices

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run setup-firebase` - Firebase setup helper

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...             # Feature components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── pages/              # Page components
└── main.tsx           # App entry point
```

## 🔧 Troubleshooting

### Common Issues

**Firebase API Key Error:**
- Make sure `.env.local` exists with correct values
- Check Firebase project settings
- Verify authentication is enabled

**CORS Errors:**
- Add your domain to Firebase authorized domains
- Check CORS configuration in backend

**Build Errors:**
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify all dependencies are installed

## 📱 Mobile Support

The app is fully responsive and works on:
- Desktop browsers
- Mobile phones
- Tablets
- Progressive Web App (PWA) ready

## 🎨 UI Components

Built with:
- **shadcn/ui** - Modern component library
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Radix UI** - Accessible primitives

## 🔒 Security

- Firebase Authentication
- Secure API endpoints
- Input validation
- CORS protection
- Environment variable protection

## 📈 Performance

- Vite for fast development
- Code splitting
- Lazy loading
- Optimized builds
- Efficient re-renders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review Firebase setup
3. Check browser console for errors
4. Create an issue with detailed information