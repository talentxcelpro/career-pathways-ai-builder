// Minimal network status utilities
export class NetworkManager {
  static isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  static init() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      console.log('🟢 App is online');
    });

    window.addEventListener('offline', () => {
      console.log('🔴 App is offline');
    });
  }
}

// Auto-initialize
NetworkManager.init();