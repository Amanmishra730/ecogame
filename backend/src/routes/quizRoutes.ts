import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import {
  getQuizzes,
  getQuizById,
  submitQuizAttempt,
  getUserQuizHistory,
  createQuiz,
  updateQuiz,
  approveQuestion,
  exportQuizzesCsv
} from '../controllers/quizController';

const router = Router();

// Public routes
router.get('/', getQuizzes);
router.get('/:id', getQuizById);

// Protected routes
router.post('/attempt', authenticateToken, submitQuizAttempt);
router.get('/history/user', authenticateToken, getUserQuizHistory);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createQuiz);
router.put('/:id', authenticateToken, requireAdmin, updateQuiz);
router.post('/approve', authenticateToken, requireAdmin, approveQuestion);
router.get('/export/csv', authenticateToken, requireAdmin, exportQuizzesCsv);

export default router;
