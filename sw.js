const CACHE_NAME = 'myg-trip-v2';
const urlsToCache =[
'./',
'./index.html',
'./manifest.json',
'./frontend/css/styles.css',
'./frontend/js/tailwind.config.js',
'./frontend/js/config.js',
'./frontend/js/app.js',
'./frontend/js/auth.js',
'./frontend/js/ui.js',
'./frontend/js/rolodex.js',
'./frontend/js/registration.js',
'./frontend/js/profile.js',
'./frontend/js/Pairing_Grouping.js',
'./frontend/js/attendance.js',
'./frontend/js/settings.js'
];

self.addEventListener('install', event => {
event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
event.respondWith(
  caches.match(event.request).then(response => {
    return response || fetch(event.request).catch(() => caches.match('./index.html'));
  })
);
});