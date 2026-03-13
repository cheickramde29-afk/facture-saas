// FacturePro Service Worker v1.0
const CACHE_NAME = 'facturepro-v1';
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;600;700&display=swap',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'
];

// Install — cache les assets
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS).catch(function(){ return; });
    })
  );
  self.skipWaiting();
});

// Activate — supprime anciens caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — Network first, cache fallback
self.addEventListener('fetch', function(e){
  // Skip Firebase API calls — toujours en ligne
  if(e.request.url.includes('firebasedatabase') ||
     e.request.url.includes('firebaseio') ||
     e.request.url.includes('googleapis.com/identitytoolkit')){
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(function(res){
        const clone = res.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(e.request, clone);
        });
        return res;
      })
      .catch(function(){
        return caches.match(e.request);
      })
  );
});
