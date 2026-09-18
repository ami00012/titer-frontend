// Kill switch for the previous product's service worker. That app registered
// a service worker in visitors' browsers; this repo never has. Browsers keep
// serving whatever that worker cached (stale <title>, stale HTML) until its
// script changes or 404s enough times to trigger auto-unregistration, which
// can take up to a day. This file replaces it and forces an immediate,
// one-time unregister + reload so visitors see the current site right away.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
