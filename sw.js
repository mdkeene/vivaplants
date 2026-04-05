const CACHE_NAME = "viva-plants-v2";

const urlsToCache = [
    "/",
    "/index.html",
    "/styles.css",
    "/app.js",
    "/db.js",
    "/plants.js",
    "/manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});