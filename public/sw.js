// public/sw.js
const STATIC_CACHE = "static-v1";
const PAGES_CACHE = "pages-v1";

self.addEventListener("install", (event) => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  const isMyRoute = url.pathname === "/my" || url.pathname.startsWith("/my/");

  if (req.mode === "navigate" && isMyRoute) {
    event.respondWith(
      caches.open(PAGES_CACHE).then(async (cache) => {
        try {
          const res = await fetch(req);
          if (res && res.ok) {
            cache.put(req, res.clone());
          }
          return res;
        } catch (err) {
          const cached = await cache.match(req);
          if (cached) return cached;
          const fallback = await cache.match("/my");
          if (fallback) return fallback;
          return Response.error();
        }
      })
    );
    return;
  }

  // Never touch 
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/logout")
  ) {
    return; // network default
  }

  // Cache static assets
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icon")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
      })
    );
  }
});
