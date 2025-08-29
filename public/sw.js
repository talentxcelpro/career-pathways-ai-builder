// Service Worker for TalentXcel Auto-Update System
const CACHE_NAME = 'talentxcel-v2.0.1';
const urlsToCache = [
  '/',
  '/mobile/network',
  '/mobile/jobs',
  '/mobile/reels',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Force the waiting service worker to become active
});

// Fetch event - prefer network for navigations to avoid white screens after deploys
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // For navigation requests (HTML pages), use network-first and fallback to cache
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(req).then((response) => {
        // Optionally update cached root with latest index
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('/', copy));
        return response;
      }).catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  // For other requests (assets, APIs), use cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients
});

// Background sync for data updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New updates available!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'talentxcel-update',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Updates',
        icon: '/icon-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-dismiss.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('TalentXcel Update', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background data sync function
async function doBackgroundSync() {
  try {
    // Simulate background data update
    const response = await fetch('/api/update-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        type: 'background-sync'
      })
    });

    if (response.ok) {
      // Notify all clients about the update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'DATA_UPDATED',
          timestamp: Date.now()
        });
      });
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'data-refresh') {
    event.waitUntil(doBackgroundSync());
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_INVALIDATE') {
    // Invalidate specific cache entries
    caches.open(CACHE_NAME).then(cache => {
      cache.delete(event.data.url);
    });
  }
});