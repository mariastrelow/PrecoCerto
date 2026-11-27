const VERSAO_CACHE = "precocerto-v2";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/armazenamento.js",
  "./js/calculos.js",
  "./js/validacao.js",
  "./js/estado.js",
  "./js/interface.js",
  "./js/navegacao.js",
  "./js/app.js",
  "./data/dados.json",
  "./assets/imagens/icone.svg"
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(VERSAO_CACHE).then(function (cache) {
      return cache.addAll(ARQUIVOS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes
          .filter(function (nome) { return nome !== VERSAO_CACHE; })
          .map(function (nome) { return caches.delete(nome); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (evento) {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    caches.match(evento.request, { ignoreSearch: true }).then(function (respostaCache) {
      return respostaCache || fetch(evento.request);
    })
  );
});
