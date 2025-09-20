import { UserProgressService, UserProgress } from './userProgressService';

export class DataRecoveryService {
  static getLocalBackup(userId: string): UserProgress | null {
    try {
      const local = localStorage.getItem(`userProgress_${userId}`);
      return local ? (JSON.parse(local) as UserProgress) : null;
    } catch {
      return null;
    }
  }

  static hasPotentialLoss(current: UserProgress, backup: UserProgress): boolean {
    // Show recovery only if backup has strictly higher meaningful stats
    if (!backup) return false;
    return (
      (backup.xp ?? 0) > (current.xp ?? 0) ||
      (backup.completedQuizzes ?? 0) > (current.completedQuizzes ?? 0) ||
      (backup.gamesPlayed ?? 0) > (current.gamesPlayed ?? 0) ||
      (backup.level ?? 1) > (current.level ?? 1)
    );
  }

  static async recoverUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      console.log('🔍 Attempting to recover user progress for:', userId);
      
      // Get both Firebase and localStorage data
      let firebaseProgress: UserProgress | null = null;
      let localProgress: UserProgress | null = null;
      
      // Try to get progress from Firebase
      try {
        firebaseProgress = await UserProgressService.getUserProgress(userId);
        console.log('📊 Firebase progress:', firebaseProgress);
      } catch (firebaseError) {
        console.warn('⚠️ Firebase failed:', firebaseError);
      }
      
      // Try to get progress from localStorage
      try {
        localProgress = this.getLocalBackup(userId);
        console.log('💾 Local progress:', localProgress);
      } catch (localError) {
        console.warn('⚠️ Local storage failed:', localError);
      }
      
      // Determine the best data to use
      let bestProgress: UserProgress | null = null;
      let dataSource = 'none';
      
      if (firebaseProgress && localProgress) {
        // Both exist - use the one with higher XP/level
        if (firebaseProgress.xp >= localProgress.xp && firebaseProgress.level >= localProgress.level) {
          bestProgress = firebaseProgress;
          dataSource = 'firebase';
        } else {
          bestProgress = localProgress;
          dataSource = 'local';
        }
        console.log(`🔄 Using ${dataSource} data (Firebase: ${firebaseProgress.xp} XP, Local: ${localProgress.xp} XP)`);
      } else if (firebaseProgress) {
        bestProgress = firebaseProgress;
        dataSource = 'firebase';
        console.log('✅ Using Firebase data');
      } else if (localProgress) {
        bestProgress = localProgress;
        dataSource = 'local';
        console.log('✅ Using local data');
      }
      
      if (!bestProgress) {
        console.log('❌ No progress found for recovery');
        return null;
      }
      
      // Ensure data consistency - merge the best data
      const mergedProgress: UserProgress = {
        ...bestProgress,
        userId, // Ensure userId is correct
        updatedAt: new Date().toISOString()
      };
      
      // If we used local data, try to sync it back to Firebase
      if (dataSource === 'local' && firebaseProgress === null) {
        try {
          console.log('🔄 Syncing local data to Firebase...');
          const { userId: _uid, createdAt: _created, ...updates } = mergedProgress;
          await UserProgressService.createUserProgress(userId, mergedProgress.displayName);
          await UserProgressService.updateUserProgress(userId, updates);
          console.log('✅ Local data synced to Firebase');
        } catch (syncError) {
          console.warn('⚠️ Could not sync to Firebase, but local data is available:', syncError);
        }
      }
      
      // Always backup the merged data to localStorage
      await this.backupUserProgress(userId, mergedProgress);
      
