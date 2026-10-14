/* =====================================================================
   國度321空中團契 · 321 App 功能套件（依「321互動聖經功能套件」技能全面更新）
   ES5：不用箭頭函式、let/const、樣板字串。
   內含：逐句朗讀與背景播放、畫線默想、小智（美編／收合／接續／追問／回答對象）、
        經文美圖工作室（＋media.js 配樂錄影作品）、讀經樂、課程獎章、字級主題三語、自動更新。
   ===================================================================== */
var APPVER = '@@VER@@';
var SVC = {
  xz: (window.APP_CONFIG && window.APP_CONFIG.aiEndpoint) || 'https://xiaozhi-proxy.spch321.workers.dev',
  tts: (window.APP_CONFIG && window.APP_CONFIG.ttsEndpoint) || 'https://azure-tts.spch321.workers.dev',
  model: (window.APP_CONFIG && window.APP_CONFIG.aiModel) || 'claude-sonnet-4-6'
};
var PEXELS_KEY = 'ofCQ7i2mqaEddrACvvmzdgfrpZ90Z8gVOI9D6vYVf7uxWXCCtzQbj9yR';
var BUSY = false;

/* ---------- 小工具 ---------- */
function L() { var l = curLang(); return l === 'en' ? 'en' : (l === 'zh-Hans' ? 'zs' : 'zh'); }
function isEN() { return L() === 'en'; }
function isZS() { return L() === 'zs'; }
function now() { return Date.now(); }
function trim(s) { return String(s == null ? '' : s).replace(/^\s+|\s+$/g, ''); }
function qs1(sel, root) { return (root || document).querySelector(sel); }
function qa(sel, root) { var n = (root || document).querySelectorAll(sel), a = []; for (var i = 0; i < n.length; i++) a.push(n[i]); return a; }
function eachA(a, f) { for (var i = 0; i < a.length; i++) f(a[i], i); }
function Q(s) { return isEN() ? '“' + s + '”' : '「' + s + '」'; }
function toast(m, ms) { note(m, ms); }
function fmtDate(ts) { var d = new Date(ts); return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); }
function ajax(method, url, body, type, cb, headers, timeout) {
  var x = new XMLHttpRequest();
  try { x.open(method, url, true); } catch (e) { cb(0, null); return; }
  if (type) x.responseType = type;
  x.timeout = timeout || (type === 'arraybuffer' || type === 'blob' ? 25000 : 60000);
  if (body) x.setRequestHeader('Content-Type', 'application/json');
  if (headers) for (var h in headers) x.setRequestHeader(h, headers[h]);
  x.onload = function () { cb(x.status, type ? x.response : x.responseText); };
  x.onerror = function () { cb(0, null); };
  x.ontimeout = function () { cb(-1, null); };
  try { x.send(body ? JSON.stringify(body) : null); } catch (e) { cb(0, null); }
}
function shareText(t) {
  if (navigator.share) { var p = navigator.share({ text: t }); if (p && p['catch']) p['catch'](function () { }); return; }
  copyText(t); toast(f9('已複製，可以貼給朋友', 'Copied — paste it to a friend'));
}

/* ---------- 介面字串（繁／英；简體由繁體自動轉） ---------- */
var XI = @@XI18N@@;
function T(k) {
  var d = isEN() ? XI.en : XI.zh, s = d[k];
  if (s == null) s = XI.zh[k];
  if (s == null) s = k;
  if (isZS()) s = toSimp(s);
  for (var i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(arguments[i]);
  return s;
}

/* ---------- 本機狀態（只存在這台裝置） ---------- */
var XS_KEY = 'k321_x';
function xsDefault() {
  return { card: { tpl: 'navy', size: 't', border: 'classic', fs: 1, to: '', top: '', sign: '' },
    aud: 'adult', rate: 1, voice: {}, bm: {}, play: { right: 0, total: 0, best: {} }, quizWrong: [], rewards: {}, bmMode: false };
}
var S = (function () {
  var d = xsDefault(), s = null;
  try { s = JSON.parse(lsGet(XS_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || typeof s !== 'object') s = d;
  for (var k in d) if (!(k in s) || typeof s[k] !== typeof d[k]) s[k] = d[k];
  for (var c in d.card) if (!(c in s.card)) s.card[c] = d.card[c];
  if (Object.prototype.toString.call(s.quizWrong) !== '[object Array]') s.quizWrong = [];
  if (!s.play || typeof s.play.best !== 'object') s.play = d.play;
  if (['adult', 'teen', 'kid', 'seeker'].indexOf(s.aud) < 0) s.aud = 'adult';
  return s;
})();
function save() { try { lsSet(XS_KEY, JSON.stringify(S)); } catch (e) { } }

/* ---------- 底部面板（共用） ---------- */
function closeHSheet() { var m = document.getElementById('hsheet'); if (m) m.parentNode.removeChild(m); }
function openHSheet(html) {
  closeHSheet();
  var m = document.createElement('div'); m.id = 'hsheet'; m.className = 'sheet-mask';
  m.innerHTML = '<div class="sheet-card">' + html + '</div>';
  document.body.appendChild(m);
  m.onclick = function (e) { if (e.target === m) closeHSheet(); };
  simpifyEl(m);
  return m;
}
function svgI(n) {
  var P = { chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    sound: '<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
    pause: '<path d="M8 5v14M16 5v14"/>' };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="xsvg">' + (P[n] || '') + '</svg>';
}
function uid() { return now().toString(36) + Math.random().toString(36).slice(2, 7); }

/* ---------- 回答對象（成人／青少年／兒童／慕道友） ---------- */
var AUD = @@AUD@@;
var AUD_KEYS = ['adult', 'teen', 'kid', 'seeker'];
function audL() { return AUD[L()] || AUD.zh; }
function AUD_SYS() { return audL().sys[S.aud] || ''; }
function AUD_WRITE() {
  if (S.aud === 'seeker') return audL().write;
  if (S.aud === 'kid') return isEN() ? '\nThe reader is a young child: very simple words and short sentences. No emoji.' : f9('\n讀者是小朋友：用很簡單的字、很短的句子。不要用表情符號。', '');
  if (S.aud === 'teen') return isEN() ? '\nThe reader is a teenager: warm, real and a little playful, never preachy. No emoji.' : f9('\n讀者是青少年：親切真誠、可以有一點幽默，不說教。不要用表情符號。', '');
  return isEN() ? '\nNo emoji.' : f9('\n不要用表情符號。', '');
}
function PL_STYLE() { return S.aud === 'seeker' ? audL().skstyle : (audL().style[S.aud] || ''); }
function audBar(where) {
  var h = '<div class="audbar" data-where="' + where + '">';
  eachA(AUD_KEYS, function (k) {
    h += '<button class="audb' + (S.aud === k ? ' on' : '') + '" data-xact="aud" data-a="' + k + '">' + AUD.icon[k] + ' ' + esc(audL().name[k]) + '</button>';
  });
  return h + '</div><div class="audhint">' + esc(audL().hint[S.aud]) + '</div>';
}
function setAud(a) {
  if (AUD_KEYS.indexOf(a) < 0) return;
  S.aud = a; save();
  eachA(qa('.audbar'), function (bar) {
    eachA(qa('.audb', bar), function (b) { b.className = 'audb' + (b.getAttribute('data-a') === a ? ' on' : ''); });
    var h = bar.nextSibling; if (h && h.className === 'audhint') h.textContent = isZS() ? toSimp(audL().hint[a]) : audL().hint[a];
  });
  toast(T('audSet', AUD.icon[a] + ' ' + audL().name[a]));
  if (aic.open && !aic.busy) renderAIC();
}
