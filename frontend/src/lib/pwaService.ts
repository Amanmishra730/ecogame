// PWA Service for handling installation, offline functionality, and background sync

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;

  constructor() {
    this.setupEventListeners();
    this.checkInstallationStatus();
  }

  private setupEventListeners() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyInstallAvailable();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.notifyInstallComplete();
    });

    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyOnlineStatus(true);
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatus(false);
    });

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  private checkInstallationStatus() {
    // Check if app is running in standalone mode (installed)
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during app installation:', error);
      return false;
    }
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.notifyUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission denied');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  async storeOfflineData(key: string, data: any): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      
      const offlineItem = {
        id: Date.now().toString(),
        key,
        data,
        timestamp: new Date().toISOString(),
        synced: false
      };
      
      await store.add(offlineItem);
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  async getOfflineData(): Promise<any[]> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting offline data:', error);
      return [];
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EcoLearnOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('offlineActions')) {
          db.createObjectStore('offlineActions', { keyPath: 'id' });
        }
      };
    });
  }

  private async syncOfflineData(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const offlineData = await this.getOfflineData();
      const unsyncedData = offlineData.filter(item => !item.synced);

      for (const item of unsyncedData) {
        try {
          await fetch('/api/sync-offline', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
          });

          // Mark as synced
          await this.markDataAsSynced(item.id);
        } catch (error) {
          console.error('Failed to sync offline data:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  private async markDataAsSynced(id: string): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.synced = true;
          store.put(item);
        }
      };
    } catch (error) {
      console.error('Error marking data as synced:', error);
    }
  }

  // Event notification methods
  private notifyInstallAvailable() {
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private notifyInstallComplete() {
    window.dispatchEvent(new CustomEvent('pwa-install-complete'));
  }

  private notifyUpdateAvailable() {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  private notifyOnlineStatus(isOnline: boolean) {
    window.dispatchEvent(new CustomEvent('pwa-online-status', { 
      detail: { isOnline } 
    }));
  }
}

// Export singleton instance
export const pwaService = new PWAService();
export default pwaService;
