// Service Worker for Powell River Amateur Radio App
const CACHE_NAME = 'prarc-app-cache-v1';

// Resources to cache initially
const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/index.js'
];

// Essential API routes to cache for offline use
const API_ROUTES_TO_CACHE = [
  '/api/frequencies',
  '/api/repeaters',
  '/api/reference'
];

// Install event - cache initial resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching initial resources');
        return cache.addAll(INITIAL_CACHED_RESOURCES);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Function to determine if a request should be cached
const shouldCache = (url) => {
  const parsedUrl = new URL(url);
  
  // Cache API routes specified in API_ROUTES_TO_CACHE
  if (API_ROUTES_TO_CACHE.some(route => parsedUrl.pathname.startsWith(route))) {
    return true;
  }
  
  // Cache static assets
  if (
    parsedUrl.pathname.endsWith('.css') || 
    parsedUrl.pathname.endsWith('.js') || 
    parsedUrl.pathname.endsWith('.png') || 
    parsedUrl.pathname.endsWith('.jpg') || 
    parsedUrl.pathname.endsWith('.svg') || 
    parsedUrl.pathname.endsWith('.ico') ||
    parsedUrl.pathname.endsWith('.html')
  ) {
    return true;
  }
  
  return false;
};

// Fetch event - network first, then cache for API routes
// Cache first, then network for static assets
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip caching for certain requests
  // - WebSocket connections
  // - Non-GET requests
  if (
    requestUrl.protocol === 'chrome-extension:' || 
    event.request.method !== 'GET' ||
    requestUrl.pathname.includes('/ws') || 
    requestUrl.pathname.includes('/socket.io')
  ) {
    return;
  }
  
  // For API requests - use network first, then cache
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before using it
          const responseToCache = response.clone();
          
          // Cache the successful response if it's from one of our API routes to cache
          if (shouldCache(event.request.url)) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // If network request fails, try to serve from cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If not in cache, return a simple offline message for API requests
              return new Response(
                JSON.stringify({
                  error: 'You are offline and this data is not cached.',
                  offline: true,
                  timestamp: new Date().toISOString()
                }), 
                {
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
  } 
  // For non-API requests - use cache first, then network
  else {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached response
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then((response) => {
              // Cache the response if it's valid and should be cached
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              if (shouldCache(event.request.url)) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
              
              return response;
            })
            .catch(() => {
              // If both cache and network fail, show offline page for navigations
              if (event.request.mode === 'navigate') {
                return caches.match('/offline.html')
                  .then((offlineResponse) => {
                    if (offlineResponse) {
                      return offlineResponse;
                    }
                    // If no offline page exists, return a simple message
                    return new Response(
                      '<html><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
                      {
                        headers: { 'Content-Type': 'text/html' }
                      }
                    );
                  });
              }
              
              // For other resources, return empty response
              return new Response();
            });
        })
    );
  }
});

// Sync event for background sync functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-logbook') {
    event.waitUntil(syncLogbookEntries());
  } else if (event.tag === 'sync-settings') {
    event.waitUntil(syncUserSettings());
  }
});

// Periodic background sync event for data updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-repeater-data') {
    event.waitUntil(updateRepeaterData());
  } else if (event.tag === 'update-reference-data') {
    event.waitUntil(updateReferenceData());
  }
});

// Function to sync logbook entries (to be implemented)
async function syncLogbookEntries() {
  // Get pending logbook entries from IndexedDB
  // Send to server
  // Update status in IndexedDB
  console.log('Syncing logbook entries...');
}

// Function to sync user settings (to be implemented)
async function syncUserSettings() {
  // Get user settings from local storage
  // Send to server
  console.log('Syncing user settings...');
}

// Function to update repeater data (to be implemented)
async function updateRepeaterData() {
  // Fetch latest repeater data from server
  // Update cache
  console.log('Updating repeater data...');
}

// Function to update reference data (to be implemented)
async function updateReferenceData() {
  // Fetch latest reference data from server
  // Update cache
  console.log('Updating reference data...');
}

// Listen for message from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_NEW_ROUTE') {
    // Cache a new route that client wants to ensure is available offline
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.add(event.data.url);
      })
      .then(() => {
        // Notify client that the route is cached
        if (event.source) {
          event.source.postMessage({
            type: 'ROUTE_CACHED',
            url: event.data.url
          });
        }
      });
  }
});