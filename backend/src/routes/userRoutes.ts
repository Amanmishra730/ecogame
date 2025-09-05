import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUserProfile,
  createOrUpdateUser,
  updateUserStats,
  getLeaderboard
} from '../controllers/userController';

const router = Router();

// Public routes
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.get('/profile', authenticateToken, getUserProfile);
router.post('/profile', authenticateToken, createOrUpdateUser);
router.put('/stats', authenticateToken, updateUserStats);

export default router;
