"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
// Simple admin check using env var of comma-separated Firebase UIDs
const requireAdmin = (req, res, next) => {
    try {
        const uid = req.user?.uid;
        const allowed = (process.env.ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!uid || !allowed.includes(uid)) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        next();
    }
    catch (e) {
        res.status(500).json({ error: 'Admin check failed' });
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=admin.js.map