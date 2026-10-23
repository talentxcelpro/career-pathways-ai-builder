// TalentXcel Service Worker Kill Switch & Cache Cleanup
// Unregisters any legacy service workers and evicts caches without intercepting requests.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      } catch (err) {
        // Ignore cache deletion errors
      }
      try {
        await self.registration.unregister();
      } catch (err) {
        // Ignore unregistration errors
      }
    })()
  );
});
