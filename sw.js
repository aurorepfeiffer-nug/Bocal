// Le Bocal : fonctionne hors ligne. Changer VERSION à chaque mise en ligne.
const VERSION = 'bocal-8';
const BASE = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
function avecDelai(p, ms) { return new Promise((ok, ko) => { const t = setTimeout(() => ko(new Error('lent')), ms); p.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); ko(e); }); }); }
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open(VERSION).then(c => c.match(req).then(r => r || fetch(req).then(n => { c.put(req, n.clone()); return n; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // la page : le réseau d'abord (pour les mises à jour), le cache si le réseau est absent ou lent
  e.respondWith(caches.open(VERSION).then(c => avecDelai(fetch(req), 2500).then(n => { if (n.ok) c.put(req, n.clone()); return n; }).catch(() => c.match(req).then(r => r || c.match('index.html')))));
});
