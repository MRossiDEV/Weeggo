const CACHE_NAME = "weeggo-shell-v2";

const APP_SHELL = [
  "/",
  "/landing",
  "/wizard",
  "/wizard/sell",
  "/selection",
  "/shortlist",
  "/profile",
  "/notifications",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );

  self.clients.claim();
});

// Staff-only surfaces (admin/agent dashboards, auth, and any API/action
// routes) are intentionally never cached — they're auth-gated and always
// need fresh data, so a stale offline copy would be actively misleading
// (e.g. an agent working from an out-of-date lead list) rather than helpful.
function isCacheable(url) {
  if (url.origin !== self.location.origin) return false;
  const path = url.pathname;
  return (
    !path.startsWith("/admin") &&
    !path.startsWith("/agent") &&
    !path.startsWith("/auth") &&
    !path.startsWith("/api")
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (!isCacheable(url)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseCopy = response.clone();

        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, responseCopy));

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Saved-search alerts (see lib/notifications/match.ts), sent as a Web Push
// message with a JSON payload of { title, body, url }.
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "WEEGGO", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "WEEGGO", {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: payload.url || "/" },
    })
  );
});

// Tapping the notification opens (or focuses) the mini swipe session for the
// new match(es) instead of just launching the app to whatever tab was last open.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
