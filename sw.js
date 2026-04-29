// MUDEPA Service Worker - v3.0.0
// Ce service worker ne met PAS en cache pour éviter les problèmes de version

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Supprimer tous les anciens caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Toujours aller chercher sur le réseau en priorité
  // Fallback sur cache uniquement si réseau indisponible
  if (event.request.method !== 'GET') return;
  
  // Ne pas intercepter les requêtes Firebase
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('google') ||
      event.request.url.includes('gstatic')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre en cache les ressources statiques
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open('mudepa-v3.0.0').then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Pas de réseau → utiliser le cache
        return caches.match(event.request)
          .then(cached => cached || caches.match('/index.html'));
      })
  );
});
