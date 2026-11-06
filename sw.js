/* Service worker: o site abre mesmo sem internet, mas sempre busca a versão mais nova quando há conexão. */
var VERSAO = 'arena-v1';

self.addEventListener('install', function () { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (chaves) { return Promise.all(chaves.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  // só arquivos do próprio site; as chamadas ao Supabase e às bibliotecas externas passam direto
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res.ok) { var copia = res.clone(); caches.open(VERSAO).then(function (c) { c.put(req, copia); }); }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || caches.match('app.html'); });
    })
  );
});
