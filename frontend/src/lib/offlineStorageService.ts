// Offline Storage Service for PWA data persistence

export interface OfflineAction {
  id: string;
  type: 'quiz_attempt' | 'game_score' | 'achievement' | 'checkin' | 'user_progress';
  data: any;
  timestamp: string;
  synced: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: any[];
  score: number;
  completedAt: string;
  timeSpent: number;
}

export interface GameScore {
  id: string;
  gameId: string;
  userId: string;
  score: number;
  level: number;
  completedAt: string;
  timeSpent: number;
}

export interface UserProgress {
  userId: string;
  totalPoints: number;
  level: number;
  achievements: string[];
  lastUpdated: string;
}

class OfflineStorageService {
  private dbName = 'EcoLearnOffline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offlineActions')) {
          const offlineStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
          offlineStore.createIndex('type', 'type', { unique: false });
          offlineStore.createIndex('synced', 'synced', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('quizAttempts')) {
          const quizStore = db.createObjectStore('quizAttempts', { keyPath: 'id' });
          quizStore.createIndex('userId', 'userId', { unique: false });
          quizStore.createIndex('quizId', 'quizId', { unique: false });
          quizStore.createIndex('completedAt', 'completedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('gameScores')) {
          const gameStore = db.createObjectStore('gameScores', { keyPath: 'id' });
          gameStore.createIndex('userId', 'userId', { unique: false });
          gameStore.createIndex('gameId', 'gameId', { unique: false });
          gameStore.createIndex('completedAt', 'completedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('userProgress')) {
          const progressStore = db.createObjectStore('userProgress', { keyPath: 'userId' });
        }

        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  // Store offline action
  async storeOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): Promise<string> {
    const db = await this.getDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');

    const offlineAction: OfflineAction = {
      id: `${action.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      synced: false,
      ...action
    };

    return new Promise((resolve, reject) => {
      const request = store.add(offlineAction);
      request.onsuccess = () => resolve(offlineAction.id);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all offline actions
  async getOfflineActions(): Promise<OfflineAction[]> {
    const db = await this.getDB();
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get unsynced actions
  async getUnsyncedActions(): Promise<OfflineAction[]> {
    const db = await this.getDB();
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
      const request = index.getAll(false); // false = not synced
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Mark action as synced
  async markActionAsSynced(id: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.synced = true;
          const putRequest = store.put(action);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Action not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Store quiz attempt
  async storeQuizAttempt(attempt: QuizAttempt): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(['quizAttempts'], 'readwrite');
    const store = transaction.objectStore('quizAttempts');

    return new Promise((resolve, reject) => {
      const request = store.add(attempt);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get quiz attempts
  async getQuizAttempts(userId?: string): Promise<QuizAttempt[]> {
    const db = await this.getDB();
    const transaction = db.transaction(['quizAttempts'], 'readonly');
    const store = transaction.objectStore('quizAttempts');

    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      
      if (userId) {
        const index = store.index('userId');
        request = index.getAll(userId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Store game score
  async storeGameScore(score: GameScore): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(['gameScores'], 'readwrite');
    const store = transaction.objectStore('gameScores');

    return new Promise((resolve, reject) => {
      const request = store.add(score);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get game scores
  async getGameScores(userId?: string): Promise<GameScore[]> {
    const db = await this.getDB();
    const transaction = db.transaction(['gameScores'], 'readonly');
    const store = transaction.objectStore('gameScores');

    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      
      if (userId) {
        const index = store.index('userId');
        request = index.getAll(userId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Store user progress
  async storeUserProgress(progress: UserProgress): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(['userProgress'], 'readwrite');
    const store = transaction.objectStore('userProgress');

    return new Promise((resolve, reject) => {
      const request = store.put(progress);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get user progress
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    const db = await this.getDB();
    const transaction = db.transaction(['userProgress'], 'readonly');
    const store = transaction.objectStore('userProgress');

    return new Promise((resolve, reject) => {
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Cache data with expiration
  async cacheData(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');

    const cacheItem = {
      key,
      data,
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cacheItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data
  async getCachedData(key: string): Promise<any | null> {
    const db = await this.getDB();
    const transaction = db.transaction(['cachedData'], 'readonly');
    const store = transaction.objectStore('cachedData');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && new Date(result.expiresAt) > new Date()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear expired cache
  async clearExpiredCache(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    const index = store.index('expiresAt');

    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(['offlineActions', 'quizAttempts', 'gameScores', 'userProgress', 'cachedData'], 'readwrite');

    const clearPromises = [
      transaction.objectStore('offlineActions').clear(),
      transaction.objectStore('quizAttempts').clear(),
      transaction.objectStore('gameScores').clear(),
      transaction.objectStore('userProgress').clear(),
      transaction.objectStore('cachedData').clear()
    ];

    return Promise.all(clearPromises).then(() => {});
  }

  // Get storage usage
  async getStorageUsage(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0
      };
    }
    return { used: 0, available: 0 };
  }
}

// Export singleton instance
export const offlineStorageService = new OfflineStorageService();
export default offlineStorageService;













