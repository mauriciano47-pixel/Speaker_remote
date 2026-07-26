const CACHE_NAME = 'speaker-remote-v2';
const ASSETS = [
    './',
    './index.html',
    './index.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Instalar: cachear todos los recursos
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activar: limpiar caches antiguas
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// Fetch: cache-first con fallback a red y captura de errores sin conexión
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request)
            .then(cachedResponse => {
                if (cachedResponse) return cachedResponse;
                return fetch(e.request).catch(() => {
                    if (e.request.mode === 'navigate') {
                        return caches.match('./index.html') || caches.match('./');
                    }
                    return new Response('', { status: 408, statusText: 'Offline Request Timeout' });
                });
            })
    );
});
