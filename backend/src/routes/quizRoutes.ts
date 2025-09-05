import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getQuizzes,
  getQuizById,
  submitQuizAttempt,
  getUserQuizHistory
} from '../controllers/quizController';

const router = Router();

// Public routes
router.get('/', getQuizzes);
router.get('/:id', getQuizById);

// Protected routes
router.post('/attempt', authenticateToken, submitQuizAttempt);
router.get('/history/user', authenticateToken, getUserQuizHistory);

export default router;
