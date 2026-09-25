// TalentXcel service worker kill switch.
// Native Capacitor builds serve versioned app assets from the APK. A web
// service worker on https://localhost can keep stale bundles alive after an
// APK update, causing blank screens or repeated reload/login loops.

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    await self.registration.unregister();

    await Promise.all(
      clients.map((client) => {
        try {
          if ('navigate' in client && client.url) {
            // Only navigate if it's a window client that we can actually control
            return client.navigate(client.url).catch(err => {
              console.warn('Navigation failed for client, ignoring:', err);
              return client.postMessage({ type: 'SERVICE_WORKER_DISABLED' });
            });
          }
        } catch (e) {
          console.warn('Client iteration error:', e);
        }
        return client.postMessage({ type: 'SERVICE_WORKER_DISABLED' });
      })
    );
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
