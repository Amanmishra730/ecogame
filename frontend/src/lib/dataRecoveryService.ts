import { UserProgressService, UserProgress } from './userProgressService';

export class DataRecoveryService {
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
      const localProgress = localStorage.getItem(`userProgress_${userId}`);
      if (localProgress) {
        const parsedProgress = JSON.parse(localProgress);
        console.log('✅ Recovered progress from localStorage:', parsedProgress);
        
        // Save to Firebase to restore it
        try {
          await UserProgressService.updateUserProgress(userId, parsedProgress);
          console.log('✅ Progress restored to Firebase');
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
      await UserProgressService.updateUserProgress(userId, progress);
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
