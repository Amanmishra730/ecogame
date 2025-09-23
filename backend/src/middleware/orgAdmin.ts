import { Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { AuthenticatedRequest } from './auth';

// Role-based admin check: reads Firestore userRoles/{uid}
// Expected document shape: { role: 'admin'|'teacher'|'student', orgType: 'school'|'college'|'ngo', orgId?: string }
// Allows access when role==='admin' and orgType in allowed set.
// Fallback: if no doc, use legacy env ADMIN_UIDS list.
export const requireOrgAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const db = admin.firestore();
    const docRef = db.doc(`userRoles/${uid}`);
    const snap = await docRef.get();
    if (snap.exists) {
      const data = snap.data() as any;
      const { role, orgType } = data || {};
      const allowedTypes = ['school', 'college', 'ngo'];
      if ((role === 'admin' || role === 'teacher') && allowedTypes.includes(orgType)) {
        (req as any).orgContext = { orgType, ...data };
        return next();
      }
      res.status(403).json({ error: 'Teacher/Admin access required for organization' });
      return;
    }

    // Fallback to legacy env list
    const allowed = (process.env.ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allowed.includes(uid)) {
      return next();
    }

    res.status(403).json({ error: 'Admin access required' });
  } catch (e) {
    console.error('orgAdmin check failed', e);
    res.status(500).json({ error: 'Admin check failed' });
  }
};
