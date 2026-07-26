const CACHE_NAME = 'speaker-remote-v1.5.0';
const ASSETS = [
    './',
    './index.html',
    './index.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Instalar: forzar instalación inmediata
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Activar: eliminar cualquier cache antigua y tomar el control de clientes
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Network-first para index.html y app.js para garantizar siempre la versión más reciente v1.5.0
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    const url = new URL(e.request.url);
    if (url.pathname.endsWith('index.html') || url.pathname.endsWith('app.js') || url.pathname.endsWith('/')) {
        e.respondWith(
            fetch(e.request).then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
                return response;
            }).catch(() => caches.match(e.request))
        );
        return;
    }

    e.respondWith(
        caches.match(e.request).then(cached => {
            return cached || fetch(e.request).then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
                return response;
            });
        }).catch(() => new Response('', { status: 408 }))
    );
});
