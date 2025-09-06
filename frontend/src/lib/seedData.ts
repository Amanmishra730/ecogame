import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import { UserProgress } from './userProgressService';

// Sample users for leaderboard testing
const sampleUsers: Omit<UserProgress, 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    displayName: 'Alex Green',
    xp: 2850,
    level: 28,
    badges: 12,
    completedQuizzes: 25,
    gamesPlayed: 18,
    streak: 15,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ['first-quiz', 'quiz-master', 'waste-expert', 'streak-7']
  },
  {
    displayName: 'Maya Chen',
    xp: 2720,
    level: 27,
    badges: 11,
    completedQuizzes: 22,
    gamesPlayed: 16,
    streak: 12,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ['first-quiz', 'quiz-master', 'waste-expert']
  },
  {
    displayName: 'Jamie Wilson',
    xp: 2680,
    level: 26,
    badges: 10,
    completedQuizzes: 20,
    gamesPlayed: 15,
    streak: 18,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ['first-quiz', 'quiz-master', 'streak-7']
  },
  {
    displayName: 'Sam Rodriguez',
    xp: 2540,
    level: 25,
    badges: 9,
    completedQuizzes: 18,
    gamesPlayed: 14,
    streak: 8,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ['first-quiz', 'waste-expert']
  },
  {
    displayName: 'Taylor Kim',
    xp: 2480,
    level: 24,
    badges: 8,
    completedQuizzes: 16,
    gamesPlayed: 13,
    streak: 22,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ['first-quiz', 'streak-7']
  },
  {
    displayName: 'Jordan Lee',
    xp: 2340,
    level: 23,
    badges: 8,
    completedQuizzes: 15,
    gamesPlayed: 12,
    streak: 5,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ['first-quiz']
  },
  {
    displayName: 'Casey Park',
    xp: 2280,
    level: 22,
    badges: 7,
    completedQuizzes: 14,
    gamesPlayed: 11,
    streak: 9,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ['first-quiz']
  },
  {
    displayName: 'Riley Davis',
    xp: 2150,
    level: 21,
    badges: 6,
    completedQuizzes: 13,
    gamesPlayed: 10,
    streak: 14,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ['first-quiz']
  },
  {
    displayName: 'Morgan Smith',
    xp: 2020,
    level: 20,
    badges: 5,
    completedQuizzes: 12,
    gamesPlayed: 9,
    streak: 7,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ['first-quiz']
  },
  {
    displayName: 'Eco Warrior',
    xp: 1890,
    level: 18,
    badges: 4,
    completedQuizzes: 10,
    gamesPlayed: 8,
    streak: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: ['first-quiz']
  }
];

export class SeedDataService {
  static async seedSampleUsers(): Promise<void> {
    try {
      console.log('🌱 Starting to seed sample users...');
      
      // Check if users already exist
      const existingUsers = await getDocs(query(collection(db, 'userProgress'), limit(1)));
      if (!existingUsers.empty) {
        console.log('📊 Sample users already exist, skipping seed...');
        return;
      }

      // Create sample users
      for (let i = 0; i < sampleUsers.length; i++) {
        const user = sampleUsers[i];
        const userId = `sample_user_${i + 1}`;
        const now = new Date().toISOString();
        
        const userProgress: UserProgress = {
          userId,
          ...user,
          createdAt: now,
          updatedAt: now
        };

        const userRef = doc(db, 'userProgress', userId);
        await setDoc(userRef, userProgress);
        console.log(`✅ Created user: ${user.displayName} (${user.xp} XP)`);
      }

      console.log('🎉 Successfully seeded sample users!');
    } catch (error) {
      console.error('❌ Error seeding sample users:', error);
      throw error;
    }
  }

  static async clearSampleUsers(): Promise<void> {
    try {
      console.log('🗑️ Clearing sample users...');
      
      const usersRef = collection(db, 'userProgress');
      const querySnapshot = await getDocs(usersRef);
      
      const deletePromises = querySnapshot.docs.map(doc => {
        if (doc.id.startsWith('sample_user_')) {
          return doc.ref.delete();
        }
        return Promise.resolve();
      });
      
      await Promise.all(deletePromises);
      console.log('✅ Sample users cleared!');
    } catch (error) {
      console.error('❌ Error clearing sample users:', error);
      throw error;
    }
  }

  static async getSampleUsersCount(): Promise<number> {
    try {
      const usersRef = collection(db, 'userProgress');
      const querySnapshot = await getDocs(usersRef);
      return querySnapshot.size;
    } catch (error) {
      console.error('❌ Error getting user count:', error);
      return 0;
    }
  }
}
