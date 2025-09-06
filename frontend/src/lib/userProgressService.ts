import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export interface UserProgress {
  userId: string;
  displayName?: string;
  xp: number;
  level: number;
  badges: number;
  completedQuizzes: number;
  gamesPlayed: number;
  streak: number;
  lastActiveDate: string;
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  date: string | null;
}

const DEFAULT_PROGRESS: Omit<UserProgress, 'userId' | 'createdAt' | 'updatedAt'> = {
  xp: 0,
  level: 1,
  badges: 0,
  completedQuizzes: 0,
  gamesPlayed: 0,
  streak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  achievements: []
};

export class UserProgressService {
  private static getProgressDocRef(userId: string) {
    return doc(db, 'userProgress', userId);
  }

  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const progressRef = this.getProgressDocRef(userId);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        return progressSnap.data() as UserProgress;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  static async createUserProgress(userId: string, displayName?: string): Promise<UserProgress> {
    try {
      const now = new Date().toISOString();
      const progressData: UserProgress = {
        userId,
        displayName,
        ...DEFAULT_PROGRESS,
        createdAt: now,
        updatedAt: now
      };

      const progressRef = this.getProgressDocRef(userId);
      await setDoc(progressRef, progressData);
      
      return progressData;
    } catch (error) {
      console.error('Error creating user progress:', error);
      throw error;
    }
  }

  static async updateUserProgress(
    userId: string, 
    updates: Partial<Omit<UserProgress, 'userId' | 'createdAt'>>
  ): Promise<void> {
    try {
      const progressRef = this.getProgressDocRef(userId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(progressRef, updateData);
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  static async addXP(userId: string, xpAmount: number): Promise<{ newLevel: number; totalXP: number }> {
    try {
      const currentProgress = await this.getUserProgress(userId);
      if (!currentProgress) {
        throw new Error('User progress not found');
      }

      const newXP = currentProgress.xp + xpAmount;
      const newLevel = Math.floor(newXP / 100) + 1;
      
      await this.updateUserProgress(userId, {
        xp: newXP,
        level: newLevel
      });

      return { newLevel, totalXP: newXP };
    } catch (error) {
      console.error('Error adding XP:', error);
      throw error;
    }
  }

  static async completeQuiz(userId: string, score: number): Promise<void> {
    try {
      const xpGained = score * 20;
      const currentProgress = await this.getUserProgress(userId);
      if (!currentProgress) {
        throw new Error('User progress not found');
      }

      const newXP = currentProgress.xp + xpGained;
      const newLevel = Math.floor(newXP / 100) + 1;

      await this.updateUserProgress(userId, {
        xp: newXP,
        level: newLevel,
        completedQuizzes: currentProgress.completedQuizzes + 1
      });
    } catch (error) {
      console.error('Error completing quiz:', error);
      throw error;
    }
  }

  static async completeGame(userId: string, score: number): Promise<void> {
    try {
      const currentProgress = await this.getUserProgress(userId);
      if (!currentProgress) {
        throw new Error('User progress not found');
      }

      const newXP = currentProgress.xp + score;
      const newLevel = Math.floor(newXP / 100) + 1;

      await this.updateUserProgress(userId, {
        xp: newXP,
        level: newLevel,
        gamesPlayed: currentProgress.gamesPlayed + 1
      });
    } catch (error) {
      console.error('Error completing game:', error);
      throw error;
    }
  }

  static async updateStreak(userId: string): Promise<void> {
    try {
      const currentProgress = await this.getUserProgress(userId);
      if (!currentProgress) {
        throw new Error('User progress not found');
      }

      const today = new Date().toISOString().split('T')[0];
      const lastActive = currentProgress.lastActiveDate;
      
      let newStreak = currentProgress.streak;
      
      if (lastActive === today) {
        // Already updated today, no change needed
        return;
      } else if (lastActive === new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
        // Consecutive day, increment streak
        newStreak += 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }

      await this.updateUserProgress(userId, {
        streak: newStreak,
        lastActiveDate: today
      });
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  static async getLeaderboard(limit: number = 10): Promise<UserProgress[]> {
    try {
      const progressRef = collection(db, 'userProgress');
      const q = query(progressRef);
      const querySnapshot = await getDocs(q);
      
      const allProgress = querySnapshot.docs.map(doc => doc.data() as UserProgress);
      
      // Sort by XP descending and return top users
      return allProgress
        .sort((a, b) => b.xp - a.xp)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  static async ensureUserProgress(userId: string, displayName?: string): Promise<UserProgress> {
    try {
      let progress = await this.getUserProgress(userId);
      
      if (!progress) {
        console.log('No existing progress found, creating new user progress for:', userId);
        progress = await this.createUserProgress(userId, displayName);
      } else {
        console.log('Found existing progress for user:', userId, 'XP:', progress.xp, 'Level:', progress.level);
        
        // Update displayName if it's provided and different
        if (displayName && progress.displayName !== displayName) {
          console.log('Updating display name from', progress.displayName, 'to', displayName);
          await this.updateUserProgress(userId, { displayName });
          progress.displayName = displayName;
        }
      }
      
      return progress;
    } catch (error) {
      console.error('Error ensuring user progress:', error);
      throw error;
    }
  }
}
