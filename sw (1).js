const CACHE = "studio-v2.0.0";
const CORE = ["./","./index.html","./manifest.json","./icona-192.png","./icona-512.png"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", event => { if (event.request.method !== "GET") return; event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(c => c.put(event.request, copy)); return response; }).catch(() => event.request.mode === "navigate" ? caches.match("./index.html") : cached))); });
self.addEventListener("message", event => { if (event.data === "SKIP_WAITING") self.skipWaiting(); });
