const CACHE_NAME = 'zad-al-muslim-v4-8-2';
const AUDIO_CACHE = 'zad-quran-audio-v45';
const SURAH_AUDIO_CACHE = 'zad-quran-surah-audio-v461';
const APP_ASSETS = [
  './', './index.html', './offline.html', './styles.css', './config.js', './data.js', './app.js', './quran.js', './prayer.js', './enhancements.js', './quran-features.js', './quran-audio.js', './surah-audio.js', './quran-library.js', './audio-downloads.js', './quran-v48.js', './quran-video.js', './app-shell.js',
  './assets/css/fontawesome.min.css', './assets/css/local-fonts.css',
  './assets/webfonts/fa-solid-900.woff2', './assets/webfonts/fa-regular-400.woff2',
  './assets/fonts/amiri.ttf', './assets/fonts/tajawal-300.ttf', './assets/fonts/tajawal-500.ttf', './assets/fonts/tajawal-800.ttf',
  './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './quran-data/chapters.json', './quran-data/uthmani.json', './quran-data/navigation.json', './quran-data/reciters.json', './quran-data/surah-reciters.json', './QURAN_DATA_LICENSE.txt', './THIRD_PARTY_ASSETS.txt'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([self.registration.navigationPreload?.enable(),caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME && key !== AUDIO_CACHE && key !== SURAH_AUDIO_CACHE).map(key => caches.delete(key))))]).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'GET_VERSION') event.source?.postMessage({type:'APP_VERSION',version:'4.8.2'});
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith((event.preloadResponse||Promise.resolve()).then(preloaded=>preloaded||fetch(event.request)).then(response => {
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
