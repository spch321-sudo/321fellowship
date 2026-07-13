/* 國度321空中團契 App — Service Worker（架構版）
   更新任何檔案時，把 CACHE 版本號 +1，即可讓家人取得新版。 */
var CACHE = "k321-shell-v1";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var url = e.request.url;
  // 內容資料：優先連網（拿最新），失敗再用快取
  if(url.indexOf("data.json")>-1 || url.indexOf("data.js")>-1){
    e.respondWith(
      fetch(e.request).then(function(res){
        var copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(e.request,copy); });
        return res;
      }).catch(function(){ return caches.match(e.request); })
    );
    return;
  }
  // 其餘（外殼）：優先快取，離線可用
  e.respondWith(
    caches.match(e.request).then(function(hit){ return hit || fetch(e.request); })
  );
});
