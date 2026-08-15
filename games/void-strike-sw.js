const CACHE_NAME = 'void-strike-v3';
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
  const requestUrl = new URL(event.request.url);
  const isGameDocument = event.request.mode === 'navigate' || requestUrl.pathname.endsWith('/void-strike.html');
  if (isGameDocument) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./void-strike.html', copy));
      }
      return response;
    }).catch(() => caches.match('./void-strike.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && requestUrl.origin === self.location.origin) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match('./void-strike.html'))));
});
