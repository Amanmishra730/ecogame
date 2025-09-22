import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { createCodespace, deactivateCodespace, getCurrentCodespace, joinByCode } from '../controllers/codespaceController';

const router = Router();

// Admin-only
router.get('/current', authenticateToken, requireAdmin, getCurrentCodespace);
router.post('/', authenticateToken, requireAdmin, createCodespace);
router.post('/deactivate', authenticateToken, requireAdmin, deactivateCodespace);

// Public (students)
router.post('/join', joinByCode);

export default router;
