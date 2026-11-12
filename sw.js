const C="henshu-1794467107";
const F=["./","index.html","manifest.json","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  /* 本体：まずネットから新しいものを取りにいく。電波が弱くて4秒で来なければ、手元の保存版ですぐ起動する（取りにいった分は裏で保存して、次に開いたときに使う） */
  if(r.mode==="navigate"||u.pathname.endsWith(".html")||u.pathname.endsWith("/")){
    const net=fetch(r,{cache:"no-store"}).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));}return res;});
    const cached=()=>caches.match(r).then(m=>m||caches.match("index.html"));
    e.respondWith(new Promise(ok=>{let done=false;const t=setTimeout(()=>{cached().then(m=>{if(m&&!done){done=true;ok(m);}});},4000);
      net.then(res=>{if(!done){done=true;clearTimeout(t);ok(res);}}).catch(()=>{cached().then(m=>{if(!done){done=true;clearTimeout(t);ok(m||Response.error());}});});}));
    e.waitUntil(net.catch(()=>{}));return;}
  e.respondWith(caches.match(r).then(m=>m||fetch(r)));});
