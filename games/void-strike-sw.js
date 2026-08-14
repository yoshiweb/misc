const CACHE_NAME = 'void-strike-v1';
const SHELL = [
  './void-strike.html',
  './void-strike.webmanifest',
  './assets/void-strike/orbital-citadel.jpg',
  './assets/void-strike/key-visual.jpg',
  './assets/void-strike/icon-192.png',
  './assets/void-strike/icon-512.png',
  './assets/void-strike/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('void-strike-') && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match('./void-strike.html'))));
});
