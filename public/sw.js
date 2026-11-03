// ============================================================================
// TalentXcel Unified Service Worker & Push Delivery Engine
// Mission ID: TXC-NOTIFICATIONS-001
// Platform: TalentXcel (https://talentxcel.in)
// ============================================================================

const CACHE_NAME = 'txc-notif-v1';
const NOTIFICATION_CACHE = 'txc-notif-cache-v1';

// Install event: instantly skip waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: claim clients and purge legacy stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== NOTIFICATION_CACHE)
            .map((name) => caches.delete(name))
        );
      } catch (err) {
        console.warn('SW: Cache eviction warning:', err);
      }
      await self.clients.claim();
    })()
  );
});

// Push notification received
self.addEventListener('push', async (event) => {
  if (!event.data) {
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    notificationData = {
      title: 'TalentXcel Notification',
      body: event.data.text() || 'You have a new update on TalentXcel',
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    };
  }

  const title = notificationData.title || 'TalentXcel';
  const priority = notificationData.priority || 'medium';

  const notificationOptions = {
    body: notificationData.body || notificationData.message,
    icon: notificationData.icon || '/icon-192.png',
    badge: notificationData.badge || '/icon-192.png',
    image: notificationData.image,
    tag: notificationData.tag || `txc_notif_${Date.now()}`,
    requireInteraction: priority === 'high' || priority === 'urgent',
    silent: priority === 'low',
    data: {
      url: notificationData.data?.url || notificationData.action_url || notificationData.link || '/notifications',
      notification_id: notificationData.data?.notification_id || notificationData.id,
      type: notificationData.data?.type || notificationData.type || 'general',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );

  // Inform any open frontend clients
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'PUSH_NOTIFICATION_RECEIVED',
          data: {
            title,
            body: notificationOptions.body,
            data: notificationOptions.data
          }
        });
      });
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url.includes(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  // Silent analytics or cleanup
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
