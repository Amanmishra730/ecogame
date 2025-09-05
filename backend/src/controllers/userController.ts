import { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ firebaseUid: req.user?.uid });
    
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
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createOrUpdateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      userData,
      { upsert: true, new: true, runValidators: true }
    );

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
  } catch (error) {
    console.error('Create/update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { xp, level, badges, completedQuizzes, gamesPlayed, streak } = req.body;
    const firebaseUid = req.user?.uid;

    if (!firebaseUid) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const updateData: any = { lastActive: new Date() };
    
    if (xp !== undefined) updateData.xp = xp;
    if (level !== undefined) updateData.level = level;
    if (badges !== undefined) updateData.badges = badges;
    if (completedQuizzes !== undefined) updateData.completedQuizzes = completedQuizzes;
    if (gamesPlayed !== undefined) updateData.gamesPlayed = gamesPlayed;
    if (streak !== undefined) updateData.streak = streak;

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      updateData,
      { new: true, runValidators: true }
    );

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
  } catch (error) {
    console.error('Update user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const users = await User.find({})
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
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
