import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const fullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const installedState = standalone || fullscreen || isInWebAppiOS;
      setIsStandalone(installedState);
      setIsInstalled(installedState);
      return installedState;
    };

    // Check if device is iOS
    const checkIOS = () => {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(isIOSDevice);
      return isIOSDevice;
    };

    const installedState = checkInstalled();
    const isIOSDevice = checkIOS();
    
    // For iOS Safari, we can show install prompt if not already installed  
    if (isIOSDevice && !installedState) {
      setCanInstall(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setCanInstall(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Enhanced cleanup with version invalidation
    const cleanupServiceWorkers = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log('🧹 PWA: Unregistered service worker');
          }
          
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => {
                console.log('🧹 PWA: Deleting cache:', cacheName);
                return caches.delete(cacheName);
              })
            );
            console.log('🧹 PWA: Cleared all caches');
          }

          // Clear storage data that might cause version conflicts
          if ('localStorage' in window) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
              if (key.includes('cache') || key.includes('version') || key.includes('sw') || 
                  key.includes('career-dashboard') || key.includes('gamification') || 
                  key.includes('talentxcel')) {
                localStorage.removeItem(key);
                console.log('🧹 PWA: Cleared localStorage key:', key);
              }
            });
          }

          // Clear sessionStorage as well
          if ('sessionStorage' in window) {
            sessionStorage.clear();
            console.log('🧹 PWA: Cleared sessionStorage');
          }
        } catch (error) {
          console.warn('PWA cleanup error:', error);
        }
      }
    };
    
    cleanupServiceWorkers();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        setCanInstall(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install failed:', error);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  return {
    canInstall: (canInstall && !isInstalled) || (isIOS && !isInstalled),
    isInstalled,
    isStandalone,
    isIOS,
    installApp,
    requestNotificationPermission
  };
}