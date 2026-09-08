const CACHE_NAME = 'wzker-v3.0';
const ASSETS = [
  './index.html',
  './css/main.css',
  './css/player.css',
  './css/components.css',
  './css/views.css',
  './js/data.js',
  './js/audio.js',
  './js/library.js',
  './js/ui.js',
  './js/app.js',
  './images/icon/wzker.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('stream') || e.request.url.includes('.mp3')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
