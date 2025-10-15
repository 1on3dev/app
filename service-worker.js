const CACHE_NAME = 'f7-pwa-cache-v2';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './pages/home.html',
  './pages/about.html',
  './pages/contact.html',
  './pages/maps.html',
  'https://cdn.jsdelivr.net/npm/framework7@7/framework7-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/framework7@7/framework7-bundle.min.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});
