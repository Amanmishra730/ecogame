"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const gameController_1 = require("../controllers/gameController");
const router = (0, express_1.Router)();
// Public routes
router.get('/leaderboard', gameController_1.getGameLeaderboard);
// Protected routes
router.post('/session', auth_1.authenticateToken, gameController_1.submitGameSession);
router.get('/history/user', auth_1.authenticateToken, gameController_1.getUserGameHistory);
exports.default = router;
//# sourceMappingURL=gameRoutes.js.map