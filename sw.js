/* =====================================================================
   國度321空中團契 · Service Worker
   ------------------------------------------------------------------
   目標：讓弱網、飛航模式、流量吃緊的家人也打得開。
   「打不開」等於「這個信仰的門關著」——所以離線是牧養問題，不是技術問題。

   ★ 每次更新 index.html，只要把下面的 VER 往上跳一號即可。
     舊快取會自動清掉，家人下次開啟會拿到新內容。
   ===================================================================== */
var VER   = "v2.8.2";
var SHELL = "k321-shell-" + VER;   /* App 本體：HTML／圖示／manifest */
var DATA  = "k321-data-"  + VER;   /* 內容：data.json 等 */
var IMG   = "k321-img-"   + VER;   /* 圖片：縮圖、QR */

/* 首次安裝就先存起來的檔案。找不到的檔案不會讓整個安裝失敗。 */
var PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png?v=3",
  "./icon-512.png?v=3",
  "./apple-touch-icon.png?v=3"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(SHELL).then(function(c){
      return Promise.all(PRECACHE.map(function(u){
        return c.add(new Request(u, {cache:"reload"}))["catch"](function(){ /* 缺檔就跳過 */ });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k===SHELL || k===DATA || k===IMG) return null;
        return caches["delete"](k);          /* 清掉上一版 */
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* 讓頁面可以要求立即接管（配合「內容已更新，點此重整」的提示） */
self.addEventListener("message", function(e){
  if(e && e.data && e.data.type==="SKIP_WAITING") self.skipWaiting();
});

function isNav(req){
  return req.mode==="navigate" || (req.method==="GET" && (req.headers.get("accept")||"").indexOf("text/html")>=0);
}

/* 內容檔：先給舊的、背景抓新的（stale-while-revalidate）——秒開又不會停在舊內容 */
function swr(e, cacheName){
  return caches.open(cacheName).then(function(c){
    return c.match(e.request).then(function(hit){
      var net = fetch(e.request).then(function(res){
        if(res && res.ok) c.put(e.request, res.clone());
        /* 檔案已被移除（例如同工刪掉了舊的 data.json）→ 快取也要跟著清，
           否則會永遠回舊內容，怎麼刪都沒用。 */
        else if(res && (res.status===404 || res.status===410)) c["delete"](e.request);
        return res;
      })["catch"](function(){ return hit; });
      if(hit){ e.waitUntil(net); return hit; }
      return net;
    });
  });
}

self.addEventListener("fetch", function(e){
  var req=e.request;
  if(req.method!=="GET") return;

  var url;
  try{ url=new URL(req.url); }catch(err){ return; }

  /* 只處理自己網域；YouTube、Worker API 一律讓瀏覽器自己走網路 */
  if(url.origin!==self.location.origin) return;

  /* 頁面導覽：先試網路（拿最新），失敗就用快取的 App 本體 —— 飛航模式也打得開 */
  if(isNav(req)){
    e.respondWith(
      fetch(req).then(function(res){
        if(res && res.ok){
          caches.open(SHELL).then(function(c){ c.put("./index.html", res.clone()); });
        }
        return res;
      })["catch"](function(){
        return caches.match("./index.html").then(function(hit){
          return hit || caches.match("./") || new Response(
            "<meta charset='utf-8'><div style=\"font-family:-apple-system,sans-serif;padding:40px;line-height:2;color:#16294A\">"
            +"<h2>目前沒有網路</h2><p>連上網路後再打開就好。<br>神的話語不受網路限制——今天仍然可以禱告、可以親近祂。</p></div>",
            {headers:{"Content-Type":"text/html; charset=utf-8"}});
        });
      })
    );
    return;
  }

  /* 內容 JSON：stale-while-revalidate */
  if(/\.json($|\?)/i.test(url.pathname+url.search)){
    e.respondWith(swr(e, DATA));
    return;
  }

  /* 圖片：先用快取（省流量），沒有才抓 */
  if(/\.(png|jpg|jpeg|webp|gif|svg|ico)($|\?)/i.test(url.pathname)){
    e.respondWith(
      caches.match(req).then(function(hit){
        if(hit) return hit;
        return fetch(req).then(function(res){
          if(res && res.ok) caches.open(IMG).then(function(c){ c.put(req, res.clone()); });
          return res;
        })["catch"](function(){ return hit; });
      })
    );
    return;
  }

  /* 其他同網域靜態檔：快取優先，背景更新 */
  e.respondWith(swr(e, SHELL));
});
