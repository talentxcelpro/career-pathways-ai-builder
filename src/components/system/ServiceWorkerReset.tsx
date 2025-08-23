import React, { useEffect } from 'react';

export const ServiceWorkerReset: React.FC = () => {
  useEffect(() => {
    const reset = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const reg of regs) {
            await reg.unregister();
          }
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        console.info('ServiceWorkerReset: cleared old service workers and caches');
      } catch (e) {
        console.warn('ServiceWorkerReset: error clearing SW/caches', e);
      }
    };
    reset();
  }, []);

  return null;
};
