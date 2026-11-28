/* Palmeira app service worker: network-first for the app page (so every update shows right away),
   offline fallback to the last copy, and cache for project photos. Other sites in this repo are not touched. */
const SHELL='pp-shell-v1',IMG='pp-img-v1';
const APP=()=>[self.registration.scope,self.registration.scope+'index.html'];
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.filter(k=>k!==SHELL&&k!==IMG).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;let u;try{u=new URL(r.url)}catch(x){return}
 if(u.origin!==self.location.origin)return;const path=u.origin+u.pathname;
 if(r.mode==='navigate'&&APP().includes(path)){e.respondWith((async()=>{try{const res=await fetch(path,{cache:'no-cache',credentials:'same-origin'});if(res&&res.ok){const c=await caches.open(SHELL);c.put(self.registration.scope,res.clone()).catch(()=>{})}return res}catch(err){const c=await caches.open(SHELL);return (await c.match(self.registration.scope))||Response.error()}})());return}
 if(path.startsWith(self.registration.scope+'media/')||path.startsWith(self.registration.scope+'renders/')){e.respondWith((async()=>{const c=await caches.open(IMG),hit=await c.match(r);const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone()).catch(()=>{});return res}).catch(()=>hit||Response.error());return hit||net})())}
});
