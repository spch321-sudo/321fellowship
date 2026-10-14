/* =====================================================================
   朗讀：逐句跟讀、背景播放（鎖屏不停）、Media Session、Wake Lock、浮動控制列
   iOS 規則：整個 App 只用一個 <audio>；第一次在點擊當下同步解鎖；onended 直接接下一段（預抓 2 段）。
   ===================================================================== */
var TTS_RETRY = [800, 1600], TTS_LOOK = 2, RA_COOL = 4000;
var SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=';
var VOICES = {
  zh: [['zh-TW-YunJheNeural', '雲哲'], ['zh-CN-Yunfan:DragonHDLatestNeural', '雲帆 HD'], ['zh-CN-Xiaochen:DragonHDLatestNeural', '曉辰 HD']],
  zs: [['zh-CN-Yunfan:DragonHDLatestNeural', '云帆 HD'], ['zh-CN-Xiaochen:DragonHDLatestNeural', '晓辰 HD'], ['zh-TW-YunJheNeural', '云哲']],
  en: [['en-US-AndrewNeural', 'Andrew'], ['en-US-EmmaNeural', 'Emma'], ['en-US-BrianNeural', 'Brian']]
};
var RATES = ['-12%', '+0%', '+10%', '+20%'];
(function () { /* 沿用舊版設定的聲音 */
  if (S.voice && S.voice.zh != null) return;
  var old = lsGet('k321_tts_voice'); S.voice = S.voice || {};
  S.voice.zh = old === 'yunfan' ? 1 : (old === 'xiaochen' ? 2 : 0);
  if (typeof S.rate !== 'number' || S.rate < 0 || S.rate > 3) S.rate = 1;
  save();
})();
function voiceIdx() { var i = +(S.voice[L()] || 0); return (i >= 0 && i < 3) ? i : 0; }
function voiceName() { return VOICES[L()][voiceIdx()][0]; }
function rateAttr() { return RATES[S.rate] || '+0%'; }

var spk = { on: false, items: [], idx: 0, cache: {}, native: false, abort: false, title: '' };
var raManualAt = 0, ttsEl = null, ttsUnlocked = false, ttsLastErr = '', sayKey = null, wakeLock = null, sayDone = null;