      console.log('✅ Data recovery successful:', mergedProgress);
      return mergedProgress;
    } catch (error) {
      console.error('❌ Error during data recovery:', error);
      return null;
    }
  }

  static async backupUserProgress(userId: string, progress: UserProgress): Promise<void> {
    try {
      // Save to localStorage as backup
      localStorage.setItem(`userProgress_${userId}`, JSON.stringify(progress));
      console.log('💾 Progress backed up to localStorage');
    } catch (error) {
      console.error('❌ Error backing up progress:', error);
    }
  }

  static async syncProgressToFirebase(userId: string, progress: UserProgress): Promise<void> {
    try {
      const existing = await UserProgressService.getUserProgress(userId);
      const { userId: _uid, createdAt: _created, ...updates } = progress;
      if (!existing) {
        await UserProgressService.createUserProgress(userId, progress.displayName);
        await UserProgressService.updateUserProgress(userId, updates);
      } else {
        await UserProgressService.updateUserProgress(userId, updates);
      }
      console.log('🔄 Progress synced to Firebase');
    } catch (error) {
      console.error('❌ Error syncing to Firebase:', error);
      throw error;
    }
  }

  static async forceSyncFromFirebase(userId: string): Promise<UserProgress | null> {
    try {
      console.log('🔄 Force syncing from Firebase for:', userId);
      
      // Get Firebase data
      const firebaseProgress = await UserProgressService.getUserProgress(userId);
      
      if (firebaseProgress) {
        // Update localStorage with Firebase data
        await this.backupUserProgress(userId, firebaseProgress);
        console.log('✅ Force sync completed - Firebase data:', firebaseProgress);
        return firebaseProgress;
      } else {
        console.log('❌ No data found in Firebase');
        return null;
      }
    } catch (error) {
      console.error('❌ Error during force sync:', error);
      return null;
    }
  }

  static async smartSync(userId: string): Promise<UserProgress | null> {
    try {
      console.log('🧠 Smart sync for user:', userId);
      
      // Get both data sources
      let firebaseProgress: UserProgress | null = null;
      let localProgress: UserProgress | null = null;
      
      try {
        firebaseProgress = await UserProgressService.getUserProgress(userId);
      } catch (error) {
        console.warn('Firebase unavailable during smart sync:', error);
      }
      
      try {
        localProgress = this.getLocalBackup(userId);
      } catch (error) {
        console.warn('Local storage unavailable during smart sync:', error);
      }
      
      // Smart merge logic
      if (firebaseProgress && localProgress) {
        // Both exist - merge the best parts
        const mergedProgress: UserProgress = {
          ...firebaseProgress, // Start with Firebase as base
          // Use local data if it's higher
          xp: Math.max(firebaseProgress.xp, localProgress.xp),
          level: Math.max(firebaseProgress.level, localProgress.level),
          badges: Math.max(firebaseProgress.badges, localProgress.badges),
          completedQuizzes: Math.max(firebaseProgress.completedQuizzes, localProgress.completedQuizzes),
          gamesPlayed: Math.max(firebaseProgress.gamesPlayed, localProgress.gamesPlayed),
          streak: Math.max(firebaseProgress.streak, localProgress.streak),
          // Use the most recent achievements
          achievements: firebaseProgress.achievements.length >= localProgress.achievements.length 
            ? firebaseProgress.achievements 
            : localProgress.achievements,
          updatedAt: new Date().toISOString()
        };
        
        // Sync merged data to Firebase
        try {
          const { userId: _uid, createdAt: _created, ...updates } = mergedProgress;
          await UserProgressService.updateUserProgress(userId, updates);
          console.log('✅ Smart sync: Merged data synced to Firebase');
        } catch (error) {
          console.warn('⚠️ Could not sync merged data to Firebase:', error);
        }
        
        // Backup merged data locally
        await this.backupUserProgress(userId, mergedProgress);
        
        return mergedProgress;
      } else if (firebaseProgress) {
        // Only Firebase exists
        await this.backupUserProgress(userId, firebaseProgress);
        return firebaseProgress;
      } else if (localProgress) {
        // Only local exists - try to sync to Firebase
        try {
          const { userId: _uid, createdAt: _created, ...updates } = localProgress;
          await UserProgressService.createUserProgress(userId, localProgress.displayName);
          await UserProgressService.updateUserProgress(userId, updates);
          console.log('✅ Smart sync: Local data synced to Firebase');
        } catch (error) {
          console.warn('⚠️ Could not sync local data to Firebase:', error);
        }
        return localProgress;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error during smart sync:', error);
      return null;
    }
  }
}
