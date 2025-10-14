const CACHE_NAME = 'leaflet-pwa-v1';
const APP_SHELL = [
  '/', // start_url
  '/index.html',
  '/manifest.json',
  // CDN assets we want to cache on install (optional — note: CORS allows caching)
  'https://cdn.jsdelivr.net/npm/framework7@6.4.3/framework7-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/framework7@6.4.3/framework7-bundle.min.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// On install: cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// On activate: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch strategy: cache-first for app shell + runtime cache for tiles & CDN
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Strategy for tile servers (tile.openstreetmap.org)
  if (url.host.includes('tile.openstreetmap.org') || url.host.includes('a.tile.openstreetmap.org')) {
    event.respondWith(
      caches.open('tiles-cache').then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const resp = await fetch(request);
          if (resp && resp.status === 200) cache.put(request, resp.clone());
          return resp;
        } catch (err) {
          return caches.match('/fallback-tile.png'); // optional fallback if provided
        }
      })
    );
    return;
  }

  // For other requests: try cache first, then network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        // optionally cache runtime CDN assets
        if (request.url.startsWith('https://cdn.jsdelivr.net') || request.url.startsWith('https://unpkg.com')) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, resp.clone()));
        }
        return resp;
      }).catch(() => {
        // fallback for navigation requests
        if (request.mode === 'navigate') return caches.match('/index.html');
      });
    })
  );
});
