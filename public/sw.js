// TalentXcel Service Worker
// IMPORTANT: bump CACHE_VERSION whenever caching behavior changes so old
// caches (which may hold stale JS bundles) are evicted on activate.
const CACHE_VERSION = 'v1.2.0-2026-06-06';
const CACHE_NAME = `talentxcel-${CACHE_VERSION}`;

const CRITICAL_ASSETS = [
  '/',
  '/manifest.json'
];

// Install — pre-cache only the absolute essentials, never JS/CSS bundles
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CRITICAL_ASSETS))
      .catch((err) => console.warn('SW install pre-cache failed:', err))
  );
  // Take over immediately so the new SW can serve fresh JS on next nav
  self.skipWaiting();
});

// Activate — wipe ALL previous caches (forces re-fetch of any stale JS)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Allow page to ask the waiting SW to activate
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // NEVER intercept Supabase (storage uploads, auth, DB, realtime, edge fns).
  // Let the browser talk to Supabase directly — no SW caching at all.
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('supabase.in')) {
    return;
  }

  // NEVER intercept auth or API style endpoints
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    return;
  }

  // App shell HTML — always network-first so deploys are picked up
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // JS/CSS — network-first so new deploys replace old bundles immediately.
  // (Hashed /assets/* are content-addressed; HTTP cache + immutable header
  //  already handle long-term caching at the CDN/browser layer.)
  if (request.destination === 'script' || request.destination === 'style' ||
      request.destination === 'worker') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Images / fonts — cache-first is OK (versioned filenames / query strings)
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else — stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (e) {
    return new Response('Network error', { status: 408 });
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('Network error', { status: 408 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(Promise.resolve());
  }
});
