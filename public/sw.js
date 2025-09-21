// TalentXcel Service Worker - Ultra Fast & Offline-First
const CACHE_NAME = 'talentxcel-v1';
const STATIC_CACHE = 'talentxcel-static-v1';
const DYNAMIC_CACHE = 'talentxcel-dynamic-v1';

// Critical resources to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/lovable-uploads/2f30b9a2-a492-4725-b98c-334796c21e32.png',
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2'
];

// Network-first strategy for API calls
const API_ENDPOINTS = [
  '/api/',
  'https://dthlgsnakhoftinssokm.supabase.co/'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(CRITICAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests with network-first strategy
  if (API_ENDPOINTS.some(endpoint => request.url.includes(endpoint))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'image' || request.destination === 'font' || request.destination === 'style') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle navigation with network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Default: network-first strategy
  event.respondWith(networkFirstStrategy(request));
});

// Network-first strategy for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cacheResponse = await caches.match(request);
    return cacheResponse || new Response('Offline', { status: 503 });
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cacheResponse = await caches.match(request);
  if (cacheResponse) {
    return cacheResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Asset not available', { status: 404 });
  }
}

// Navigation strategy with fallback
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cacheResponse = await caches.match('/');
    return cacheResponse || new Response('Offline', { status: 503 });
  }
}