const CACHE_NAME = 'pronouns-wiki-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Files to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/styles.min.css',
  '/assets/scripts.min.js',
  '/assets/favicons/favicon.ico',
  '/assets/favicons/favicon.svg',
  '/assets/favicons/apple-touch-icon.png',
  '/assets/favicons/pronouns-wiki.svg',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE)
    ])
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('pronouns-wiki-') || 
                   cacheName.startsWith('static-cache-') || 
                   cacheName.startsWith('dynamic-cache-');
          })
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add any data that needs to be synced
      }),
    });

    if (!response.ok) {
      throw new Error('Sync failed');
    }

    return response.json();
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/assets/favicons/apple-touch-icon.png',
    badge: '/assets/favicons/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/assets/favicons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/favicons/x-mark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Pronouns Wiki Update', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 