// Minimal Service Worker to make the app installable
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Basic pass-through fetch. 
  // In a full production app, you might want to cache assets here.
  e.respondWith(fetch(e.request));
});