const CACHE_NAME = 'tempe-legend-v2';
const OFFLINE_URL = '/index.html';

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/config.js',
  '/utils.js',
  '/db.js',
  '/store.js',
  '/computed.js',
  '/watch.js',
  '/methods.js',
  '/lifecycle.js',
  '/app.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,600;14..32,700;14..32,800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js',
  'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
  'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js',
  'https://cdn.jsdelivr.net/npm/dexie@4.0.8/dist/dexie.min.js',
  'https://cdn.jsdelivr.net/npm/vue-virtual-scroller@1.1.2/dist/vue-virtual-scroller.umd.min.js',
  'https://cdn.jsdelivr.net/npm/vue-virtual-scroller@1.1.2/dist/vue-virtual-scroller.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Gagal cache:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const request = event.request;

  if (url.pathname === '/manifest.json') {
    event.respondWith(
      fetch(request).then(res => {
        const cloned = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
        return res;
      }).catch(() => caches.match(request))
    );
    return;
  }

  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(networkRes => {
          if (networkRes && networkRes.status === 200) {
            const cloned = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          }
          return networkRes;
        }).catch(() => null);
        return cached || fetchPromise || caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        fetch(request).then(networkRes => {
          if (networkRes && networkRes.status === 200) {
            const cloned = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(res => {
        if (res && res.status === 200) {
          const cloned = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
        }
        return res;
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match(OFFLINE_URL);
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
