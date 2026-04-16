const CACHE_NAME = 'ecliptica-v1';
const ASSETS = [
  '/',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/images/ecliptica main banner.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
