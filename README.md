# 🌱 EcoGame - Environmental Education Platform

A comprehensive environmental education platform with interactive games, quizzes, and progress tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Firebase project (for authentication)

### Option 1: One-Click Start (Windows)
```bash
# Run the startup script
start-servers.bat
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
ecogame/
├── frontend/           # React + TypeScript frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── contexts/   # React contexts
│   │   ├── lib/        # Utilities
│   │   └── pages/      # Page components
│   └── package.json
├── backend/            # Node.js + Express API
│   ├── src/
│   │   ├── controllers/ # API controllers
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   └── middleware/ # Auth middleware
│   └── package.json
└── README.md
```

## 🔥 Firebase Setup

### Quick Setup
```bash
cd frontend
npm run setup-firebase
```

### Manual Setup
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication → Email/Password
3. Create `.env.local` in frontend directory:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

## 🗄️ Database Setup

### MongoDB Local
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

### MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

## 🎮 Features

### Frontend
- **Authentication**: Email/phone login with Firebase
- **Interactive Games**: 
  - Waste Sorting Game
  - Water Conservation Simulator
  - Energy Challenge
- **Quiz System**: Environmental knowledge tests
- **Progress Tracking**: XP, levels, badges, achievements
- **Leaderboards**: Global and game-specific rankings
- **Responsive Design**: Works on all devices

### Backend
- **RESTful API**: Complete CRUD operations
- **User Management**: Profiles, stats, achievements
- **Game Analytics**: Performance tracking
- **Quiz System**: Dynamic quiz creation and scoring
- **Leaderboards**: Real-time rankings
- **Security**: Firebase Auth, CORS, input validation

## 🛠️ Development

### Frontend Commands
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run setup-firebase # Firebase setup helper
```

### Backend Commands
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
npm run seed         # Seed database with sample data
```

## 📊 API Endpoints

### Health Check
- `GET /health` - Server status

### Users
- `GET /api/users/profile` - Get user profile
- `POST /api/users/profile` - Create/update profile
- `PUT /api/users/stats` - Update user stats
- `GET /api/users/leaderboard` - Global leaderboard

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes/attempt` - Submit quiz attempt
- `GET /api/quizzes/history/user` - User quiz history

### Games
- `POST /api/games/session` - Submit game session
- `GET /api/games/history/user` - User game history
- `GET /api/games/leaderboard` - Game leaderboard

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ecogame
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

## 🐛 Troubleshooting

### Common Issues

**Firebase API Key Error:**
- Check `.env.local` file exists
- Verify Firebase project configuration
- Enable Authentication in Firebase console

**Database Connection Error:**
- Ensure MongoDB is running
- Check connection string
- Verify network access

**CORS Errors:**
- Check frontend URL in backend CORS config
- Verify Firebase authorized domains

**Build Errors:**
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify all dependencies

## 📱 Mobile Support

- Responsive design
- Touch-friendly interfaces
- Progressive Web App (PWA) ready
- Works on all screen sizes

## 🎨 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui (components)
- Firebase Auth
- React Router

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Firebase Admin SDK
- CORS + Helmet (security)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter issues:
1. Check troubleshooting section
2. Review setup guides
3. Check browser console
4. Create issue with details

---

**Happy Learning! 🌱♻️💧**