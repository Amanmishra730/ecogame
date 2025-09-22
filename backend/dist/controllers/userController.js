"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = exports.updateUserStats = exports.createOrUpdateUser = exports.getUserProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const getUserProfile = async (req, res) => {
    try {
        const user = await User_1.default.findOne({ firebaseUid: req.user?.uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                firebaseUid: user.firebaseUid,
                email: user.email,
                displayName: user.displayName,
                phoneNumber: user.phoneNumber,
                xp: user.xp,
                level: user.level,
                badges: user.badges,
                completedQuizzes: user.completedQuizzes,
                gamesPlayed: user.gamesPlayed,
                streak: user.streak,
                lastActive: user.lastActive
            }
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUserProfile = getUserProfile;
const createOrUpdateUser = async (req, res) => {
    try {
        const { email, displayName, phoneNumber } = req.body;
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const userData = {
            firebaseUid,
            email: email || req.user?.email,
            displayName: displayName || req.user?.displayName,
            phoneNumber: phoneNumber || req.user?.phoneNumber,
            lastActive: new Date()
        };
        const user = await User_1.default.findOneAndUpdate({ firebaseUid }, userData, { upsert: true, new: true, runValidators: true });
        res.json({
            success: true,
            data: {
                id: user._id,
                firebaseUid: user.firebaseUid,
                email: user.email,
                displayName: user.displayName,
                phoneNumber: user.phoneNumber,
                xp: user.xp,
                level: user.level,
                badges: user.badges,
                completedQuizzes: user.completedQuizzes,
                gamesPlayed: user.gamesPlayed,
                streak: user.streak
            }
        });
    }
    catch (error) {
        console.error('Create/update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createOrUpdateUser = createOrUpdateUser;
const updateUserStats = async (req, res) => {
    try {
        const { xp, level, badges, completedQuizzes, gamesPlayed, streak } = req.body;
        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const updateData = { lastActive: new Date() };
        if (xp !== undefined)
            updateData.xp = xp;
        if (level !== undefined)
            updateData.level = level;
        if (badges !== undefined)
            updateData.badges = badges;
        if (completedQuizzes !== undefined)
            updateData.completedQuizzes = completedQuizzes;
        if (gamesPlayed !== undefined)
            updateData.gamesPlayed = gamesPlayed;
        if (streak !== undefined)
            updateData.streak = streak;
        const user = await User_1.default.findOneAndUpdate({ firebaseUid }, updateData, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({
            success: true,
            data: {
                xp: user.xp,
                level: user.level,
                badges: user.badges,
                completedQuizzes: user.completedQuizzes,
                gamesPlayed: user.gamesPlayed,
                streak: user.streak
            }
        });
    }
    catch (error) {
        console.error('Update user stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateUserStats = updateUserStats;
const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const users = await User_1.default.find({})
            .select('displayName email xp level badges')
            .sort({ xp: -1, level: -1 })
            .limit(Number(limit))
            .skip(Number(offset));
        res.json({
            success: true,
            data: users.map((user, index) => ({
                rank: Number(offset) + index + 1,
                displayName: user.displayName || user.email,
                xp: user.xp,
                level: user.level,
                badges: user.badges
            }))
        });
    }
    catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getLeaderboard = getLeaderboard;
//# sourceMappingURL=userController.js.map