const CACHE_NAME = 'ecliptica-v2';
const ASSETS = [
  '/',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/images/ecliptica_main_banner.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network First, falling back to cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If the response is valid, clone it and update the cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fetch fails (offline), return from cache
        return caches.match(event.request);
      })
  );
});
