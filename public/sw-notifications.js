// Enhanced Service Worker for Comprehensive Push Notifications
const CACHE_NAME = 'talentxcel-notifications-v1';
const NOTIFICATION_CACHE = 'notification-cache-v1';

// Enhanced notification handling
self.addEventListener('push', async (event) => {
  console.log('SW: Push notification received', event);
  
  if (!event.data) {
    console.log('SW: No data in push event');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    console.error('SW: Error parsing notification data:', error);
    notificationData = {
      title: 'New Notification',
      body: event.data.text() || 'You have a new notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    };
  }

  console.log('SW: Parsed notification data:', notificationData);

  // Enhanced notification options
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon-192.png',
    badge: notificationData.badge || '/icon-192.png',
    image: notificationData.image,
    tag: notificationData.tag || `notification-${Date.now()}`,
    requireInteraction: notificationData.priority === 'high' || notificationData.priority === 'urgent',
    silent: notificationData.priority === 'low',
    vibrate: getVibrationPattern(notificationData.priority),
    data: {
      url: notificationData.data?.url || '/notifications',
      timestamp: Date.now(),
      type: notificationData.data?.type || 'general',
      priority: notificationData.priority || 'medium',
      ...notificationData.data
    },
    actions: []
  };

  // Add actions if provided
  if (notificationData.actions && Array.isArray(notificationData.actions)) {
    notificationOptions.actions = notificationData.actions.map((action, index) => ({
      action: action.action || `action_${index}`,
      title: action.title || action.label,
      icon: action.icon || '/icon-192.png'
    }));
  }

  // Add default actions based on notification type
  if (notificationData.data?.type) {
    const defaultActions = getDefaultActions(notificationData.data.type);
    notificationOptions.actions = [...(notificationOptions.actions || []), ...defaultActions].slice(0, 2);
  }

  // Cache notification for offline viewing
  await cacheNotification(notificationData);

  // Show notification
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'TalentXcel',
      notificationOptions
    )
  );

  // Send analytics
  event.waitUntil(
    sendNotificationAnalytics('received', notificationData)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked', event);
  
  event.notification.close();

  const notificationData = event.notification.data;
  let targetUrl = '/notifications';

  // Handle action clicks
  if (event.action) {
    targetUrl = handleNotificationAction(event.action, notificationData);
  } else {
    // Handle main notification click
    targetUrl = notificationData.url || '/notifications';
  }

  console.log('SW: Opening URL:', targetUrl);

  // Send analytics
  event.waitUntil(
    sendNotificationAnalytics('clicked', {
      action: event.action || 'main',
      type: notificationData.type,
      url: targetUrl
    })
  );

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes(targetUrl.split('?')[0]) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch((error) => {
        console.error('SW: Error opening window:', error);
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('SW: Notification closed', event);
  
  const notificationData = event.notification.data;
  
  // Send analytics
  event.waitUntil(
    sendNotificationAnalytics('dismissed', {
      type: notificationData?.type || 'unknown'
    })
  );
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-notification-sync') {
    event.waitUntil(syncOfflineNotifications());
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('SW: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_NOTIFICATION_STATS') {
    event.ports[0].postMessage(getNotificationStats());
  }
});

// Utility Functions

function getVibrationPattern(priority) {
  switch (priority) {
    case 'urgent':
      return [200, 100, 200, 100, 200];
    case 'high':
      return [100, 50, 100];
    case 'medium':
      return [100];
    case 'low':
      return [];
    default:
      return [100];
  }
}

function getDefaultActions(notificationType) {
  const actionMap = {
    'job_match': [
      { action: 'view_job', title: 'View Job', icon: '/icons/briefcase.png' },
      { action: 'save_job', title: 'Save', icon: '/icons/bookmark.png' }
    ],
    'connection_request': [
      { action: 'accept_connection', title: 'Accept', icon: '/icons/check.png' },
      { action: 'view_profile', title: 'View Profile', icon: '/icons/user.png' }
    ],
    'application_update': [
      { action: 'view_application', title: 'View Details', icon: '/icons/file.png' }
    ],
    'profile_completion': [
      { action: 'complete_profile', title: 'Complete Now', icon: '/icons/edit.png' }
    ],
    'skill_assessment': [
      { action: 'take_assessment', title: 'Take Test', icon: '/icons/brain.png' }
    ]
  };
  
  return actionMap[notificationType] || [
    { action: 'view', title: 'View', icon: '/icon-192.png' }
  ];
}

function handleNotificationAction(action, notificationData) {
  const baseUrl = '/';
  
  switch (action) {
    case 'view_job':
      return `${baseUrl}jobs/${notificationData.job_id || ''}`;
    case 'save_job':
      // This would trigger a background action to save the job
      return `${baseUrl}jobs/${notificationData.job_id || ''}?action=save`;
    case 'accept_connection':
      return `${baseUrl}network/requests?action=accept&id=${notificationData.connection_id || ''}`;
    case 'view_profile':
      return `${baseUrl}network/people/${notificationData.user_id || ''}`;
    case 'view_application':
      return `${baseUrl}applications/${notificationData.application_id || ''}`;
    case 'complete_profile':
      return `${baseUrl}profile?tab=complete`;
    case 'take_assessment':
      return `${baseUrl}tools/skill-assessment/${notificationData.skill || ''}`;
    case 'view':
    default:
      return notificationData.url || `${baseUrl}notifications`;
  }
}

async function cacheNotification(notificationData) {
  try {
    const cache = await caches.open(NOTIFICATION_CACHE);
    const cacheKey = `notification-${Date.now()}-${Math.random()}`;
    
    await cache.put(
      new Request(cacheKey),
      new Response(JSON.stringify({
        ...notificationData,
        cached_at: Date.now()
      }))
    );
    
    // Clean old cached notifications (keep only last 50)
    await cleanOldNotifications(cache);
  } catch (error) {
    console.error('SW: Error caching notification:', error);
  }
}

async function cleanOldNotifications(cache) {
  try {
    const keys = await cache.keys();
    const notificationKeys = keys
      .filter(key => key.url.includes('notification-'))
      .sort((a, b) => b.url.localeCompare(a.url));
    
    // Remove excess notifications (keep only 50 most recent)
    if (notificationKeys.length > 50) {
      const keysToDelete = notificationKeys.slice(50);
      await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
  } catch (error) {
    console.error('SW: Error cleaning old notifications:', error);
  }
}

async function syncOfflineNotifications() {
  try {
    console.log('SW: Syncing offline notifications');
    
    // Check if online
    if (!navigator.onLine) {
      console.log('SW: Still offline, scheduling retry');
      return;
    }
    
    // Get cached notifications that haven't been synced
    const cache = await caches.open(NOTIFICATION_CACHE);
    const keys = await cache.keys();
    
    for (const key of keys) {
      const response = await cache.match(key);
      const notificationData = await response.json();
      
      if (!notificationData.synced) {
        // Sync with server
        await sendNotificationAnalytics('sync', notificationData);
        
        // Mark as synced
        await cache.put(
          key,
          new Response(JSON.stringify({
            ...notificationData,
            synced: true
          }))
        );
      }
    }
  } catch (error) {
    console.error('SW: Error syncing offline notifications:', error);
  }
}

async function sendNotificationAnalytics(event, data) {
  try {
    // Only send analytics if online
    if (!navigator.onLine) {
      console.log('SW: Offline, skipping analytics');
      return;
    }
    
    const analyticsData = {
      event,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      ...data
    };
    
    // Send to analytics endpoint
    await fetch('/api/analytics/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analyticsData)
    });
  } catch (error) {
    console.error('SW: Error sending analytics:', error);
  }
}

function getNotificationStats() {
  // Return stats about notification handling
  return {
    version: '1.0.0',
    cache_name: CACHE_NAME,
    supported_features: {
      push: 'PushManager' in window,
      notification: 'Notification' in window,
      service_worker: 'serviceWorker' in navigator,
      background_sync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    },
    permissions: {
      notification: Notification?.permission || 'default'
    }
  };
}

// Install and activate events
self.addEventListener('install', (event) => {
  console.log('SW: Installing enhanced notification service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/icon-192.png',
          '/icon-512.png',
          '/sounds/notification.mp3'
        ]);
      })
      .then(() => {
        console.log('SW: Installation complete');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activating enhanced notification service worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== NOTIFICATION_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('SW: Activation complete');
    })
  );
});
