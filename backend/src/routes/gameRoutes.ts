import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  submitGameSession,
  getUserGameHistory,
  getGameLeaderboard
} from '../controllers/gameController';

const router = Router();

// Public routes
router.get('/leaderboard', getGameLeaderboard);

// Protected routes
router.post('/session', authenticateToken, submitGameSession);
router.get('/history/user', authenticateToken, getUserGameHistory);

export default router;
