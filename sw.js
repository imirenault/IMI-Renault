// IMI Copilot Service Worker - Version 2.3.1
const CACHE_NAME = 'imi-copilot-cache-v2.3.3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './renault_logo.png',
  './RG_RENAULT_GROUP_LOGOTYPE_WHITE_RGB_v21_1.png',
  './Features.jpg',
  './Sales Figure.jpg',
  './Fuel Economy.jpg',
  './icon.png'
];

// 1. Install Event: Cache essential assets and force immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activate Event: Clean up outdated cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      })
    ])
  );
});

// 3. Fetch Event: Network-First for HTML/Navigation, Stale-While-Revalidate for Assets
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Never cache POST requests (e.g. API requests to Cloudflare Worker)
  if (req.method !== 'GET') {
    return;
  }

  // Network-First strategy for HTML navigation (guarantees phone receives latest published version)
  if (req.mode === 'navigate' || req.destination === 'document' || req.url.endsWith('index.html') || req.url.endsWith('/')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          // Fall back to offline cache if network is unavailable
          return caches.match(req).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // Cache-First with Network fallback for static images/icons
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) {
        // Fetch in background to update cache (Stale-While-Revalidate)
        fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes));
          }
        }).catch(() => {});
        return cachedRes;
      }
      return fetch(req);
    })
  );
});
