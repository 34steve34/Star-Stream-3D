// Star Stream PWA - VERSION 3.8.0 - 2026-02-12
// v3.8.0: gemini pro added bullet velocity by calc gun tip movement through one frame
// v3.7.0: Fixed rotational kick physics (ω × r), scope persistence, bloom edge-clamping
// v3.6.2: Added target motion orbitSpeed, ship velocity to bullet, rotational KICK debug
// v3.6.0: Added debug code for rotational KICK of bullet
// v3.5.0: Added ship velocity to bullet (bullet drifts with ship and rotation of ship)
// Bigger stars: THREE.PointsMaterial({ color: 0xffffff, size: 12, transparent: true })
// FIXED: Removed all delta time, back to frame-locked physics

const CACHE_NAME = 'star-stream-3D-v3.8.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon192.png',
  './icon512.png',
  './libs/three.module.js',
  './libs/loaders/GLTFLoader.js',
  './libs/utils/BufferGeometryUtils.js',
  './assets/ship.glb'
];

// Install event - cache all files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app files');
        // Cache files individually so one 404 doesn't break everything
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn('Failed to cache:', url, err.message);
            });
          })
        );
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
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
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - serve from cache, fall back to network
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
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
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