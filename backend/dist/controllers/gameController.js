"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameLeaderboard = exports.getUserGameHistory = exports.submitGameSession = void 0;
const GameSession_1 = __importDefault(require("../models/GameSession"));
const User_1 = __importDefault(require("../models/User"));
const submitGameSession = async (req, res) => {
    try {
        const { gameType, score, duration, level, gameData, achievements } = req.body;
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        // Calculate XP based on score and game type
        let xpEarned = Math.floor(score * 1.5); // Base XP calculation
        if (gameType === 'ar-waste') {
            xpEarned = Math.floor(score * 1.8);
        }
        if (gameType === 'ar-tree') {
            // Flat reward baseline for scans
            xpEarned = Math.max(10, Math.floor(score * 1.2));
        }
        // Bonus XP for achievements
        if (achievements && achievements.length > 0) {
            xpEarned += achievements.length * 10;
        }
        // Create game session record
        const gameSession = new GameSession_1.default({
            userId: firebaseUid,
            gameType,
            score,
            xpEarned,
            duration,
            level,
            completed: true,
            achievements: achievements || [],
            gameData: gameData || {}
        });
        await gameSession.save();
        // Update user stats
        const user = await User_1.default.findOne({ firebaseUid });
        let newlyEarnedBadges = [];
        if (user) {
            const newXp = user.xp + xpEarned;
            const newLevel = Math.floor(newXp / 100) + 1;
            // Check for new badges
            const candidateBadges = [];
            if (gameType === 'waste-sorting')
                candidateBadges.push('waste_sorter');
            if (gameType === 'water-simulator')
                candidateBadges.push('water_saver');
            if (gameType === 'ar-waste')
                candidateBadges.push('ar_waste_ranger');
            if (gameType === 'ar-tree')
                candidateBadges.push('tree_spotter');
            if (score >= 90)
                candidateBadges.push('eco_warrior');
            if (newLevel >= 25)
                candidateBadges.push('level_25');
            newlyEarnedBadges = candidateBadges.filter((badge) => !user.badges.includes(badge));
            const updatedBadges = [...user.badges, ...newlyEarnedBadges];
            await User_1.default.findByIdAndUpdate(user._id, {
                xp: newXp,
                level: newLevel,
                badges: updatedBadges,
                gamesPlayed: user.gamesPlayed + 1,
                lastActive: new Date()
            });
        }
        res.json({
            success: true,
            data: {
                sessionId: gameSession._id,
                score,
                xpEarned,
                newLevel: user ? Math.floor((user.xp + xpEarned) / 100) + 1 : 1,
                achievements: achievements || [],
                newBadges: newlyEarnedBadges
            }
        });
    }
    catch (error) {
        console.error('Submit game session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.submitGameSession = submitGameSession;
const getUserGameHistory = async (req, res) => {
    try {
        const firebaseUid = req.user?.uid;
        const { gameType, limit = 10, offset = 0 } = req.query;
        if (!firebaseUid) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const filter = { userId: firebaseUid };
        if (gameType)
            filter.gameType = gameType;
        const sessions = await GameSession_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(offset));
        res.json({
            success: true,
            data: sessions.map(session => ({
                id: session._id,
                gameType: session.gameType,
                score: session.score,
                xpEarned: session.xpEarned,
                duration: session.duration,
                level: session.level,
                completed: session.completed,
                achievements: session.achievements,
                gameData: session.gameData,
                createdAt: session.createdAt
            }))
        });
    }
    catch (error) {
        console.error('Get user game history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserGameHistory = getUserGameHistory;
const getGameLeaderboard = async (req, res) => {
    try {
        const { gameType, limit = 10, offset = 0 } = req.query;
        const filter = { completed: true };
        if (gameType)
            filter.gameType = gameType;
        const sessions = await GameSession_1.default.find(filter)
            .populate('userId', 'displayName email')
            .sort({ score: -1 })
            .limit(Number(limit))
            .skip(Number(offset));
        res.json({
            success: true,
            data: sessions.map((session, index) => ({
                rank: Number(offset) + index + 1,
                displayName: session.userId?.displayName || session.userId?.email || 'Anonymous',
                gameType: session.gameType,
                score: session.score,
                xpEarned: session.xpEarned,
                duration: session.duration,
                level: session.level,
                achievements: session.achievements,
                createdAt: session.createdAt
            }))
        });
    }
    catch (error) {
        console.error('Get game leaderboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getGameLeaderboard = getGameLeaderboard;
//# sourceMappingURL=gameController.js.map