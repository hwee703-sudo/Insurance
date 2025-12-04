// Simple Service Worker for PWA
const CACHE_NAME = 'gap-calc-v1';

self.addEventListener('install', (event) => {
  // Force this new service worker to become the active one, bypassing the waiting state
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Tell the active service worker to take control of the page immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Just pass the request through to the network
  // This avoids caching issues where the app might get stuck on an old version
  event.respondWith(fetch(event.request));
});