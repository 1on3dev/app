const CACHE_NAME = 'f7-pwa-cache-v2';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './geojson/pipa.geojson',
  './geojson/gatevalve.geojson',
  './geojson/manometer.geojson',
  'https://cdn.jsdelivr.net/npm/onsenui/css/onsenui.min.css',
  'https://cdn.jsdelivr.net/npm/onsenui/css/onsen-css-components.min.css',
  'https://cdn.jsdelivr.net/npm/onsenui/js/onsenui.min.js'
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
