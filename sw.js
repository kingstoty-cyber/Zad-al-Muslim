const CACHE_NAME = 'zad-al-muslim-v4-4-1';
const APP_ASSETS = [
  './', './index.html', './offline.html', './styles.css', './data.js', './app.js', './quran.js', './prayer-v42.js', './enhancements-v43.js', './quran-v44.js',
  './assets/css/fontawesome.min.css', './assets/css/local-fonts.css',
  './assets/webfonts/fa-solid-900.woff2', './assets/webfonts/fa-regular-400.woff2',
  './assets/fonts/amiri.ttf', './assets/fonts/tajawal-300.ttf', './assets/fonts/tajawal-500.ttf', './assets/fonts/tajawal-800.ttf',
  './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './quran-data/chapters.json', './quran-data/uthmani.json', './quran-data/navigation.json', './QURAN_DATA_LICENSE.txt', './THIRD_PARTY_ASSETS.txt'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put('./index.html', response.clone()));
      return response;
    }).catch(async () => (await caches.match('./index.html')) || caches.match('./offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => {
    const network = fetch(event.request).then(response => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
      return response;
    });
    if (cached) {
      network.catch(() => {});
      return cached;
    }
    return network;
  }).catch(() => new Response('', {status: 504, statusText: 'Offline'})));
});
