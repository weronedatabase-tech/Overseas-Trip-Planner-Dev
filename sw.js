const CACHE_NAME = 'otp-mpa-v20';
const urlsToCache = [
'./',
'./index.html',
'./register.html',
'./dashboard.html',
'./roster.html',
'./logistics.html',
'./attendance.html',
'./finance.html',
'./minutes.html',
'./files.html',
'./settings.html',
'./medical.html',
'./manifest.json',
'./frontend/css/styles.css',
'./frontend/js/tailwind.config.js',
'./backend/config.js',
'./frontend/js/api.js',
'./frontend/js/state.js',
'./frontend/js/ui.js',
'./frontend/js/main.js',
'./frontend/js/auth.js',
'./frontend/js/rolodex.js',
'./frontend/js/registration.js',
'./frontend/js/profile.js',
'./frontend/js/participants.js',
'./frontend/js/logistics.js',
'./frontend/js/attendance.js',
'./frontend/js/finance.js',
'./frontend/js/minutes.js',
'./frontend/js/files.js',
'./frontend/js/settings.js',
'./frontend/js/medical.js'
];

self.addEventListener('install', event => {
self.skipWaiting();
event.waitUntil(
caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
);
});

self.addEventListener('activate', event => {
const cacheWhitelist = [CACHE_NAME];
event.waitUntil(
caches.keys().then(cacheNames => {
  return Promise.all(
    cacheNames.map(cacheName => {
      if (!cacheWhitelist.includes(cacheName)) {
        return caches.delete(cacheName);
      }
    })
  );
}).then(() => self.clients.claim())
);
});

self.addEventListener('fetch', event => {
if (event.request.method !== 'GET') return;
if (event.request.url.includes('script.google.com')) return;

event.respondWith(
caches.match(event.request).then(cachedResponse => {
  const fetchPromise = fetch(event.request).then(networkResponse => {
    caches.open(CACHE_NAME).then(cache => {
      cache.put(event.request, networkResponse.clone());
    });
    return networkResponse;
  }).catch(() => {});
  return cachedResponse || fetchPromise;
})
);
});