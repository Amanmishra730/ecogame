import { Request, Response } from 'express';
import GameSession from '../models/GameSession';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

export const submitGameSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { gameType, score, duration, level, gameData, achievements } = req.body;
    const firebaseUid = req.user?.uid;

    if (!firebaseUid) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Calculate XP based on score and game type
    let xpEarned = Math.floor(score * 1.5); // Base XP calculation
    
    // Bonus XP for achievements
    if (achievements && achievements.length > 0) {
      xpEarned += achievements.length * 10;
    }

    // Create game session record
    const gameSession = new GameSession({
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
    const user = await User.findOne({ firebaseUid });
    if (user) {
      const newXp = user.xp + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      // Check for new badges
      const newBadges = [...user.badges];
      if (gameType === 'waste-sorting' && !newBadges.includes('waste_sorter')) {
        newBadges.push('waste_sorter');
      }
      if (gameType === 'water-simulator' && !newBadges.includes('water_saver')) {
        newBadges.push('water_saver');
      }
      if (score >= 90 && !newBadges.includes('eco_warrior')) {
        newBadges.push('eco_warrior');
      }
      if (newLevel >= 25 && !newBadges.includes('level_25')) {
        newBadges.push('level_25');
      }

      await User.findByIdAndUpdate(user._id, {
        xp: newXp,
        level: newLevel,
        badges: newBadges,
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
        newBadges: user ? newBadges.filter(badge => !user.badges.includes(badge)) : []
      }
    });
  } catch (error) {
    console.error('Submit game session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserGameHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const { gameType, limit = 10, offset = 0 } = req.query;

    if (!firebaseUid) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const filter: any = { userId: firebaseUid };
    if (gameType) filter.gameType = gameType;

    const sessions = await GameSession.find(filter)
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
  } catch (error) {
    console.error('Get user game history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGameLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameType, limit = 10, offset = 0 } = req.query;

    const filter: any = { completed: true };
    if (gameType) filter.gameType = gameType;

    const sessions = await GameSession.find(filter)
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
  } catch (error) {
    console.error('Get game leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
