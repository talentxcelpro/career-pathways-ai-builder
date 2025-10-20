import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isOnline: navigator.onLine,
    updateAvailable: false
  });

  useEffect(() => {
    if (!state.isSupported) return;

  const registerSW = async () => {
    try {
      // Register service worker in production only
      if (import.meta.env.PROD) {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('✅ Service Worker registered:', registration.scope);
        setState(prev => ({ ...prev, isRegistered: true }));
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

    registerSW();

    // Listen for online/offline changes
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.isSupported]);

  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
          window.location.reload();
        }
      });
    }
  };

  return {
    ...state,
    updateServiceWorker
  };
};