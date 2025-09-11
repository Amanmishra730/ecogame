import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

// Simple admin check using env var of comma-separated Firebase UIDs
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const uid = req.user?.uid;
    const allowed = (process.env.ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!uid || !allowed.includes(uid)) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  } catch (e) {
    res.status(500).json({ error: 'Admin check failed' });
  }
};


