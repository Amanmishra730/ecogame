"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const quizController_1 = require("../controllers/quizController");
const router = (0, express_1.Router)();
// Public routes
router.get('/', quizController_1.getQuizzes);
router.get('/:id', quizController_1.getQuizById);
// Protected routes
router.post('/attempt', auth_1.authenticateToken, quizController_1.submitQuizAttempt);
router.get('/history/user', auth_1.authenticateToken, quizController_1.getUserQuizHistory);
// Admin routes
router.post('/', auth_1.authenticateToken, admin_1.requireAdmin, quizController_1.createQuiz);
router.put('/:id', auth_1.authenticateToken, admin_1.requireAdmin, quizController_1.updateQuiz);
router.delete('/:id', auth_1.authenticateToken, admin_1.requireAdmin, quizController_1.deleteQuiz);
router.get('/my-quizzes', auth_1.authenticateToken, admin_1.requireAdmin, quizController_1.getQuizzesByCreator);
router.post('/approve', auth_1.authenticateToken, admin_1.requireAdmin, quizController_1.approveQuestion);
router.get('/export/csv', auth_1.authenticateToken, admin_1.requireAdmin, quizController_1.exportQuizzesCsv);
exports.default = router;
//# sourceMappingURL=quizRoutes.js.map