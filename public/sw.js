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

// Enhanced Push notifications handling with background processing
self.addEventListener('push', function(event) {
  console.log('Push notification received:', event);
  
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);

    // Store notification in IndexedDB for offline access
    const storePromise = storeNotificationOffline(data);

    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'general',
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
      silent: false
    };

    // Show notification even when app is closed
    const showPromise = self.registration.showNotification(
      data.title || 'TalentXcel', 
      options
    );

    // Background badge update
    const badgePromise = updateNotificationBadge();

    event.waitUntil(Promise.all([storePromise, showPromise, badgePromise]));

  } catch (error) {
    console.error('Error processing push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('TalentXcel', {
        body: 'You have a new notification',
        icon: '/favicon.ico',
        tag: 'fallback'
      })
    );
  }
});

// Enhanced notification click handling
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const clickAction = event.action || 'default';
  const notificationData = event.notification.data || {};
  
  // Handle different actions
  if (clickAction === 'dismiss') {
    return; // Just close notification
  }

  let urlToOpen = '/';
  
  if (notificationData.url) {
    urlToOpen = notificationData.url;
  } else if (notificationData.type === 'job_alert') {
    urlToOpen = '/mobile/jobs';
  } else if (notificationData.type === 'message') {
    urlToOpen = '/messages';
  } else if (notificationData.type === 'network_update') {
    urlToOpen = '/network';
  } else if (clickAction === 'view') {
    urlToOpen = notificationData.url || '/notifications';
  }

  // Mark notification as read
  const markReadPromise = markNotificationAsRead(notificationData.id);

  const openPromise = clients.matchAll({ 
    type: 'window', 
    includeUncontrolled: true 
  }).then(function(clientList) {
    // Try to find an existing window/tab
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        client.navigate(urlToOpen);
        return client.focus();
      }
    }
    
    // If no existing window, open a new one
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(Promise.all([markReadPromise, openPromise]));
});

// Background notification management
async function storeNotificationOffline(data) {
  try {
    // Store in IndexedDB for offline access
    const db = await openNotificationDB();
    const transaction = db.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    
    await store.add({
      id: data.id || Date.now(),
      title: data.title,
      body: data.body,
      data: data.data,
      timestamp: Date.now(),
      read: false
    });
  } catch (error) {
    console.error('Failed to store notification offline:', error);
  }
}

async function openNotificationDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TalentXcelNotifications', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('notifications')) {
        const store = db.createObjectStore('notifications', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('read', 'read', { unique: false });
      }
    };
  });
}

async function updateNotificationBadge() {
  try {
    // Update badge count
    if ('setAppBadge' in navigator) {
      const db = await openNotificationDB();
      const transaction = db.transaction(['notifications'], 'readonly');
      const store = transaction.objectStore('notifications');
      const index = store.index('read');
      const unreadCount = await index.count(false);
      
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount);
      } else {
        navigator.clearAppBadge();
      }
    }
  } catch (error) {
    console.error('Failed to update notification badge:', error);
  }
}

async function markNotificationAsRead(notificationId) {
  try {
    if (!notificationId) return;
    
    const db = await openNotificationDB();
    const transaction = db.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    
    const notification = await store.get(notificationId);
    if (notification) {
      notification.read = true;
      await store.put(notification);
    }
    
    // Update badge count
    await updateNotificationBadge();
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}