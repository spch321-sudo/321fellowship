/* =====================================================================
   國度321空中團契 · Service Worker（自動更新版）
   ‧ 每次發佈 VER 都不同 → 瀏覽器偵測到 sw.js 改變就安裝新 SW
   ‧ install：skipWaiting；預載用 cache:'reload' 繞過 GitHub Pages 約 10 分鐘的 HTTP 快取
   ‧ activate：刪舊快取、clients.claim，通知所有頁面；背景中的舊頁面直接帶到新版
   ‧ fetch：網頁／JS／JSON 網路優先（no-cache），離線才用快取；圖片快取優先；
           音訊、影片與帶 Range 的請求一律不攔截（試聽、拖曳、錄影混音才不會壞）
   ‧ 同網域底下還有其他 321 App，本 SW 只管自己這個資料夾
   ===================================================================== */
var VER = '4.0.202610152222';
var V = 'k321-' + VER;
var SHELL = ['./', './index.html', './manifest.json', './media.js', './data.json', './icon-192.png?v=3', './icon-512.png?v=3', './apple-touch-icon.png?v=3'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(SHELL.map(function (u) {
      return fetch(new Request(u, { cache: 'reload' })).then(function (r) { if (r && r.ok) return c.put(u, r); })['catch'](function () { });
    }));
  }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V && k.indexOf('k321-') === 0; }).map(function (k) { return caches['delete'](k); }));
  }).then(function () { return self.clients.claim(); }).then(function () {
    return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  }).then(function (cs) {
    cs.forEach(function (c) {
      try { c.postMessage({ t: 'sw-updated', v: VER }); } catch (x) { }
      if (c.visibilityState === 'hidden' && c.navigate) { try { c.navigate(c.url); } catch (x) { } }
    });
  }));
});
self.addEventListener('message', function (e) { if (e.data === 'skip' || (e.data && e.data.type === 'SKIP_WAITING')) self.skipWaiting(); });

var OFFLINE = "<meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><div style=\"font-family:-apple-system,sans-serif;padding:40px;line-height:2;color:#16294A\"><h2>目前沒有網路</h2><p>連上網路後再打開就好。<br>神的話語不受網路限制——今天仍然可以禱告、可以親近祂。</p></div>";

self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u; try { u = new URL(r.url); } catch (x) { return; }
  if (u.origin !== self.location.origin) return;
  var base = new URL('./', self.location.href).pathname;
  if (u.pathname.indexOf(base) !== 0) return;
  var p = u.pathname;
  if (/\.(mp3|m4a|aac|wav|ogg|opus|mp4|mov|webm)$/i.test(p) || r.headers.get('range')) return;
  if (/version\.json$/.test(p)) {
    e.respondWith(fetch(p + '?t=' + Date.now(), { cache: 'no-store' })['catch'](function () { return new Response('{}', { headers: { 'Content-Type': 'application/json' } }); }));
    return;
  }
  var nav = r.mode === 'navigate' || /\.html$/.test(p) || /\/$/.test(p);
  /* 有網路時，頁面本身不經過 SW（避免更新交接時 SW 被終止、3.5MB 頁面被截斷而整頁空白）；離線才用快取 */
  if (nav && self.navigator && self.navigator.onLine !== false) return;
  var key = nav ? './index.html' : (/\.(json|js|css)$/.test(p) ? u.origin + p : r);
  if (nav || /\.(json|js|css)$/.test(p)) {
    e.respondWith(fetch(nav ? u.origin + p + u.search : r.url, { cache: 'no-cache', credentials: 'same-origin' }).then(function (resp) {
      if (resp && resp.ok) { var cp = resp.clone(); caches.open(V).then(function (c) { c.put(key, cp); }); }
      return resp;
    })['catch'](function () {
      return caches.match(key).then(function (h) {
        return h || caches.match(r, { ignoreSearch: true }).then(function (h2) {
          if (h2) return h2;
          if (nav) return caches.match('./index.html').then(function (h3) { return h3 || new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); });
          return Response.error();
        });
      });
    }));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(function (h) {
    return h || fetch(r).then(function (resp) { if (resp && resp.ok) { var cp = resp.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); } return resp; });
  }));
});
