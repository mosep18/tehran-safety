const CACHE = 'tehran-safety-v2';
const CORE = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './assets/source-data.js', './assets/handbook.txt', './assets/handbook.pdf', './assets/fonts/Vazirmatn-var.woff2', './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match('./index.html'))));
});
