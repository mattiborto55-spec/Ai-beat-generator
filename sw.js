// ===================================================================
//  Il service worker: la parte che rende l'app un'app vera.
//  Al primo caricamento mette da parte una copia di tutto quanto.
//  Da lì in poi la pagina si apre anche senza internet, in aereo,
//  in cantina, ovunque — perché non chiede più niente alla rete.
// ===================================================================
const CACHE = "studio-basi-v4";

// le cose senza cui l'app non parte
const ROBA = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icona-192.png",
  "./icona-512.png"
];

// 1. installazione: si scarica tutto e si tiene da parte
self.addEventListener("install", evento => {
  evento.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ROBA))
      .then(() => self.skipWaiting())
  );
});

// 2. attivazione: si buttano le copie vecchie, così un aggiornamento
//    dell'app non resta bloccato dietro alla versione precedente
self.addEventListener("activate", evento => {
  evento.waitUntil(
    caches.keys()
      .then(chiavi => Promise.all(
        chiavi.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// 3. ogni richiesta: prima si guarda in casa, e solo se non c'è si esce.
//    Quello che arriva dalla rete viene messo da parte per la volta dopo
//    (è così che i caratteri di Google finiscono in cache e l'app resta
//    identica anche offline).
self.addEventListener("fetch", evento => {
  const richiesta = evento.request;
  if (richiesta.method !== "GET") return;

  evento.respondWith(
    caches.match(richiesta).then(trovato => {
      if (trovato) return trovato;

      return fetch(richiesta).then(risposta => {
        // le risposte "opaque" (caratteri esterni) hanno status 0: si tengono lo stesso
        if (risposta && (risposta.ok || risposta.type === "opaque")){
          const copia = risposta.clone();
          caches.open(CACHE).then(c => c.put(richiesta, copia)).catch(() => {});
        }
        return risposta;
      }).catch(() => {
        // offline e non ce l'abbiamo: se stava aprendo una pagina, diamo la nostra
        if (richiesta.mode === "navigate") return caches.match("./index.html");
        return new Response("", { status: 504, statusText: "offline" });
      });
    })
  );
});
