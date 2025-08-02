// TalentXcel Service Worker
const CACHE_NAME = 'talentxcel-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Critical files to cache
const CRITICAL_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
  OFFLINE_URL
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/dthlgsnakhoftinssokm\.supabase\.co\/rest\/v1\/jobs/,
  /^https:\/\/dthlgsnakhoftinssokm\.supabase\.co\/rest\/v1\/companies/,
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Caching critical files');
      return cache.addAll(CRITICAL_FILES);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;

  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (isAPIRequest(url)) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstWithNetwork(request));
    return;
  }

  // Handle navigation requests with network-first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstForNavigation(request));
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(networkFirstWithCache(request));
});

// Check if request is for API
function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

// Check if request is for static assets
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/);
}

// Network-first strategy with cache fallback
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy with network fallback
async function cacheFirstWithNetwork(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response);
        });
      }
    }).catch(() => {
      // Ignore background update errors
    });
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('SW: Both cache and network failed for:', request.url);
    throw error;
  }
}

// Network-first for navigation with offline fallback
async function networkFirstForNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('SW: Navigation network failed, trying cache');
  }

  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Return offline page as last resort
  return caches.match(OFFLINE_URL);
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('SW: Performing background sync');
  // Implement background sync logic here
  // e.g., retry failed API requests
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
    badge: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TalentXcel', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});