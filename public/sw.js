const CACHE_NAME = 'hu-cache-v2';
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
];

// ─── INSTALL: Pre-cache only essential static assets ───
self.addEventListener('install', (event) => {
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ─── ACTIVATE: Clean up ALL old caches and claim clients immediately ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Take control of all open clients immediately (no reload needed)
      return self.clients.claim();
    })
  );
});

// ─── FETCH: Network-first with cache fallback ───
// This ensures Ctrl+R always gets the latest content from the server.
// Cache is only used as a fallback when the network is unavailable (offline).
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests (POST, PUT, DELETE etc.)
  if (request.method !== 'GET') return;

  // Skip API calls — never cache dynamic data
  if (request.url.includes('/api/')) return;

  // Skip cross-origin requests (CDNs, analytics, etc.)
  if (!request.url.startsWith(self.location.origin)) return;

  // For navigation requests (HTML pages): always go to network
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // For static assets: network-first, cache the response, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache valid responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache if available
        return caches.match(request);
      })
  );
});

// ─── MESSAGE: Allow the app to trigger skipWaiting from the client side ───
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
