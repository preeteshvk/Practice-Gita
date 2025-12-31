const CACHE_NAME = 'gita-v2';
const ASSETS = [
  './',
  //Html
  './index.html',
  './AdhyayPath.html',
  './CharanBodha.html',
  './Shlokank.html',
  './about.html',
  './features.html',
  './request.html',
  './support.html',
  './userguide.html', 
  './resources.html',
    
  //css
  './style.css',

  //js
  './bodha.js',
  './path.js',
  './practice.js',
  './menu.js',
  './theme.js',
  './app.js',

  //json
  './verse.json',
  './manifest.json',

  //images
  './icon-192.png',
  './icon-512.png',
  './og-baner.jpg',

  //Don't add sw.js

  // Local Font Path
  './fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf'
];

// Install: Cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// Fetch: Serve from cache first, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
