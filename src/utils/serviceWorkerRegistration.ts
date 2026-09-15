import { Capacitor } from '@capacitor/core';

export function registerServiceWorker() {
  // Disable SW on native platforms to avoid conflicts with Capacitor asset handling and custom origin
  const isNative = Capacitor.isNativePlatform();
  const canUseServiceWorkers = 'serviceWorker' in navigator;
  const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]';

  if (canUseServiceWorkers && import.meta.env.PROD && !isNative) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('✅ Service Worker registered:', registration.scope);

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('🔄 New version available! Reload to update.');
              
              // Optionally show a toast notification
              if (window.confirm('New version available! Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    });

    // Handle service worker updates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  } else if (canUseServiceWorkers && (isNative || import.meta.env.DEV || isLocalHost)) {
    console.log('Ensuring Service Worker is unregistered for this runtime');
    unregisterServiceWorker();
  }
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }

  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch (error) {
      console.error('Service Worker cache cleanup failed:', error);
    }
  }
}
