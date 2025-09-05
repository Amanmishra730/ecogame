# EcoGame Backend API

A comprehensive backend API for the EcoGame application built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **User Management**: Firebase Authentication integration with user profiles and stats
- **Quiz System**: Dynamic quiz creation, submission, and scoring
- **Game Sessions**: Track game performance and achievements
- **Leaderboards**: Global and game-specific rankings
- **Data Analytics**: User progress tracking and statistics

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Firebase project with Admin SDK

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/ecogame

   # Firebase Admin Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   ```

3. **Database Setup:**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

4. **Firebase Setup:**
   - Create a Firebase project
   - Generate a service account key
   - Update Firebase configuration in `.env`

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Seed Database
```bash
npm run seed
```

## 📚 API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/users/profile` - Get user profile (Auth required)
- `POST /api/users/profile` - Create/update user profile (Auth required)
- `PUT /api/users/stats` - Update user statistics (Auth required)
- `GET /api/users/leaderboard` - Get global leaderboard

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes/attempt` - Submit quiz attempt (Auth required)
- `GET /api/quizzes/history/user` - Get user quiz history (Auth required)

### Games
- `POST /api/games/session` - Submit game session (Auth required)
- `GET /api/games/history/user` - Get user game history (Auth required)
- `GET /api/games/leaderboard` - Get game leaderboard

## 🔐 Authentication

The API uses Firebase Authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## 📊 Database Models

### User
- User profile and statistics
- XP, level, badges, and achievements
- Game and quiz history

### Quiz
- Quiz questions and answers
- Categories and difficulty levels
- Scoring system

### GameSession
- Game performance tracking
- Score and XP calculation
- Achievement system

### QuizAttempt
- Quiz submission records
- Answer tracking and scoring
- Performance analytics

## 🛡️ Security Features

- Firebase Authentication integration
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Rate limiting (configurable)

## 📈 Performance Features

- MongoDB indexing for optimal queries
- Efficient data aggregation
- Caching strategies
- Error handling and logging

## 🔧 Development

### Project Structure
```
src/
├── config/          # Database and Firebase configuration
├── controllers/     # Request handlers
├── middleware/      # Authentication and validation
├── models/          # Database schemas
├── routes/          # API route definitions
├── seed/            # Database seeding scripts
└── server.ts        # Main application file
```

### Adding New Features
1. Create model in `models/`
2. Add controller in `controllers/`
3. Define routes in `routes/`
4. Update main server file

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure MongoDB is running and connection string is correct
2. **Firebase Auth**: Verify service account key and project configuration
3. **CORS Issues**: Check frontend URL in CORS configuration

### Logs
- Development: Console logs with Morgan middleware
- Production: Structured logging recommended

## 📝 License

ISC License
