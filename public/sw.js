const CACHE_NAME = "assistenku-admin-v2";

const ADMIN_ASSETS = [
  "/admin",
  "/apps/admin/login.html",
  "/apps/admin/dashboard.html",
  "/apps/admin/master-layanan.html",
  "/apps/admin/master-mitra.html",
  "/apps/admin/master-customer.html",
  "/apps/admin/orders.html",
  "/apps/admin/finance.html",
  "/apps/admin/settings.html",
  "/apps/admin/assets/app.css",
  "/apps/admin/assets/app.js",
  "/apps/admin/assets/auth.js",
  "/apps/admin/assets/api.js",
  "/apps/admin/assets/runtime-config.js",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ADMIN_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Jangan intercept API
  if (req.url.includes("/api/")) {
    return;
  }

  // Navigasi (HTML): network-first, fallback ke cache admin
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(req.url).then((r) => r || caches.match("/admin"))
      )
    );
    return;
  }

  // Asset admin: cache-first
  if (ADMIN_ASSETS.some((asset) => req.url.includes(asset))) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
