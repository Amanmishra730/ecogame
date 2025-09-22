"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const codespaceController_1 = require("../controllers/codespaceController");
const router = (0, express_1.Router)();
// Admin-only
router.get('/current', auth_1.authenticateToken, admin_1.requireAdmin, codespaceController_1.getCurrentCodespace);
router.post('/', auth_1.authenticateToken, admin_1.requireAdmin, codespaceController_1.createCodespace);
router.post('/deactivate', auth_1.authenticateToken, admin_1.requireAdmin, codespaceController_1.deactivateCodespace);
// Public (students)
router.post('/join', codespaceController_1.joinByCode);
exports.default = router;
//# sourceMappingURL=codespaceRoutes.js.map