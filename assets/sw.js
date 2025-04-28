const CACHE_NAME = 'pronouns-wiki-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/styles.min.css',
    '/assets/scripts.min.js',
    '/assets/favicons/pronouns-wiki.svg',
    '/assets/favicons/favicon-48x48.png',
    '/assets/favicons/favicon.svg',
    '/assets/favicons/favicon.ico',
    '/assets/favicons/apple-touch-icon.png',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Lexend:wght@400;600&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 