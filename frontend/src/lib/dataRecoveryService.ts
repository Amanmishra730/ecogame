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
      
      // Try to get progress from Firebase
      const firebaseProgress = await UserProgressService.getUserProgress(userId);
      if (firebaseProgress) {
        console.log('✅ Recovered progress from Firebase:', firebaseProgress);
        return firebaseProgress;
      }
      
      // Try to get progress from localStorage
      const localProgress = this.getLocalBackup(userId);
      if (localProgress) {
        const parsedProgress = localProgress;
        console.log('✅ Recovered progress from localStorage:', parsedProgress);
        
        // Save to Firebase to restore it (upsert)
        try {
          const existing = await UserProgressService.getUserProgress(userId);
          const { userId: _uid, createdAt: _created, ...updates } = parsedProgress as UserProgress;
          if (!existing) {
            await UserProgressService.createUserProgress(userId, parsedProgress.displayName);
            await UserProgressService.updateUserProgress(userId, updates);
            console.log('✅ Progress created and restored to Firebase');
          } else {
            await UserProgressService.updateUserProgress(userId, updates);
            console.log('✅ Progress restored to Firebase');
          }
        } catch (error) {
          console.warn('⚠️ Could not restore to Firebase, but local data is available');
        }
        
        return parsedProgress;
      }
      
      console.log('❌ No progress found for recovery');
      return null;
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
      const progress = await UserProgressService.getUserProgress(userId);
      
      if (progress) {
        // Update localStorage with Firebase data
        localStorage.setItem(`userProgress_${userId}`, JSON.stringify(progress));
        console.log('✅ Force sync completed');
        return progress;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error during force sync:', error);
      return null;
    }
  }
}
