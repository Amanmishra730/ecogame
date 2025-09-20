import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from './AuthContext';
import { UserProgressService, UserProgress } from '../lib/userProgressService';
import { DataRecoveryService } from '../lib/dataRecoveryService';

interface UserProgressContextType {
  userProgress: UserProgress | null;
  loading: boolean;
  error: string | null;
  addXP: (amount: number) => Promise<void>;
  completeQuiz: (score: number) => Promise<void>;
  completeGame: (score: number) => Promise<void>;
  updateStreak: () => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
};

interface UserProgressProviderProps {
  children: React.ReactNode;
}

export const UserProgressProvider: React.FC<UserProgressProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProgress = async (user: User) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading user progress for user:', user.uid);
      
      // Use the improved recovery service that handles both Firebase and localStorage
      const progress = await DataRecoveryService.recoverUserProgress(user.uid);
      
      if (progress) {
        console.log('✅ User progress loaded successfully:', progress);
        setUserProgress(progress);
        setLoading(false);
        return;
      }
      
      // If no progress found anywhere, create new progress
      console.log('No existing progress found, creating new user progress');
      const defaultProgress = {
        userId: user.uid,
        displayName: user.displayName || undefined,
        xp: 0,
        level: 1,
        badges: 0,
        completedQuizzes: 0,
        gamesPlayed: 0,
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        achievements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Try to create in Firebase first
      try {
        const createdProgress = await UserProgressService.createUserProgress(user.uid, user.displayName || undefined);
        console.log('✅ New progress created in Firebase:', createdProgress);
        setUserProgress(createdProgress);
        await DataRecoveryService.backupUserProgress(user.uid, createdProgress);
      } catch (firebaseError) {
        console.warn('⚠️ Could not create in Firebase, using local only:', firebaseError);
        setUserProgress(defaultProgress);
        await DataRecoveryService.backupUserProgress(user.uid, defaultProgress);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading user progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user progress');
      
      // Last resort - create local-only progress
      const defaultProgress = {
        userId: user.uid,
        displayName: user.displayName || undefined,
        xp: 0,
        level: 1,
        badges: 0,
        completedQuizzes: 0,
        gamesPlayed: 0,
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        achievements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUserProgress(defaultProgress);
      localStorage.setItem(`userProgress_${user.uid}`, JSON.stringify(defaultProgress));
      setLoading(false);
    }
  };

  const addXP = async (amount: number) => {
    if (!currentUser || !userProgress) return;
    
    // Update local state immediately for better responsiveness
    const newXP = userProgress.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    const updatedProgress = {
      ...userProgress,
      xp: newXP,
      level: newLevel
    };
    
    // Update UI immediately
    setUserProgress(updatedProgress);
    await DataRecoveryService.backupUserProgress(currentUser.uid, updatedProgress);
    
    // Handle Firebase sync in the background
    try {
      await UserProgressService.addXP(currentUser.uid, amount);
    } catch (err) {
      console.error('Error syncing XP with Firebase:', err);
      // Progress is already saved locally, so we don't need to do anything else
    }
  };

  const completeQuiz = async (score: number) => {
    if (!currentUser || !userProgress) return;
    
    // Update local state immediately for better responsiveness
    const xpGained = score * 20;
    const newXP = userProgress.xp + xpGained;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    const updatedProgress = {
      ...userProgress,
      xp: newXP,
      level: newLevel,
      completedQuizzes: userProgress.completedQuizzes + 1
    };
    
    // Update UI immediately
    setUserProgress(updatedProgress);
    await DataRecoveryService.backupUserProgress(currentUser.uid, updatedProgress);
    
    // Handle Firebase sync in the background
    try {
      await UserProgressService.completeQuiz(currentUser.uid, score);
    } catch (err) {
      console.error('Error syncing quiz with Firebase:', err);
      // Progress is already saved locally, so we don't need to do anything else
    }
  };

  const completeGame = async (score: number) => {
    if (!currentUser || !userProgress) return;
    
    // Update local state immediately for better responsiveness
    const newXP = userProgress.xp + score;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    const updatedProgress = {
      ...userProgress,
      xp: newXP,
      level: newLevel,
      gamesPlayed: userProgress.gamesPlayed + 1
    };
    
    // Update UI immediately
    setUserProgress(updatedProgress);
    await DataRecoveryService.backupUserProgress(currentUser.uid, updatedProgress);
    
    // Handle Firebase sync in the background
    try {
      await UserProgressService.completeGame(currentUser.uid, score);
    } catch (err) {
      console.error('Error syncing with Firebase:', err);
      // Progress is already saved locally, so we don't need to do anything else
    }
  };

  const updateStreak = async () => {
    if (!currentUser || !userProgress) return;
    
    try {
      await UserProgressService.updateStreak(currentUser.uid);
      
      // Update local state
      const today = new Date().toISOString().split('T')[0];
      const lastActive = userProgress.lastActiveDate;
      
      let newStreak = userProgress.streak;
      
      if (lastActive === today) {
        if (newStreak === 0) {
          newStreak = 1;
        }
      } else if (lastActive !== today) {
        if (lastActive === new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }
      
      setUserProgress(prev => prev ? {
        ...prev,
        streak: newStreak,
        lastActiveDate: today
      } : null);
    } catch (err) {
      console.error('Error updating streak:', err);
      setError(err instanceof Error ? err.message : 'Failed to update streak');
    }
  };

  const refreshProgress = async () => {
    if (currentUser) {
      await loadUserProgress(currentUser);
    }
  };

  useEffect(() => {
    if (currentUser) {
      // Load user progress without timeout to prevent data loss
      loadUserProgress(currentUser);
    } else {
      setUserProgress(null);
      setLoading(false);
      setError(null);
    }
  }, [currentUser]);

  const value: UserProgressContextType = {
    userProgress,
    loading,
    error,
    addXP,
    completeQuiz,
    completeGame,
    updateStreak,
    refreshProgress
  };

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
};
