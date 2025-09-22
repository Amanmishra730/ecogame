"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserQuizHistory = exports.submitQuizAttempt = exports.exportQuizzesCsv = exports.approveQuestion = exports.updateQuiz = exports.createQuiz = exports.getQuizById = exports.getQuizzes = void 0;
const Quiz_1 = __importDefault(require("../models/Quiz"));
const QuizAttempt_1 = __importDefault(require("../models/QuizAttempt"));
const User_1 = __importDefault(require("../models/User"));
const json2csv_1 = require("json2csv");
const getQuizzes = async (req, res) => {
    try {
        const { category, difficulty, limit = 10, offset = 0, includeInactive } = req.query;
        const filter = { isActive: includeInactive ? { $in: [true, false] } : true };
        if (category)
            filter.category = category;
        if (difficulty)
            filter.difficulty = difficulty;
        const quizzes = await Quiz_1.default.find(filter)
            .select('title description category difficulty totalPoints timeLimit questions')
            .limit(Number(limit))
            .skip(Number(offset))
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: quizzes
        });
    }
    catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getQuizzes = getQuizzes;
const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz_1.default.findById(id).select('title description category difficulty totalPoints timeLimit questions');
        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        res.json({
            success: true,
            data: quiz
        });
    }
    catch (error) {
        console.error('Get quiz by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getQuizById = getQuizById;
const createQuiz = async (req, res) => {
    try {
        const body = req.body;
        const quiz = await Quiz_1.default.create(body);
        res.status(201).json({ success: true, data: quiz });
    }
    catch (error) {
        console.error('Create quiz error:', error);
        res.status(400).json({ error: 'Invalid quiz payload' });
    }
};
exports.createQuiz = createQuiz;
const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const quiz = await Quiz_1.default.findByIdAndUpdate(id, body, { new: true });
        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        res.json({ success: true, data: quiz });
    }
    catch (error) {
        console.error('Update quiz error:', error);
        res.status(400).json({ error: 'Invalid update payload' });
    }
};
exports.updateQuiz = updateQuiz;
const approveQuestion = async (req, res) => {
    try {
        const { quizId, questionIndex, approved } = req.body;
        const quiz = await Quiz_1.default.findById(quizId);
        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        if (!quiz.questions[questionIndex]) {
            res.status(400).json({ error: 'Question index out of range' });
            return;
        }
        quiz.questions[questionIndex].approved = approved;
        await quiz.save();
        res.json({ success: true, data: quiz.questions[questionIndex] });
    }
    catch (error) {
        console.error('Approve question error:', error);
        res.status(400).json({ error: 'Invalid request' });
    }
};
exports.approveQuestion = approveQuestion;
const exportQuizzesCsv = async (req, res) => {
    try {
        const quizzes = await Quiz_1.default.find({});
        const rows = quizzes.flatMap((q) => q.questions.map((question, idx) => ({
            quizId: q._id?.toString?.() ?? String(q.id ?? ''),
            title: q.title,
            category: q.category,
            difficulty: q.difficulty,
            questionIndex: idx,
            question: question.question,
            optionA: question.options[0],
            optionB: question.options[1],
            optionC: question.options[2],
            optionD: question.options[3],
            correctAnswer: question.correctAnswer,
            points: question.points,
            approved: question.approved ?? false
        })));
        const parser = new json2csv_1.Parser();
        const csv = parser.parse(rows);
        res.header('Content-Type', 'text/csv');
        res.attachment('quizzes.csv');
        res.send(csv);
    }
    catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ error: 'Failed to export CSV' });
    }
};
exports.exportQuizzesCsv = exportQuizzesCsv;
const submitQuizAttempt = async (req, res) => {
    try {
        const { quizId, answers } = req.body;
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        // Get the quiz to validate answers
        const quiz = await Quiz_1.default.findById(quizId);
        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        // Calculate score and XP
        let correctAnswers = 0;
        let totalScore = 0;
        const processedAnswers = answers.map((answer, index) => {
            const question = quiz.questions[index];
            const isCorrect = answer.selectedAnswer === question.correctAnswer;
            if (isCorrect) {
                correctAnswers++;
                totalScore += question.points;
            }
            return {
                questionId: question?._id?.toString?.() ?? String(index),
                selectedAnswer: answer.selectedAnswer,
                isCorrect,
                timeSpent: answer.timeSpent || 0
            };
        });
        const xpEarned = Math.floor(totalScore * 2); // 2 XP per point
        const timeSpent = answers.reduce((total, answer) => total + (answer.timeSpent || 0), 0);
        // Create quiz attempt record
        const quizAttempt = new QuizAttempt_1.default({
            userId: firebaseUid,
            quizId,
            answers: processedAnswers,
            score: totalScore,
            totalQuestions: quiz.questions.length,
            correctAnswers,
            timeSpent,
            completed: true,
            xpEarned
        });
        await quizAttempt.save();
        // Update user stats
        const user = await User_1.default.findOne({ firebaseUid });
        let newlyEarnedBadges = [];
        if (user) {
            const newXp = user.xp + xpEarned;
            const newLevel = Math.floor(newXp / 100) + 1;
            // Check for new badges
            const candidateBadges = [];
            if (user.completedQuizzes === 0) {
                candidateBadges.push('first_quiz');
            }
            if (correctAnswers === quiz.questions.length) {
                candidateBadges.push('quiz_master');
            }
            if (newLevel >= 10) {
                candidateBadges.push('level_10');
            }
            newlyEarnedBadges = candidateBadges.filter((badge) => !user.badges.includes(badge));
            const updatedBadges = [...user.badges, ...newlyEarnedBadges];
            await User_1.default.findByIdAndUpdate(user._id, {
                xp: newXp,
                level: newLevel,
                badges: updatedBadges,
                completedQuizzes: user.completedQuizzes + 1,
                lastActive: new Date()
            });
        }
        res.json({
            success: true,
            data: {
                score: totalScore,
                correctAnswers,
                totalQuestions: quiz.questions.length,
                xpEarned,
                timeSpent,
                newBadges: newlyEarnedBadges
            }
        });
    }
    catch (error) {
        console.error('Submit quiz attempt error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.submitQuizAttempt = submitQuizAttempt;
const getUserQuizHistory = async (req, res) => {
    try {
        const firebaseUid = req.user?.uid;
        const { limit = 10, offset = 0 } = req.query;
        if (!firebaseUid) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const attempts = await QuizAttempt_1.default.find({ userId: firebaseUid })
            .populate('quizId', 'title category difficulty')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(offset));
        res.json({
            success: true,
            data: attempts.map(attempt => ({
                id: attempt._id,
                quiz: attempt.quizId,
                score: attempt.score,
                correctAnswers: attempt.correctAnswers,
                totalQuestions: attempt.totalQuestions,
                xpEarned: attempt.xpEarned,
                timeSpent: attempt.timeSpent,
                completed: attempt.completed,
                createdAt: attempt.createdAt
            }))
        });
    }
    catch (error) {
        console.error('Get user quiz history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserQuizHistory = getUserQuizHistory;
//# sourceMappingURL=quizController.js.map