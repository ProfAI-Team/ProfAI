// Phase 6 task 6.23 — minimal web-push service worker. Served from
// /service-worker.js so PushManager.subscribe works against the same
// origin as the app. Kept tiny on purpose: every change needs a
// service-worker update cycle, so the fewer moving parts the better.

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (err) {
    payload = { title: 'ProfAI', body: event.data.text() };
  }

  const title = payload.title || 'ProfAI';
  const options = {
    body: payload.body || '',
    data: { url: payload.url || '/me/reviews' },
    tag: payload.tag || 'profai',
    renotify: false,
    icon: '/icon-192.png',
    badge: '/icon-badge.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      // Focus an existing tab if one is already pointed at our origin,
      // otherwise spin up a new one.
      for (const client of allClients) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl)) return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});
