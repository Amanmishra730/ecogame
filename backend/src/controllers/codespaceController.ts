import { Request, Response } from 'express';
import admin from 'firebase-admin';

function generateCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // avoid confusing chars
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const getCurrentCodespace = async (req: Request, res: Response) => {
  try {
    const adminUserId = (req as any).user?.uid;
    if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });

    const db = admin.firestore();
    const snap = await db
      .collection('codespaces')
      .where('adminUserId', '==', adminUserId)
      .where('active', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snap.empty) return res.status(404).json({ error: 'No active codespace' });
    const doc = snap.docs[0];
    const data = doc.data();

    const expiresAtVal = (data.expiresAt as admin.firestore.Timestamp)?.toDate?.() || (data.expiresAt ? new Date(data.expiresAt) : null);
    if (expiresAtVal && expiresAtVal.getTime() <= Date.now()) {
      return res.status(404).json({ error: 'No active codespace' });
    }

    res.json({
      _id: doc.id,
      code: data.code,
      adminUserId: data.adminUserId,
      quizId: data.quizId,
      active: data.active,
      name: data.name || null,
      expiresAt: expiresAtVal ? expiresAtVal.toISOString() : null,
      createdAt: ((data.createdAt as admin.firestore.Timestamp)?.toDate?.() || new Date()).toISOString(),
      updatedAt: ((data.updatedAt as admin.firestore.Timestamp)?.toDate?.() || new Date()).toISOString(),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to fetch codespace' });
  }
};

export const createCodespace = async (req: Request, res: Response) => {
  try {
    const adminUserId = (req as any).user?.uid;
    if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });

    const { quizId, ttlMinutes, permanent, name } = req.body || {};
    const isPermanent = Boolean(permanent);
    const ttl = isPermanent ? null : Math.min(Math.max(parseInt(ttlMinutes || '120', 10), 5), 24 * 60); // 5 mins to 24h
    const expiresAt = isPermanent ? null : new Date(Date.now() + (ttl as number) * 60 * 1000);

    const db = admin.firestore();

    // Deactivate previous active ones for this admin
    const activeSnap = await db
      .collection('codespaces')
      .where('adminUserId', '==', adminUserId)
      .where('active', '==', true)
      .get();
    const batch = db.batch();
    activeSnap.docs.forEach((d) => batch.update(d.ref, { active: false, updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
    if (!activeSnap.empty) await batch.commit();

    // Generate a unique code
    let code = generateCode();
    for (let i = 0; i < 5; i++) {
      const exists = await db.collection('codespaces').where('code', '==', code).limit(1).get();
      if (exists.empty) break;
      code = generateCode();
    }

    const nowTs = admin.firestore.FieldValue.serverTimestamp();
    const expiresTs = expiresAt ? admin.firestore.Timestamp.fromDate(expiresAt) : null;
    const docRef = await db.collection('codespaces').add({
      code,
      adminUserId,
      quizId: quizId || null,
      active: true,
      name: name || null,
      expiresAt: expiresTs,
      createdAt: nowTs,
      updatedAt: nowTs,
    });

    const createdDoc = await docRef.get();
    const created = createdDoc.data()!;
    res.status(201).json({
      _id: docRef.id,
      code: created.code,
      adminUserId: created.adminUserId,
      quizId: created.quizId || undefined,
      active: created.active,
      name: created.name || null,
      expiresAt: created.expiresAt ? ((created.expiresAt as admin.firestore.Timestamp).toDate()).toISOString() : null,
      createdAt: ((created.createdAt as admin.firestore.Timestamp)?.toDate?.() || new Date()).toISOString(),
      updatedAt: ((created.updatedAt as admin.firestore.Timestamp)?.toDate?.() || new Date()).toISOString(),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to create codespace' });
  }
};

export const deactivateCodespace = async (req: Request, res: Response) => {
  try {
    const adminUserId = (req as any).user?.uid;
    if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });

    const db = admin.firestore();
    const snap = await db
      .collection('codespaces')
      .where('adminUserId', '==', adminUserId)
      .where('active', '==', true)
      .get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { active: false, updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
    if (!snap.empty) await batch.commit();

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to deactivate codespace' });
  }
};

export const joinByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const db = admin.firestore();
    const snap = await db
      .collection('codespaces')
      .where('code', '==', String(code).toUpperCase())
      .where('active', '==', true)
      .limit(1)
      .get();

    if (snap.empty) return res.status(404).json({ error: 'Invalid code' });
    const doc = snap.docs[0];
    const data = doc.data();
    const expiresAtVal = (data.expiresAt as admin.firestore.Timestamp)?.toDate?.() || (data.expiresAt ? new Date(data.expiresAt) : null);
    if (expiresAtVal && expiresAtVal.getTime() <= Date.now()) {
      return res.status(410).json({ error: 'Code expired' });
    }

    // Optionally: include quiz metadata later
    res.json({
      codespace: {
        _id: doc.id,
        code: data.code,
        adminUserId: data.adminUserId,
        quizId: data.quizId || undefined,
        active: data.active,
        name: data.name || null,
        expiresAt: expiresAtVal ? expiresAtVal.toISOString() : null,
        createdAt: ((data.createdAt as admin.firestore.Timestamp)?.toDate?.() || new Date()).toISOString(),
        updatedAt: ((data.updatedAt as admin.firestore.Timestamp)?.toDate?.() || new Date()).toISOString(),
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to join by code' });
  }
};
