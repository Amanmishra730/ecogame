"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinByCode = exports.deactivateCodespace = exports.createCodespace = exports.getCurrentCodespace = void 0;
const Codespace_1 = __importDefault(require("../models/Codespace"));
function generateCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // avoid confusing chars
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}
const getCurrentCodespace = async (req, res) => {
    try {
        const adminUserId = req.user?.uid;
        if (!adminUserId)
            return res.status(401).json({ error: 'Unauthorized' });
        const now = new Date();
        const cs = await Codespace_1.default.findOne({ adminUserId, active: true, expiresAt: { $gt: now } })
            .sort({ createdAt: -1 })
            .lean();
        if (!cs)
            return res.status(404).json({ error: 'No active codespace' });
        res.json(cs);
    }
    catch (e) {
        res.status(500).json({ error: e.message || 'Failed to fetch codespace' });
    }
};
exports.getCurrentCodespace = getCurrentCodespace;
const createCodespace = async (req, res) => {
    try {
        const adminUserId = req.user?.uid;
        if (!adminUserId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { quizId, ttlMinutes } = req.body || {};
        const ttl = Math.min(Math.max(parseInt(ttlMinutes || '120', 10), 5), 24 * 60); // 5 mins to 24h
        const expiresAt = new Date(Date.now() + ttl * 60 * 1000);
        // Deactivate previous active ones for this admin
        await Codespace_1.default.updateMany({ adminUserId, active: true }, { $set: { active: false } });
        // Generate a unique code
        let code = generateCode();
        for (let i = 0; i < 5; i++) {
            const exists = await Codespace_1.default.findOne({ code }).lean();
            if (!exists)
                break;
            code = generateCode();
        }
        const created = await Codespace_1.default.create({ code, adminUserId, quizId, active: true, expiresAt });
        res.status(201).json(created);
    }
    catch (e) {
        res.status(500).json({ error: e.message || 'Failed to create codespace' });
    }
};
exports.createCodespace = createCodespace;
const deactivateCodespace = async (req, res) => {
    try {
        const adminUserId = req.user?.uid;
        if (!adminUserId)
            return res.status(401).json({ error: 'Unauthorized' });
        await Codespace_1.default.updateMany({ adminUserId, active: true }, { $set: { active: false } });
        res.json({ success: true });
    }
    catch (e) {
        res.status(500).json({ error: e.message || 'Failed to deactivate codespace' });
    }
};
exports.deactivateCodespace = deactivateCodespace;
const joinByCode = async (req, res) => {
    try {
        const { code } = req.body || {};
        if (!code)
            return res.status(400).json({ error: 'Code is required' });
        const cs = await Codespace_1.default.findOne({ code: String(code).toUpperCase(), active: true }).lean();
        if (!cs)
            return res.status(404).json({ error: 'Invalid code' });
        if (new Date(cs.expiresAt).getTime() <= Date.now()) {
            return res.status(410).json({ error: 'Code expired' });
        }
        // Optionally: include quiz metadata later
        res.json({ codespace: cs });
    }
    catch (e) {
        res.status(500).json({ error: e.message || 'Failed to join by code' });
    }
};
exports.joinByCode = joinByCode;
//# sourceMappingURL=codespaceController.js.map