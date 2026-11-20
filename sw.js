/* Kamba CRM: guarda a aplicação no aparelho para abrir sem internet.
   Os pedidos à base de dados (supabase.co) nunca passam por aqui. */
const VERSAO = 'kamba-v6';
const BASE = ['app.html', 'index.html', 'manifest.webmanifest', 'assets/supabase.js', 'assets/favicon.svg', 'assets/icon-192.png', 'assets/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSAO)
      .then((c) => c.addAll(BASE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co')) return;

  const mesmaOrigem = url.origin === self.location.origin;
  if (mesmaOrigem && req.mode === 'navigate') {
    // páginas: tenta a rede durante 2,5 s (para trazer versões novas). Se a ligação for lenta ou falhar, abre a cópia guardada.
    const copia = () => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match(req.url.includes('app.html') ? 'app.html' : 'index.html'));
    const rede = fetch(req).then((r) => { const c = r.clone(); caches.open(VERSAO).then((x) => x.put(req, c)); return r; });
    const limite = new Promise((res) => setTimeout(() => res(null), 2500));
    e.respondWith(
      Promise.race([rede, limite]).then((r) => r || copia().then((c) => c || rede)).catch(() => copia()),
    );
    return;
  }
  // ficheiros: responde logo com a cópia e atualiza em segundo plano
  e.respondWith(
    caches.match(req).then((guardado) => {
      const rede = fetch(req)
        .then((r) => { if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(VERSAO).then((x) => x.put(req, c)); } return r; })
        .catch(() => guardado);
      return guardado || rede;
    }),
  );
});
