const CACHE_NAME = 'wzker-v3.7';
const ASSETS = [
  './index.html',
  './manifest.json',
  './images/icon/wzker.png',
  // Stylesheets
  './css/main.css',
  './css/player.css',
  './css/components.css',
  './css/views.css',
  './css/sheikh.css',
  './css/search.css',
  './css/library.css',
  './css/radio.css',
  './css/settings.css',
  './css/lyrics.css',
  './css/notifications.css',
  './css/sidebar.css',
  './css/quran.css',
  './css/adhkar.css',
  './css/tasbeeh.css',
  './css/prayer-times.css',
  './css/cloud-account.css',
  // JavaScript Engines
  './js/data.js',
  './js/storage-db.js',
  './js/library.js',
  './js/audio.js',
  './js/quran-sync.js',
  './js/ui.js',
  './js/search.js',
  './js/notifications.js',
  './js/sidebar.js',
  './js/quran.js',
  './js/adhkar-data.js',
  './js/adhkar.js',
  './js/tasbeeh-data.js',
  './js/tasbeeh.js',
  './js/prayer-times.js',
  './js/firebase-config.js',
  './js/cloud-sync.js',
  './js/app.js'
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
  // Never cache live radio jar stream
  if (e.request.url.includes('stream')) {
    return;
  }

  // Cache on demand for adhan audio
  if (e.request.url.includes('/audio/adhans/')) {
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(e.request).then((response) => {
          if (response) return response;
          return fetch(e.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => response);
        });
      })
    );
    return;
  }

  if (e.request.url.includes('.mp3')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
