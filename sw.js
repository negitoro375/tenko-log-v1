// オフラインでも開けるようにするための仕組み。
// 方針：まずネットから最新を取りに行き、つながらないときだけ保存しておいたものを使う。
// 画面やファイルを増やしたら FILES に足し、CACHE の番号を1つ上げる。
const CACHE = 'tenko-log-v1-cache-2';
const FILES = ['./', './index.html', './manifest.webmanifest', './assets/icon-180.png', './assets/icon-192.png', './assets/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
