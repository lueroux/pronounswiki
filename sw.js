const CACHE_NAME = 'pronouns-wiki-v1';
const urlsToCache = [
  '/',
  '/assets/styles.min.css',
  '/assets/scripts.min.js',
  '/assets/favicons/pronouns-wiki.svg',
  '/assets/favicons/favicon-48x48.png',
  '/assets/favicons/favicon.svg',
  '/assets/favicons/favicon.ico',
  '/assets/favicons/apple-touch-icon.png',
  '/assets/favicons/site.webmanifest',
  'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'submit-form') {
    event.waitUntil(
      // Process any pending form submissions
      processPendingSubmissions()
    );
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/assets/favicons/pronouns-wiki.svg',
    badge: '/assets/favicons/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Learn More',
        icon: '/assets/favicons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/favicons/x.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Pronouns Wiki', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle offline form submissions
async function processPendingSubmissions() {
  const db = await openDatabase();
  const submissions = await db.getAll('pendingSubmissions');
  
  for (const submission of submissions) {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission.data)
      });

      if (response.ok) {
        await db.delete('pendingSubmissions', submission.id);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
    }
  }
}

// Helper function to open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PronounsWikiDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingSubmissions')) {
        db.createObjectStore('pendingSubmissions', { keyPath: 'id' });
      }
    };
  });
} 