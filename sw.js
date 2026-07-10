const CACHE_NAME = 'tempe-legend-v2';
const OFFLINE_URL = './index.html';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './config.js',
  './utils.js',
  './db.js',
  './store.js',
  './computed.js',
  './watch.js',
  './methods.js',
  './lifecycle.js',
  './app.js',
  './manifest.json',
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
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(ASSETS);
        await self.skipWaiting();
      } catch (err) {
        console.error('[SW] Gagal cache:', err);
      }
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const request = event.request;

  // Manifest: selalu coba network dulu, fallback ke cache
  if (url.pathname.endsWith('/manifest.json')) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, res.clone());
          return res;
        } catch (err) {
          const cached = await caches.match(request);
          return cached || new Response('Not found', { status: 404 });
        }
      })()
    );
    return;
  }

  // Navigasi halaman (termasuk saat buka PWA / index.html)
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html')) {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(request);
          if (networkRes && networkRes.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkRes.clone());
          }
          return networkRes;
        } catch (err) {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          return new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Aset lain: cache-first, refresh di background
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        // Refresh cache di background, tidak diblokir
        fetch(request).then(async networkRes => {
          if (networkRes && networkRes.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkRes.clone());
          }
        }).catch(() => {});
        return cached;
      }

      try {
        const res = await fetch(request);
        if (res && res.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, res.clone());
        }
        return res;
      } catch (err) {
        if (request.mode === 'navigate') {
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
        }
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
