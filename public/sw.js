const CACHE_NAME = 'arcadegamefree-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Just cache the root page so it works offline or triggers the PWA install prompt
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
