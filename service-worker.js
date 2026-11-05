const CACHE_NAME = 'ziada-analysis-v1';
const urlsToCache = [
  './',
  './index.html',
  './admin.html',
  './tactical.html',
  './individual.html',
  './live.html',
  './head_coach.html',
  './goalkeeper.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});