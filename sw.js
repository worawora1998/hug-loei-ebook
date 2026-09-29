const CACHE = 'hug-loei-v3-1-shell-1';
const SHELL = [
  './', './index.html', './styles.css', './app.js', './update.html', './update.css', './update.js', './manifest.webmanifest',
  './previews/page-001.jpg', './previews/page-002.jpg', './previews/page-003.jpg',
  './assets/logos/mini/hug-loei-main.png', './assets/logos/mini/loei-province.png', './assets/logos/mini/loei-culture.png', './assets/logos/mini/tourism-fund.png'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('hug-loei-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
async function cacheFirst(req){const c=await caches.open(CACHE);const hit=await c.match(req);if(hit)return hit;try{const res=await fetch(req);if(res&&res.ok)c.put(req,res.clone());return res}catch(_){return hit||Response.error()}}
async function stale(req){const c=await caches.open(CACHE);const hit=await c.match(req);const net=fetch(req).then(res=>{if(res&&res.ok)c.put(req,res.clone());return res}).catch(()=>null);return hit||(await net)||Response.error()}
async function networkFirst(req){const c=await caches.open(CACHE);try{const res=await fetch(req,{cache:'no-store'});if(res&&res.ok)c.put(req,res.clone());return res}catch(_){return (await c.match(req))||Response.error()}}
self.addEventListener('fetch', event => {
  const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  if(url.pathname.endsWith('/config.js')||url.pathname.endsWith('/index.html')||url.pathname==='/' ) event.respondWith(networkFirst(req));
  else if(url.pathname.includes('/pages/')) event.respondWith(cacheFirst(req));
  else if(url.pathname.includes('/previews/')||url.pathname.includes('/thumbs/')) event.respondWith(stale(req));
  else event.respondWith(stale(req));
});