/* ---------- 多音字：依上下文換成同音字（只影響聲音，不改畫面） ---------- */
var TTS_FIX = [
  [/同行(?!業|业)/g, '同形'],
  [/重生/g, '蟲生'], [/重擔/g, '眾擔'], [/重担/g, '众担'], [/重建/g, '蟲建'], [/重新/g, '蟲新'], [/重來/g, '蟲來'], [/重来/g, '虫来'], [/重複/g, '蟲複'], [/重复/g, '虫复'], [/重整/g, '蟲整'], [/重演/g, '蟲演'],
  [/差遣/g, '拆遣'], [/差派/g, '拆派'], [/差役/g, '拆役'], [/被差/g, '被拆'], [/差來/g, '拆來'], [/差来/g, '拆来'], [/(主|神|祂|祢|他|她|要|所)差(人|我|你|他|她|祂|門徒|门徒)/g, '$1拆$2'],
  [/背起/g, '揹起'], [/背負/g, '揹負'], [/背负/g, '揹负'], [/背著/g, '揹著'], [/背着/g, '揹着'], [/背十字架/g, '揹十字架'],
  [/得著/g, '得着'], [/執著/g, '執灼'], [/执着/g, '执灼'], [/數算/g, '鼠算'], [/数算/g, '鼠算'], [/朝拜/g, '潮拜'], [/朝見/g, '潮見'], [/朝见/g, '潮见'],
  [/長老/g, '掌老'], [/長子/g, '掌子'], [/家長/g, '家掌'], [/長大/g, '掌大'], [/長執/g, '掌執'], [/長進/g, '掌進'], [/成長/g, '成掌'], [/生長/g, '生掌'], [/年長/g, '年掌'], [/長輩/g, '掌輩'], [/師長/g, '師掌'], [/兄長/g, '兄掌'], [/增長/g, '增掌'], [/長成/g, '掌成'],
  [/长老/g, '掌老'], [/长子/g, '掌子'], [/家长/g, '家掌'], [/长大/g, '掌大'], [/长执/g, '掌执'], [/长进/g, '掌进'], [/成长/g, '成掌'], [/生长/g, '生掌'], [/年长/g, '年掌'], [/长辈/g, '掌辈'], [/师长/g, '师掌'], [/兄长/g, '兄掌'], [/增长/g, '增掌'], [/长成/g, '掌成'],
  [/([組组團团校部首夫牧區区社副])長/g, '$1掌'], [/([組组團团校部首夫牧區区社副])长/g, '$1掌'], [/會長(大|出|成)/g, '會掌$1'], [/会长(大|出|成)/g, '会掌$1'], [/長出/g, '掌出'], [/长出/g, '掌出'], [/長者/g, '掌者'], [/长者/g, '掌者'],
  [/行為/g, '行圍'], [/為大/g, '圍大'], [/行为/g, '行围'], [/为大/g, '围大'], [/中了/g, '衷了'], [/中間/g, '衷間'], [/中间/g, '衷间'],
  [/教會/g, '叫會'], [/教会/g, '叫会'], [/傳道/g, '船道'], [/传道/g, '船道'], [/傳記/g, '賺記'], [/传记/g, '赚记'], [/行傳/g, '行賺'], [/行传/g, '行赚'],
  [/應當/g, '英當'], [/應許/g, '英許'], [/应当/g, '英当'], [/应许/g, '英许'], [/相應/g, '相映'], [/相应/g, '相映'],
  [/數到/g, '鼠到'], [/数到/g, '鼠到'], [/數一數/g, '鼠一鼠'], [/数一数/g, '鼠一鼠'],
  [/看守/g, '刊守'], [/種子/g, '腫子'], [/种子/g, '肿子'], [/撒種/g, '撒眾'], [/撒种/g, '撒众'], [/栽種/g, '栽眾'], [/栽种/g, '栽众'], [/種下/g, '眾下'], [/种下/g, '众下'],
  [/年少/g, '年紹'], [/少年/g, '紹年'], [/好施/g, '耗施'],
  [/降臨/g, '匠臨'], [/降临/g, '匠临'], [/降卑/g, '匠卑'], [/降服/g, '祥服'], [/降伏/g, '祥伏'],
  [/角色/g, '決色'], [/省察/g, '醒察'], [/反省/g, '反醒'], [/自省/g, '自醒'], [/省思/g, '醒思'],
  [/還有/g, '孩有'], [/还有/g, '孩有'], [/還是/g, '孩是'], [/还是/g, '孩是'], [/還要/g, '孩要'], [/还要/g, '孩要'], [/還沒/g, '孩沒'], [/还没/g, '孩没'], [/還在/g, '孩在'], [/还在/g, '孩在']
];
var EMOJI_RE = /\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF]|[←-⇿⌀-⏿■-➿⬀-⯿☀-⛿︎️‍⃣〰〽™ℹ✦✴✵]/g;
var REF_ONE = /^\s*(?:(?:參|参|見|见|另見|另见|參看|参看|參考|参考|cf\.?|see|See)\s*)?(?:(?:[1-3一二三]\s?)?[一-鿿]{1,6}|(?:[1-3]\s?)?[A-Z][a-z]+\.?(?:\s(?:of\s)?[A-Z][a-z]+)*)?\s*\d+(?:\s*[:：]\s*\d+(?:\s*[-–—~～至]\s*\d+)?)?(?:\s*[章節节篇])?(?:\s*[-–—~～至]\s*\d+(?:\s*[:：]\s*\d+)?)?\s*$/;
function isRefParen(inner) {
  var ps = String(inner).split(/[；;、，,]/), ok = 0;
  for (var i = 0; i < ps.length; i++) {
    var p = trim(ps[i]); if (!p) continue;
    if (!REF_ONE.test(p) && !refSpoken(p.replace(/^(參|参|見|见|另見|另见)\s*/, ''))) return false;
    ok++;
  }
  return ok > 0;
}
function dropRefParens(x) {
  return x.replace(/([，,]?\s*(?:參|参|見|见|see|cf\.?)\s*)?[（(]([^（）()]{1,80})[）)]/g, function (m, lead, inner) { return isRefParen(inner) ? '' : m; });
}
var BKM = {};
function bookMap() {
  var k = isZS() ? 'zs' : 'zh'; if (BKM[k]) return BKM[k];
  var m = {}, b;
  for (b in BIBLE_BOOKS) if (Object.prototype.hasOwnProperty.call(BIBLE_BOOKS, b)) {
    var full = BIBLE_BOOKS[b];
    if (k === 'zs') { m[toSimp(b)] = toSimp(full); m[toSimp(full)] = toSimp(full); }
    m[b] = full; m[full] = full;
  }
  m['詩'] = '詩篇'; m['诗'] = '诗篇';
  return (BKM[k] = m);
}
/* 出處唸全名：「創 1:26」→「創世記1章26節」；前面黏著別的字就取最長的書名後綴；找不到書名就原樣 */
function ttsRef(x) {
  return String(x || '').replace(/([^\s\d:：，。、；（）「」！？]{1,12}|[1-3]?\s?[A-Z][a-z]+\.?(?: of [A-Z][a-z]+)?)\s?(\d+)[:：](\d+)(?:\s*[–\-~～至]\s*(\d+))?/g, function (m, bk, c, v, v2) {
    if (isEN()) return bk.replace(/\.$/, '') + ' chapter ' + c + (v2 ? ' verses ' + v + ' to ' + v2 : ' verse ' + v);
    var mp = bookMap(), pre = null, full = '';
    for (var k = 0; k < bk.length; k++) { var suf = bk.slice(k); if (mp[suf]) { pre = bk.slice(0, k); full = mp[suf]; break; } }
    if (pre === null) return m;
    var ps = /^詩篇$|^诗篇$/.test(full);
    return pre + full + c + (ps ? '篇' : '章') + v + (v2 ? '到' + v2 : '') + (isZS() ? '节' : '節');
  });
}
function ttsPrep(s) {
  var x = dropRefParens(String(s || '')).replace(/〔[^〕]*〕/g, '').replace(/\[[^\]]*\]/g, '').replace(EMOJI_RE, '');
  x = ttsRef(x);
  if (isEN()) return trim(x.replace(/[*#>`_~|]/g, '').replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1'));
  x = sayNorm(x);
  x = x.replace(/[「」『』（）()〔〕\[\]《》〈〉*#>`_~|]/g, '').replace(/[—－]{1,2}/g, '，');
  if (isZS()) x = toSimp(x);
  eachA(TTS_FIX, function (f) { x = x.replace(f[0], f[1]); });
  return trim(x.replace(/[ \t]{2,}/g, ' ').replace(/，{2,}/g, '，').replace(/([。！？；：])，/g, '$1').replace(/^，/, ''));
}

/* ---------- 單一 audio、解鎖、取音檔 ---------- */
function ttsAudio() {
  if (!ttsEl) {
    ttsEl = new Audio(); ttsEl.preload = 'auto';
    try { ttsEl.setAttribute('playsinline', ''); ttsEl.setAttribute('webkit-playsinline', ''); } catch (e) { }
  }
  return ttsEl;
}
function ttsUnlock() {
  if (ttsUnlocked) return;
  try { var a = ttsAudio(); a.src = SILENT_WAV; var p = a.play(); if (p && p.then) p.then(function () { ttsUnlocked = true; }, function () { }); else ttsUnlocked = true; } catch (e) { }
}
var TTS_MEM = {};
function ttsFetch(text, cb, tries) {
  tries = tries || 0;
  var key = voiceName() + '|' + rateAttr() + '|' + text;
  if (TTS_MEM[key]) { cb(TTS_MEM[key]); return; }
  if (navigator.onLine === false) { ttsLastErr = 'offline'; cb(null); return; }
  rvCacheGet(key, function (blob) {
    if (blob && blob.size > 128) { var u0 = URL.createObjectURL(blob); TTS_MEM[key] = u0; cb(u0); return; }
    ajax('POST', SVC.tts, { voice: voiceName(), rate: rateAttr(), sil: 140, silc: 140, sile: 260, text: text }, 'arraybuffer', function (st, buf) {
      if (st === 200 && buf && buf.byteLength > 128) {
        var b = new Blob([buf], { type: 'audio/mpeg' }); try { rvCachePut(key, b); } catch (e) { }
        var u = URL.createObjectURL(b); TTS_MEM[key] = u; cb(u); return;
      }
      ttsLastErr = st > 0 ? 'http ' + st : (st < 0 ? 'timeout' : 'network');
      if (tries < TTS_RETRY.length) setTimeout(function () { ttsFetch(text, cb, tries + 1); }, TTS_RETRY[tries]); else cb(null);
    });
  });
}
function keepAwake(on) {
  try {
    if (on && navigator.wakeLock && !wakeLock) navigator.wakeLock.request('screen').then(function (w) { wakeLock = w; w.addEventListener && w.addEventListener('release', function () { wakeLock = null; }); }, function () { });
    else if (!on && wakeLock) { wakeLock.release(); wakeLock = null; }
  } catch (e) { }
}
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && (spk.on || sayKey)) keepAwake(true); });
function mediaSession(title) {
  try {
    if ('mediaSession' in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: title || T('fellowshipName'), artist: T('fellowshipName'), artwork: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }] });
      navigator.mediaSession.setActionHandler('pause', function () { stopAll(); });
      navigator.mediaSession.setActionHandler('stop', function () { stopAll(); });
      try { navigator.mediaSession.setActionHandler('nexttrack', function () { spkSkip(1); }); navigator.mediaSession.setActionHandler('previoustrack', function () { spkSkip(-1); }); } catch (e) { }
      navigator.mediaSession.playbackState = 'playing';
    }
  } catch (e) { }
}

