"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// Public routes
router.get('/leaderboard', userController_1.getLeaderboard);
// Protected routes
router.get('/profile', auth_1.authenticateToken, userController_1.getUserProfile);
router.post('/profile', auth_1.authenticateToken, userController_1.createOrUpdateUser);
router.put('/stats', auth_1.authenticateToken, userController_1.updateUserStats);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map