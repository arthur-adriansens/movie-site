const CACHE_NAME = "core-archive-v1";
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/manifest.json",
    "https://cdn.tailwindcss.com",
    "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@500;700;800&display=swap",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS).catch(() => {
                    // Ignore errors for external resources that may not be available
                    return Promise.resolve();
                });
            })
            .then(() => self.skipWaiting()),
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    }),
                );
            })
            .then(() => self.clients.claim()),
    );
});

// Fetch event - network first, fall back to cache
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin and API requests for some specific patterns
    if (
        url.hostname !== self.location.hostname &&
        !url.hostname.includes("themoviedb.org") &&
        !url.hostname.includes("googleapis.com") &&
        !url.hostname.includes("gstatic.com")
    ) {
        return;
    }

    // For HTML documents and API calls, use network-first strategy
    if (request.mode === "navigate" || url.pathname.includes("/api/")) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful responses
                    if (response.ok) {
                        const clonedResponse = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clonedResponse);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return cached version if network fails
                    return caches.match(request).then((cachedResponse) => {
                        return (
                            cachedResponse ||
                            new Response("Offline - Please check your connection", {
                                status: 503,
                                statusText: "Service Unavailable",
                            })
                        );
                    });
                }),
        );
        return;
    }

    // For other requests (images, CSS, JS), use cache-first strategy
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request)
                .then((response) => {
                    if (!response || response.status !== 200 || response.type === "error") {
                        return response;
                    }
                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => {
                    // Return a placeholder for failed image requests
                    if (request.destination === "image") {
                        return new Response(
                            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect fill="#1a1a1a" width="400" height="600"/><text x="200" y="300" text-anchor="middle" fill="#666" font-size="16">Image unavailable</text></svg>',
                            { headers: { "Content-Type": "image/svg+xml" } },
                        );
                    }
                    return new Response("Resource unavailable offline");
                });
        }),
    );
});

// Handle messages from the client
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
