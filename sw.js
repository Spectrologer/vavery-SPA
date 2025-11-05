// Service Worker for caching and offline capability
const CACHE_NAME = 'vavery-portfolio-v1.0.1';
const STATIC_CACHE = 'vavery-static-v1.0.1';
const DYNAMIC_CACHE = 'vavery-dynamic-v1.0.1';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/main.js',
    '/canvas-animation.js',
    '/theme.js',
    '/navigation.js',
    '/forms.js',
    '/accessibility.js',
    '/data-binding.js',
    '/images/me.webp',
    '/images/bubble.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) return;

    // Handle API requests (JSON data)
    if (url.pathname.startsWith('/data/')) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) return response;

                    return fetch(request).then(networkResponse => {
                        if (!networkResponse.ok) throw new Error('Network response not ok');

                        return caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        });
                    });
                })
                .catch(() => {
                    // Return cached version if available
                    return caches.match('/data/projects.json');
                })
        );
        return;
    }

    // Handle image requests with cache-first strategy
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) return response;

                    return fetch(request).then(networkResponse => {
                        if (!networkResponse.ok) throw new Error('Network response not ok');

                        return caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        });
                    });
                })
                .catch(() => {
                    // Return a placeholder for failed image requests
                    return new Response('', { status: 404 });
                })
        );
        return;
    }

    // Default strategy: cache-first for static assets, network-first for HTML
    if (request.destination === 'document' || request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    if (!networkResponse.ok) throw new Error('Network response not ok');

                    return caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
    } else {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) return response;

                    return fetch(request).then(networkResponse => {
                        if (!networkResponse.ok) throw new Error('Network response not ok');

                        return caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        });
                    });
                })
        );
    }
});
