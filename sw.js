const CACHE_NAME = 'potgrowhubstore-v3';
const ASSETS = ['/', '/index.html', '/manifest.json', '/offline.html', '/public/potgrowhub-gurabridge.js', '/public/potgrowhub-runtime.js'];

async function enhanceDocument(response) {
  if (!response || !response.ok) return response;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;
  let html = await response.text();
  html = html.replaceAll('https://github.com/potgrowhub/potgrowhubstore', 'https://potgrowhub.store');
  html = html.replaceAll('GTM-PZV9GJLW', 'GTM-KN8SMF48');
  html = html.replace(/<link rel="canonical" href="[^"]+">/i, '<link rel="canonical" href="https://potgrowhub.store/">');
  html = html.replace('</head>', '<script src="/public/potgrowhub-gurabridge.js" defer></script><script src="/public/potgrowhub-runtime.js" defer></script></head>');
  return new Response(html, { status: response.status, headers: response.headers });
}

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(() => {}))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const network = await fetch(e.request);
      const response = e.request.mode === 'navigate' ? await enhanceDocument(network) : network;
      const copy = response.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, copy)).catch(() => {});
      return response;
    } catch (_) {
      const cached = await caches.match(e.request);
      if (cached) return cached;
      if (e.request.mode === 'navigate') return caches.match('/offline.html');
      return new Response('', { status: 503 });
    }
  })());
});
