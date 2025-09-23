import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireOrgAdmin } from '../middleware/orgAdmin';
import { createCodespace, deactivateCodespace, getCurrentCodespace, joinByCode } from '../controllers/codespaceController';

const router = Router();

// Admin-only
router.get('/current', authenticateToken, requireOrgAdmin, getCurrentCodespace);
router.post('/', authenticateToken, requireOrgAdmin, createCodespace);
router.post('/deactivate', authenticateToken, requireOrgAdmin, deactivateCodespace);

// Public (students)
router.post('/join', joinByCode);

export default router;
