// Service Worker for XSpace Store PWA
const CACHE_NAME = 'xspace-store-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/app-detail.html',
  '/css/styles.css',
  '/js/config.js',
  '/js/utils.js',
  '/js/app.js',
  '/js/app-detail.js',
  '/js/pwa.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.imgur.com/k0zikhA.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Open cache and store the response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If network fails and no cache, return offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-apps') {
    event.waitUntil(syncApps());
  }
});

// Push notification
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Có ứng dụng mới từ XSpace Store!',
    icon: 'assets/icons/icon-192.png',
    badge: 'assets/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Khám phá'
      },
      {
        action: 'close',
        title: 'Đóng'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('XSpace Store', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Do nothing
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync apps data
async function syncApps() {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzV-xtpBnZVJY_rlotS5OBfvPthe7ftWCst4wvXiUv780Gp-JkrKLwTQ4MfFuxusOk/exec?action=getApps');
    const data = await response.json();
    
    if (data.success) {
      const cache = await caches.open(CACHE_NAME);
      const response = new Response(JSON.stringify(data.data));
      await cache.put('/api/apps', response);
      console.log('Apps data synced');
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}