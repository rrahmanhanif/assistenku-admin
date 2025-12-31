// public/sw.js
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Passthrough fetch (cukup untuk PWA installable)
self.addEventListener("fetch", () => {});
