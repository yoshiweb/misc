const CACHE_NAME = 'apex-circuit-v2';
const SHELL = [
  './apex-circuit.html',
  './apex-circuit.webmanifest',
  './assets/apex-circuit/key-visual.png',
  './assets/apex-circuit/asphalt-texture.png',
  './assets/apex-circuit/icon-192.png',
  './assets/apex-circuit/icon-512.png',
  './assets/apex-circuit/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('apex-circuit-') && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  const isGameDocument = event.request.mode === 'navigate' || requestUrl.pathname.endsWith('/apex-circuit.html');
  if (isGameDocument) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put('./apex-circuit.html', response.clone()));
      return response;
    }).catch(() => caches.match('./apex-circuit.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok || response.type === 'opaque') caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match('./apex-circuit.html'))));
});