/* ---------- 頁面的「句子」：課文用 .mk-s，其他頁面在朗讀時才把文字切成 .rd-s ---------- */
var SENT_SEL = '.mk-s,.rd-s';
var HEAD_SEL = '.page-title,.page-sub,.section-label h2,h3.lh,.card h3';
var SKIP_SEL = 'button,a,input,textarea,select,svg,script,style,.vact,.lnav,.chips,.tabbar,.audbar,.mk-hint,.mk-acts,.lrec,.hl-note,.vid-open,.rd-skip,.section-label .n,.eyebrow,.xpill,.qrimg,.kp-n';
function splitS(text) {
  text = String(text || ''); var out = [], cur = '', i;
  if (isEN()) {
    var re = /[^.!?]*[.!?]+["'”’\)\]]*(\s+|$)/g, m, last = 0;
    while ((m = re.exec(text)) !== null) { if (trim(m[0])) out.push(m[0]); last = re.lastIndex; if (re.lastIndex === m.index) re.lastIndex++; }
    if (last < text.length && trim(text.slice(last))) out.push(text.slice(last)); return out.length ? out : [text];
  }
  for (i = 0; i < text.length; i++) {
    cur += text.charAt(i);
    if ('。！？'.indexOf(text.charAt(i)) >= 0) { while (i + 1 < text.length && '」』）〕”’'.indexOf(text.charAt(i + 1)) >= 0) cur += text.charAt(++i); out.push(cur); cur = ''; }
  }
  if (cur) out.push(cur); return out;
}
function inSkip(n, root) { while (n && n !== root) { if (n.nodeType === 1) { try { if (n.matches ? n.matches(SKIP_SEL) : n.msMatchesSelector(SKIP_SEL)) return true; } catch (e) { } if (n.className && /(^|\s)(mk-s|rd-s)(\s|$)/.test(String(n.className))) return true; } n = n.parentNode; } return false; }
function wrapSents(root) {
  if (!root || !document.createTreeWalker || root.querySelector('.mk-s')) return;
  var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false), n, arr = [];
  while ((n = w.nextNode())) arr.push(n);
  var heads = qa(HEAD_SEL, root);
  eachA(arr, function (tn) {
    if (!trim(tn.nodeValue) || inSkip(tn.parentNode, root)) return;
    for (var h = 0; h < heads.length; h++) if (heads[h].contains(tn)) return;
    var parts = splitS(tn.nodeValue), frag = document.createDocumentFragment();
    eachA(parts, function (p) { if (!trim(p)) { frag.appendChild(document.createTextNode(p)); return; } var s = document.createElement('span'); s.className = 'rd-s'; s.textContent = p; frag.appendChild(s); });
    tn.parentNode.replaceChild(frag, tn);
  });
}
function readRoot() { return document.getElementById('view'); }
function segKey(e) { return e.getAttribute('data-mk') || ''; }
function headLead(h) {
  var t = trim((h.textContent || '').replace(EMOJI_RE, '')); if (!t) return '';
  if (/page-title|page-sub/.test(h.className)) return isEN() ? t + '. ' : t + '。';
  if (/想更多|延伸|多想|再想|深思|Think (more|further)|Going deeper/i.test(t)) return isEN() ? 'If you want to think further, consider this. ' : f9('如果想更多一點，可以這樣想。', '');
  if (/禱告|祷告|Pray/i.test(t)) return isEN() ? 'Let us pray together. ' : f9('讓我們一起禱告。', '');
  if (/宣告|Declaration/i.test(t)) return isEN() ? 'Let us declare it together. ' : f9('讓我們一起開口宣告。', '');
  if (/結語|Closing/i.test(t)) return isEN() ? 'Finally, the closing. ' : f9('最後是結語。', '');
  if (/^\d+[.、]/.test(t) || (h.tagName === 'H3' && /lh/.test(h.className))) return isEN() ? t + '. ' : t + '。';
  return isEN() ? 'Next: ' + t + '. ' : f9('接下來是「' + t + '」。', '');
}
/* 依文件順序：標題 → 帶入語；句子 → 併成 ≤130 字（英文 ≤320）的段，一句不切兩段 */
function buildQueue(root, fromEl, sectOnly) {
  var all = qa(HEAD_SEL + ',' + SENT_SEL, root), items = [], cur = { text: '', segs: [], lens: [], keys: [], at: -1 }, MAX = isEN() ? 320 : 130;
  var started = !fromEl, lead = '', firstSect = null;
  for (var i = 0; i < all.length; i++) {
    var e = all[i], isHead = !/(^|\s)(mk-s|rd-s)(\s|$)/.test(e.className);
    if (!started) { if (e === fromEl) started = true; else { if (isHead) lead = ''; continue; } }
    if (isHead) {
      if (sectOnly && /section-label/.test((e.parentNode || {}).className || '') && firstSect && firstSect !== e) break;
      if (sectOnly && !firstSect && /section-label/.test((e.parentNode || {}).className || '')) firstSect = e;
      lead = headLead(e); continue;
    }
    if (e.offsetParent === null && !e.getClientRects().length) continue;
    var t = e.textContent || '';
    if ((lead || cur.text.length + t.length > MAX) && cur.text) { items.push(cur); cur = { text: '', segs: [], lens: [], keys: [], at: -1 }; }
    cur.text += lead + t + (isEN() ? ' ' : ''); cur.segs.push(e); cur.keys.push(segKey(e)); cur.lens.push(Math.max(1, ttsPrep(lead + t).length)); lead = '';
  }
  if (cur.text) items.push(cur);
  var out = []; eachA(items, function (it) { if (ttsPrep(it.text)) out.push(it); }); return out;
}
function raClear() { eachA(qa('.tts-reading'), function (e) { e.className = e.className.replace(/\s*tts-reading/g, ''); }); }
function raSeg(item, k) {
  if (!item || !item.segs.length) return; k = Math.max(0, Math.min(k, item.segs.length - 1));
  if (item.at === k && document.querySelector('.tts-reading')) return; item.at = k; raClear();
  var e = item.segs[k]; if (!e || !e.parentNode) return;
  e.className += ' tts-reading';
  if (now() - raManualAt > RA_COOL) { try { e.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (x) { } }
}
function raProgress(item, ratio) {
  if (!item || item.lens.length < 2 || !(ratio >= 0)) return; var tot = 0, acc = 0, k = 0, j;
  for (j = 0; j < item.lens.length; j++) tot += item.lens[j];
  var tg = Math.min(ratio, 1) * tot; for (j = 0; j < item.lens.length; j++) { acc += item.lens[j]; k = j; if (tg < acc) break; } raSeg(item, k);
}
/* 重畫後把朗讀標示接回新的 DOM（畫線、改領受、標記讀完都不會打斷朗讀） */
function ttsRebind() {
  if (!spk.on) return; var root = readRoot(); if (!root) return;
  eachA(spk.items, function (it) {
    for (var j = 0; j < it.segs.length; j++) {
      if (it.segs[j] && it.segs[j].parentNode && root.contains(it.segs[j])) continue;
      var k = it.keys[j]; var n = k ? root.querySelector('[data-mk="' + k + '"]') : null; if (n) it.segs[j] = n;
    }
  });
  var cur = spk.items[spk.idx]; if (cur) { var at = cur.at; cur.at = -1; raManualAt = now(); raSeg(cur, at < 0 ? 0 : at); }
}
function ttsBtnState(st) { BUSY = !!(spk.on || sayKey) || BUSY_OTHER(); markLessonSpeak(spk.on && spk.kind === 'lesson'); drawSpk(); }
function ttsPage(fromEl, title, sectOnly, kind) {
  if (spk.on) { stopAll(); return; }
  stopAll(); ttsUnlock();
  var root = readRoot(); if (!root) return;
  wrapSents(root);
  if (!fromEl) {
    var ss = qa(SENT_SEL, root);
    for (var i = 0; i < ss.length; i++) if (ss[i].getBoundingClientRect().bottom > 60) { fromEl = ss[i]; break; }
    /* 從頂端開始時，連同頁面標題一起唸 */
    if (fromEl && fromEl === ss[0]) fromEl = null;
  }
  var items = buildQueue(root, fromEl, sectOnly);
  if (!items.length) { toast(T('nothingToRead')); return; }
  spk = { on: true, items: items, idx: 0, cache: {}, native: false, abort: false, title: title || document.title.split('｜')[0], kind: kind || '' };
  keepAwake(true); mediaSession(spk.title); ttsBtnState('loading'); ttsPlayFrom(0);
}
function ttsPrefetch(i, cb) {
  var it = spk.items[i]; if (!it || spk.cache[i] !== undefined) { if (cb) cb(); return; }
  spk.cache[i] = 0; var my = spk;
  ttsFetch(ttsPrep(it.text), function (u) { if (my !== spk) return; spk.cache[i] = u; if (cb) cb(); });
}
function ttsPlayFrom(i) {
  if (!spk.on || spk.abort) return; if (i >= spk.items.length) { stopAll(); return; }
  spk.idx = i; spk.items[i].at = -1; raSeg(spk.items[i], 0); drawSpk();
  var my = spk;
  var go2 = function () {
    if (my !== spk || !spk.on || spk.abort) return;
    for (var k = i + 1; k <= i + TTS_LOOK; k++) ttsPrefetch(k);
    var url = spk.cache[i];
    if (!url) { ttsNativeFrom(i); return; }
    var a = ttsAudio(); a.onended = null; a.onerror = null; a.ontimeupdate = null; a.src = url;
    a.ontimeupdate = function () { if (!spk.on || spk.idx !== i) return; var d = a.duration; if (d && isFinite(d)) raProgress(spk.items[i], a.currentTime / d); };
    a.onended = function () { a.ontimeupdate = null; if (spk.on && !spk.abort && my === spk) ttsPlayFrom(i + 1); };
    a.onerror = function () { if (spk.on && !spk.abort && my === spk) ttsNativeFrom(i); };
    var p = a.play(); if (p && p['catch']) p['catch'](function () { if (spk.on && !spk.abort && my === spk) ttsNativeFrom(i); });
    ttsBtnState('playing');
  };
  if (spk.cache[i] === undefined) ttsPrefetch(i, go2);
  else if (spk.cache[i] === 0) { var w = setInterval(function () { if (my !== spk || spk.cache[i] !== 0 || !spk.on) { clearInterval(w); go2(); } }, 120); }
  else go2();
}
function nativeLang() { return isEN() ? 'en-US' : (isZS() ? 'zh-CN' : 'zh-TW'); }
function ttsNativeFrom(i) {
  if (!('speechSynthesis' in window)) { toast(T('ttsErr')); stopAll(); return; }
  if (!spk.native) { spk.native = true; toast(T('ttsFallback') + (ttsLastErr ? '（' + ttsLastErr + '）' : '')); }
  if (!spk.on || spk.abort || i >= spk.items.length) { stopAll(); return; }
  spk.idx = i; spk.items[i].at = -1; raSeg(spk.items[i], 0); drawSpk();
  var say = ttsPrep(spk.items[i].text), u = new SpeechSynthesisUtterance(say), my = spk;
  u.lang = nativeLang(); u.rate = [0.85, 0.95, 1.05, 1.15][S.rate] || 0.95;
  u.onboundary = function (e) { if (spk.on && spk.idx === i && say.length) raProgress(spk.items[i], (e.charIndex || 0) / say.length); };
  u.onend = function () { if (spk.on && !spk.abort && my === spk) ttsNativeFrom(i + 1); }; u.onerror = u.onend;
  try { speechSynthesis.speak(u); } catch (e) { stopAll(); }
}
/* 單段朗讀（小智回答、畫線、今日金句、試聽） */
function speakText(text, key, title, onEnd) {
  stopAll(); ttsUnlock(); sayKey = key || 'x'; sayDone = onEnd || null; paintSay(); keepAwake(true); mediaSession(title || ''); drawSpk();
  var clean = ttsPrep(text).slice(0, 1500); if (!clean) { stopAll(); return; }
  var myKey = sayKey;
  var done = function () { if (sayKey === myKey) { sayKey = null; paintSay(); keepAwake(false); drawSpk(); BUSY = BUSY_OTHER(); var f = sayDone; sayDone = null; if (f) f(); } };
  /* 太長的分成幾段接著唸（每段 ≤ 300 字），一樣在 onended 直接換下一段 */
  var parts = [], buf = '';
  eachA(splitS(clean), function (s) { if (buf && (buf + s).length > (isEN() ? 600 : 300)) { parts.push(buf); buf = ''; } buf += s; });
  if (buf) parts.push(buf);
  var urls = [];
  function fetchAt(k, cb) { if (urls[k] !== undefined) { cb(); return; } urls[k] = 0; ttsFetch(parts[k], function (u) { urls[k] = u; cb(); }); }
  function playAt(k) {
    if (sayKey !== myKey) return; if (k >= parts.length) { done(); return; }
    var run = function () {
      if (sayKey !== myKey) return; if (parts[k + 1]) fetchAt(k + 1, function () { });
      var u = urls[k]; if (!u) { nat(k); return; }
      var a = ttsAudio(); a.ontimeupdate = null; a.onended = function () { playAt(k + 1); }; a.onerror = function () { nat(k); }; a.src = u;
      var p = a.play(); if (p && p['catch']) p['catch'](function () { nat(k); });
    };
    if (urls[k] === 0) { var w = setInterval(function () { if (urls[k] !== 0) { clearInterval(w); run(); } }, 120); } else fetchAt(k, run);
  }
  function nat(k) {
    if (!('speechSynthesis' in window)) { toast(T('ttsErr')); done(); return; }
    var u = new SpeechSynthesisUtterance(parts.slice(k).join('')); u.lang = nativeLang(); u.rate = [0.85, 0.95, 1.05, 1.15][S.rate] || 0.95;
    u.onend = done; u.onerror = done; try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { done(); }
  }
  playAt(0);
}
function paintSay() {
  eachA(qa('[data-xact="msgtts"]'), function (b) { var on = sayKey === 'm' + b.getAttribute('data-i'); b.className = 'msg-act' + (on ? ' on' : ''); b.innerHTML = on ? '⏸ ' + esc(T('stop')) : '🔊 ' + esc(T('readThis')); });
  eachA(qa('[data-xact="favtts"]'), function (b) { var on = sayKey === 'f' + b.getAttribute('data-i'); b.className = 'msg-act' + (on ? ' on' : ''); b.innerHTML = on ? '⏸' : '🔊'; });
  var sv = document.querySelector('[data-speak]'); if (sv) sv.innerHTML = sayKey === 'verse' ? (icon('stop', 18) + ' ' + esc(t('stopSpeak'))) : (icon('sound', 18) + ' ' + esc(f9('朗讀', 'Read')));
}
function stopAll() {
  spk.on = false; spk.abort = true; sayKey = null; sayDone = null;
  try { if (ttsEl) { ttsEl.onended = null; ttsEl.onerror = null; ttsEl.ontimeupdate = null; ttsEl.pause(); } } catch (e) { }
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { }
  try { if (navigator.mediaSession) navigator.mediaSession.playbackState = 'none'; } catch (e) { }
  raClear(); keepAwake(false); paintSay(); BUSY = BUSY_OTHER();
  try { markLessonSpeak(false); } catch (e) { }
  drawSpk(); try { updIdle(); } catch (e) { }
}
function drawSpk() {
  var el = document.getElementById('spk'), on = spk.on || !!sayKey;
  if (!on) { if (el) el.parentNode.removeChild(el); return; }
  if (!el) { el = document.createElement('div'); el.id = 'spk'; el.className = 'spk'; document.body.appendChild(el); }
  var prog = spk.on && spk.items.length ? ' · ' + (spk.idx + 1) + '/' + spk.items.length : '';
  el.innerHTML = '<span class="t">🔊 ' + esc(spk.on ? (spk.title || T('reading')) : T('reading')) + prog + '</span>' +
    (spk.on ? '<button data-xact="spkprev" aria-label="prev">⏮</button><button data-xact="spknext" aria-label="next">⏭</button>' : '') +
    '<button data-xact="spkstop" aria-label="stop">■</button>';
}
function spkSkip(n) {
  if (!spk.on) return; var k = Math.max(0, Math.min(spk.items.length - 1, spk.idx + n));
  try { if (ttsEl) { ttsEl.onended = null; ttsEl.pause(); } if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { }
  raManualAt = 0; ttsPlayFrom(k);
}
window.addEventListener('touchmove', function () { raManualAt = now(); }, { passive: true });
window.addEventListener('wheel', function () { raManualAt = now(); }, { passive: true });
/* 開機暖身：喚醒語音 Worker */
setTimeout(function () { if (navigator.onLine !== false) ajax('POST', SVC.tts, { voice: voiceName(), rate: '+0%', sil: 0, silc: 0, sile: 0, text: '。' }, 'arraybuffer', function () { }); }, 1200);

/* ---------- 取代舊的朗讀入口 ---------- */
stopSpeak = function () { if (window.__keepSpeak) return; stopAll(); };
speakLesson = function () {
  if (spk.on) { stopAll(); return; }
  var L1 = lessonFromCache(LESSON_NO);
  ttsPage(null, L1 ? f9('第' + LESSON_NO + '課 ' + L1.title, 'Lesson ' + LESSON_NO + ' ' + lessonTitleOf(LESSON_NO, L1.title)) : '', false, 'lesson');
};
speakVerse = function () {
  if (sayKey === 'verse') { stopAll(); return; }
  var v = todayVerse(); if (!v) return;
  speakText(v.text + (isEN() ? ' ' : '。') + v.ref + (v.motto ? (isEN() ? ' ' : '。') + v.motto : ''), 'verse', f9('今日金句', 'Verse of the Day'));
};
rvSpeak = function (text, onDone) { speakText(text, 'rv', '', onDone); };
rvStop = function () { stopAll(); };
markLessonSpeak = function (on) {
  var b = document.querySelector('[data-lspeak]');
  if (b) b.innerHTML = on ? (icon('stop', 18) + ' ' + esc(t('stopSpeak'))) : (icon('sound', 18) + ' ' + esc(t('speakLesson')));
};
window.aicSpeakToggle = function (text, id) { if (sayKey === id) { stopAll(); return; } speakText(mdSpeak(text), id, T('xz')); };
aicSpeakStop = function () { if (sayKey) stopAll(); };
