// Service Worker utilities for caching and offline support
export class ServiceWorkerManager {
  private static isRegistered = false;

  // Register service worker
  static async register() {
    if ('serviceWorker' in navigator && !this.isRegistered) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.isRegistered = true;
        
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, notify user
                this.notifyUpdate();
              }
            });
          }
        });
        
        return registration;
      } catch (error) {
        console.warn('❌ Service Worker registration failed:', error);
      }
    }
  }

  // Notify user of updates
  static notifyUpdate() {
    if (typeof window !== 'undefined' && 'confirm' in window) {
      if (confirm('New version available! Reload to update?')) {
        window.location.reload();
      }
    }
  }

  // Update service worker
  static async update() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    }
  }

  // Clear all caches
  static async clearCaches() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  // Check if app is running offline
  static isOffline(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine;
  }

  // Initialize service worker with cache invalidation
  static init() {
    if (typeof window === 'undefined') return;
    
    // Clear all caches and unregister service workers to fix MIME type issues
    this.clearCaches();
    this.unregisterAll();
    
    // Handle online/offline events only (no SW registration for now)
    window.addEventListener('online', () => {
      console.log('🟢 App is online');
    });

    window.addEventListener('offline', () => {
      console.log('🔴 App is offline');
    });
  }

  // Unregister all service workers to prevent cache issues
  static async unregisterAll() {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => {
            console.log('🗑️ Unregistering service worker:', registration.scope);
            return registration.unregister();
          })
        );
        console.log('✅ All service workers unregistered');
      } catch (error) {
        console.warn('❌ Error unregistering service workers:', error);
      }
    }
  }
}

// Service Worker script content (to be placed in public/sw.js)
export const SERVICE_WORKER_SCRIPT = `
const CACHE_NAME = 'talentxcel-v1';
const STATIC_CACHE = 'talentxcel-static-v1';
const DYNAMIC_CACHE = 'talentxcel-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/lovable-uploads/1a30569a-4f31-4bd4-abe8-79d630d989f9.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle different request types
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.url.includes('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return placeholder if offline
    return new Response('', { status: 204 });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('{"error":"Offline"}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || cache.match('/offline.html');
  }
}
`;

// Auto-initialize
ServiceWorkerManager.init();