const CACHE_NAME = 'myg-trip-v1';
const urlsToCache =[
 './',
 './index.html',
 './styles.css',
 './tailwind.config.js',
 './app.js',
 './auth.js',
 './ui.js',
 './rolodex.js',
 './registration.js',
 './profile.js',
 './Pairing_Grouping.js', // Updated file name here
 './attendance.js',
 './settings.js'
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