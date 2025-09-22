import { Request, Response } from 'express';
import Codespace from '../models/Codespace';

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

    const now = new Date();
    const cs = await Codespace.findOne({ adminUserId, active: true, expiresAt: { $gt: now } })
      .sort({ createdAt: -1 })
      .lean();
    if (!cs) return res.status(404).json({ error: 'No active codespace' });
    res.json(cs);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to fetch codespace' });
  }
};

export const createCodespace = async (req: Request, res: Response) => {
  try {
    const adminUserId = (req as any).user?.uid;
    if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });

    const { quizId, ttlMinutes } = req.body || {};
    const ttl = Math.min(Math.max(parseInt(ttlMinutes || '120', 10), 5), 24 * 60); // 5 mins to 24h
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    // Deactivate previous active ones for this admin
    await Codespace.updateMany({ adminUserId, active: true }, { $set: { active: false } });

    // Generate a unique code
    let code = generateCode();
    for (let i = 0; i < 5; i++) {
      const exists = await Codespace.findOne({ code }).lean();
      if (!exists) break;
      code = generateCode();
    }

    const created = await Codespace.create({ code, adminUserId, quizId, active: true, expiresAt });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to create codespace' });
  }
};

export const deactivateCodespace = async (req: Request, res: Response) => {
  try {
    const adminUserId = (req as any).user?.uid;
    if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });

    await Codespace.updateMany({ adminUserId, active: true }, { $set: { active: false } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to deactivate codespace' });
  }
};

export const joinByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const cs = await Codespace.findOne({ code: String(code).toUpperCase(), active: true }).lean();
    if (!cs) return res.status(404).json({ error: 'Invalid code' });

    if (new Date(cs.expiresAt).getTime() <= Date.now()) {
      return res.status(410).json({ error: 'Code expired' });
    }

    // Optionally: include quiz metadata later
    res.json({ codespace: cs });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to join by code' });
  }
};
