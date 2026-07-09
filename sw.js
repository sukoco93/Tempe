const CACHE_NAME = 'tempe-legend-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/constants.js',
    '/js/utils.js',
    '/js/db.js',
    '/js/mixins/dataMixin.js',
    '/js/mixins/computedMixin.js',
    '/js/mixins/crudMixin.js',
    '/js/mixins/uiMixin.js',
    '/js/mixins/exportImportMixin.js',
    'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,600;14..32,700;14..32,800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js',
    'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
    'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js',
    'https://unpkg.com/dexie@4.0.8/dist/dexie.js'
        // ICONS (tambahkan di sini)
    '/icon/icon-16.png',
    '/icon/icon-32.png',
    '/icon/icon-180.png',
    '/icon/icon-256.png',
    '/icon/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
