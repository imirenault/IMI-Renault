const CACHE_NAME = 'gemini-multithread-pwa-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'POST') {
    e.respondWith(
      caches.match(e.request).then((res) => res || fetch(e.request))
    );
  }
});