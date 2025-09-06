import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  onSnapshot,
  where,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProgress } from './userProgressService';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  xp: number;
  level: number;
  badges: number;
  streak: number;
  avatar: string;
  lastActiveDate: string;
  rank?: number;
  change?: string;
}

export interface LeaderboardStats {
  currentRank: number;
  totalPlayers: number;
  xpToNextRank: number;
  weeklyChange: number;
}

export class LeaderboardService {
  private static getLeaderboardCollection() {
    return collection(db, 'userProgress');
  }

  static async getLeaderboard(limitCount: number = 50): Promise<LeaderboardEntry[]> {
    try {
      const leaderboardRef = this.getLeaderboardCollection();
      const q = query(
        leaderboardRef,
        orderBy('xp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const leaderboard: LeaderboardEntry[] = [];
      
      querySnapshot.forEach((doc, index) => {
        const data = doc.data() as UserProgress;
        const entry: LeaderboardEntry = {
          userId: data.userId,
          displayName: data.displayName || this.generateDisplayName(data.userId),
          xp: data.xp,
          level: data.level,
          badges: data.badges,
          streak: data.streak,
          avatar: this.generateAvatar(data.displayName || data.userId),
          lastActiveDate: data.lastActiveDate,
          rank: index + 1
        };
        leaderboard.push(entry);
      });
      
      console.log(`📊 Loaded ${leaderboard.length} users from Firebase`);
      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  static async getUserRank(userId: string): Promise<number> {
    try {
      const leaderboardRef = this.getLeaderboardCollection();
      const q = query(leaderboardRef, orderBy('xp', 'desc'));
      
      const querySnapshot = await getDocs(q);
      let rank = 1;
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data() as UserProgress;
        if (data.userId === userId) {
          return rank;
        }
        rank++;
      }
      
      return rank;
    } catch (error) {
      console.error('Error getting user rank:', error);
      throw error;
    }
  }

  static async getLeaderboardStats(userId: string): Promise<LeaderboardStats> {
    try {
      const [leaderboard, userRank] = await Promise.all([
        this.getLeaderboard(100),
        this.getUserRank(userId)
      ]);

      const userEntry = leaderboard.find(entry => entry.userId === userId);
      const nextRankEntry = leaderboard[userRank]; // userRank is 1-based, so this is the next person
      
      const xpToNextRank = nextRankEntry ? nextRankEntry.xp - (userEntry?.xp || 0) : 0;
      
      return {
        currentRank: userRank,
        totalPlayers: leaderboard.length,
        xpToNextRank: Math.max(0, xpToNextRank),
        weeklyChange: 0 // TODO: Implement weekly change tracking
      };
    } catch (error) {
      console.error('Error getting leaderboard stats:', error);
      throw error;
    }
  }

  static subscribeToLeaderboard(
    callback: (leaderboard: LeaderboardEntry[]) => void,
    limitCount: number = 50
  ): () => void {
    try {
      const leaderboardRef = this.getLeaderboardCollection();
      const q = query(
        leaderboardRef,
        orderBy('xp', 'desc'),
        limit(limitCount)
      );
      
      return onSnapshot(q, (querySnapshot) => {
        const leaderboard: LeaderboardEntry[] = [];
        
        querySnapshot.forEach((doc, index) => {
          const data = doc.data() as UserProgress;
          const entry: LeaderboardEntry = {
            userId: data.userId,
            displayName: data.displayName || this.generateDisplayName(data.userId),
            xp: data.xp,
            level: data.level,
            badges: data.badges,
            streak: data.streak,
            avatar: this.generateAvatar(data.displayName || data.userId),
            lastActiveDate: data.lastActiveDate,
            rank: index + 1
          };
          leaderboard.push(entry);
        });
        
        callback(leaderboard);
      });
    } catch (error) {
      console.error('Error subscribing to leaderboard:', error);
      throw error;
    }
  }

  static generateDisplayName(userId: string): string {
    // Generate a display name from userId or use a default
    const names = [
      'Eco Warrior', 'Green Guardian', 'Nature Lover', 'Earth Saver',
      'Climate Hero', 'Eco Explorer', 'Green Champion', 'Nature Defender',
      'Earth Protector', 'Eco Enthusiast', 'Green Leader', 'Nature Hero'
    ];
    
    // Use a simple hash to consistently assign names
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return names[Math.abs(hash) % names.length];
  }

  static generateAvatar(displayName: string): string {
    // Generate avatar initials from display name
    const words = displayName.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }

  static async updateUserDisplayName(userId: string, displayName: string): Promise<void> {
    try {
      const userProgressRef = doc(db, 'userProgress', userId);
      await updateDoc(userProgressRef, { displayName });
    } catch (error) {
      console.error('Error updating display name:', error);
      throw error;
    }
  }
}
