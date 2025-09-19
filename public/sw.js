// Performance-Optimized Service Worker with advanced caching strategies
const CACHE_VERSION = 'v5.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGES_CACHE = `images-${CACHE_VERSION}`;

// Critical assets to cache on install
const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/sounds/notification.mp3'
];

// Cache sizes to prevent unlimited growth
const CACHE_LIMITS = {
  [DYNAMIC_CACHE]: 50,
  [API_CACHE]: 100,
  [IMAGES_CACHE]: 60
};

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => cacheName !== CACHE_NAME && caches.delete(cacheName))
    ))
  );
  self.clients.claim();
});

// Fetch event with robust strategies to prevent stale HTML/JS mismatch
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip cross-origin
  if (url.origin !== self.location.origin) return;

  // Network-first for navigations/HTML to avoid cached old index.html
  if (req.mode === 'navigate' || req.destination === 'document' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || caches.match('/offline.html');
        })
    );
    return;
  }

  // Cache-first for static assets; fallback to network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (req.method === 'GET' && url.origin === self.location.origin && !url.pathname.startsWith('/api')) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match('/offline.html'));
    })
  );
});

// Enhanced Push notification event with proper parsing
self.addEventListener('push', event => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'TalentXcel',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'default',
    priority: 'normal',
    url: '/',
    requireInteraction: false,
    silent: false
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  // Enhanced notification options with rich formatting
  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon-192.png',
    badge: notificationData.badge || '/icon-192.png',
    image: notificationData.image,
    vibrate: notificationData.vibrate || [200, 100, 200],
    sound: notificationData.sound || '/sounds/notification.mp3',
    tag: notificationData.tag,
    renotify: true,
    requireInteraction: notificationData.priority === 'high',
    silent: notificationData.silent || false,
    timestamp: Date.now(),
    data: {
      url: notificationData.url || '/',
      notification_id: notificationData.notification_id,
      user_id: notificationData.user_id,
      type: notificationData.type,
      dateOfArrival: Date.now(),
      rich_content: notificationData.rich_content,
      actions: notificationData.actions,
      ...notificationData.data
    },
    actions: getNotificationActions(notificationData.type, notificationData.actions)
  };

  function getNotificationActions(type, customActions) {
    if (customActions && customActions.length > 0) {
      return customActions;
    }
    
    // Default actions based on notification type
    switch (type) {
      case 'profile_completion_reminder':
        return [
          {
            action: 'complete',
            title: '✨ Complete Profile',
            icon: '/icon-192.png'
          },
          {
            action: 'dismiss',
            title: 'Later',
            icon: '/icon-192.png'
          }
        ];
      case 'job_match':
        return [
          {
            action: 'view_job',
            title: '💼 View Job',
            icon: '/icon-192.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icon-192.png'
          }
        ];
      case 'welcome':
        return [
          {
            action: 'explore',
            title: '🚀 Get Started',
            icon: '/icon-192.png'
          },
          {
            action: 'dismiss',
            title: 'OK',
            icon: '/icon-192.png'
          }
        ];
      default:
        return [
          {
            action: 'view',
            title: 'View',
            icon: '/icon-192.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icon-192.png'
          }
        ];
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );

  // Send to all clients for real-time updates
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'PUSH_NOTIFICATION_RECEIVED',
          data: notificationData
        });
      });
    })
  );
});

// Enhanced notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const data = event.notification.data;
  const action = event.action;

  if (action === 'dismiss') {
    return;
  }

  // Handle different actions with specific URLs
  let targetUrl = data.url || '/';
  
  switch (action) {
    case 'complete':
      targetUrl = '/profile';
      break;
    case 'view_job':
      targetUrl = '/jobs';
      break;
    case 'explore':
      targetUrl = '/jobs';
      break;
    default:
      targetUrl = data.url || '/';
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(clients => {
        // Check if there's already a window/tab open with this URL
        for (let client of clients) {
          if (client.url.includes(targetUrl.split('/')[1]) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );

  // Mark notification as clicked in backend
  if (data.notification_id) {
    event.waitUntil(
      fetch('/api/notifications/clicked', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_id: data.notification_id,
          action: action || 'click'
        })
      }).catch(err => console.error('Failed to track notification click:', err))
    );
  }
});

// Background sync for offline notifications
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(
      syncNotifications()
    );
  }
});

async function syncNotifications() {
  try {
    // Sync any pending notifications when back online
    const response = await fetch('/api/notifications/sync');
    const notifications = await response.json();
    
    // Show any missed notifications
    notifications.forEach(notification => {
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/icon-192.png',
        tag: notification.id,
        data: notification.data
      });
    });
  } catch (error) {
    console.error('Failed to sync notifications:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});