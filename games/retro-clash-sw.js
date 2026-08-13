'use strict';

const CACHE_PREFIX = 'retro-clash-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const APP_SHELL = [
  './retro-clash.html',
  './retro-clash.webmanifest',
  './assets/retro-clash/azure-sprites.png',
  './assets/retro-clash/crimson-sprites.png',
  './assets/retro-clash/moonlit-dojo.png',
  './assets/retro-clash/neon-street.png',
  './assets/retro-clash/key-visual.png',
  './assets/retro-clash/icon-192.png',
  './assets/retro-clash/icon-512.png',
  './assets/retro-clash/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isGamePage = url.pathname.endsWith('/games/retro-clash.html');
  const isGameAsset = url.pathname.includes('/games/assets/retro-clash/');
  const isManifest = url.pathname.endsWith('/games/retro-clash.webmanifest');
  if (!isGamePage && !isGameAsset && !isManifest) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./retro-clash.html', copy));
          return response;
        })
        .catch(() => caches.match('./retro-clash.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
