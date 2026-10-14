/* =====================================================================
   畫線默想：點一句就畫（預設金色）；再點開面板：8 色、句數 －／＋、整段、默想、
   問小智、做成美圖、朗讀、複製、分享、刪除。畫線只改屬性（paintMarks），不重畫整課。
   資料沿用 k321_marks：{課號:{"區塊#句":值}}；舊版的值是「領受字串」，新版是 {c,n,sp,t,ts}。
   ===================================================================== */
var HL_COLORS = ['gold', 'green', 'blue', 'pink', 'purple', 'maroon', 'brown', 'charcoal'];
var HL_SWATCH = { gold: '#D9B168', green: '#6FAE71', blue: '#6C93D1', pink: '#E58FA0', purple: '#A48AC9', maroon: '#8C4A4E', brown: '#8A6740', charcoal: '#54534E' };
function mkVal(v) {
  if (v == null) return null;
  if (typeof v === 'string') return { c: 'gold', n: v, sp: 1 };
  if (!v.c) v.c = 'gold'; if (!(v.sp >= 1)) v.sp = 1; if (v.n == null) v.n = '';
  return v;
}
mkCount = function (no) { var m = mkGet(no), n = 0; for (var k in m) if (Object.prototype.hasOwnProperty.call(m, k)) n++; return n; };
mkNoteCount = function (no) { var m = mkGet(no), n = 0; for (var k in m) if (Object.prototype.hasOwnProperty.call(m, k) && trim(mkVal(m[k]).n)) n++; return n; };
function ensureLesson(no) {
  var u = unitOfLesson(no);
  if (u && UNIT_STATE[u] !== 2 && window.APP_UNITS && window.APP_UNITS[u]) { UNIT_CACHE[u] = window.APP_UNITS[u]; UNIT_STATE[u] = 2; }
  return lessonFromCache(no);
}
function mkSpanText(no, key, sp) {
  var L1 = ensureLesson(no); if (!L1) return '';
  var h = key.indexOf('#'), bk = key.slice(0, h), i0 = +key.slice(h + 1), out = '';
  var arr = mkSplit(mkRawOf(L1, bk));
  for (var i = i0; i < Math.min(arr.length, i0 + (sp || 1)); i++) out += arr[i];
  return trim(out);
}
function mkRefOf(no) { return f9('第' + no + '課', 'Lesson ' + no); }
/* 課文的句子只輸出成可點的 span，畫線與默想之後由 paintMarks() 套上 */
mkHTML = function (no, bkey, raw) {
  var sents = mkSplit(raw), out = '';
  for (var i = 0; i < sents.length; i++) out += '<span class="mk-s" data-mk="' + no + '|' + bkey + '#' + i + '">' + esc(sents[i]) + '</span>';
  return out;
};
function mkList(root) { return qa('.mk-s', root || readRoot()); }
function mkKeyOf(el) { var s = el.getAttribute('data-mk') || '', p = s.indexOf('|'); return p < 0 ? null : { no: +s.slice(0, p), key: s.slice(p + 1) }; }
function paintMarks(root) {
  root = root || readRoot(); if (!root) return;
  var list = mkList(root); if (!list.length) return;
  var no = mkKeyOf(list[0]).no, m = mkGet(no), cover = [];
  eachA(list, function (el, i) {
    var k = mkKeyOf(el).key, v = Object.prototype.hasOwnProperty.call(m, k) ? mkVal(m[k]) : null; if (!v) return;
    for (var d = 0; d < v.sp && i + d < list.length; d++) cover[i + d] = { v: v, head: d === 0, k: k };
  });
  eachA(list, function (el, i) {
    var o = cover[i], c = el.className.replace(/\s*(mk-hl|mk-bm)/g, '');
    if (o) { c += ' mk-hl'; el.setAttribute('data-color', o.v.c); if (o.head) el.removeAttribute('data-op'); else el.setAttribute('data-op', o.k); }
    else { el.removeAttribute('data-color'); el.removeAttribute('data-op'); }
    if (S.bm[no + '|' + mkKeyOf(el).key]) c += ' mk-bm';
    el.className = c;
  });
  eachA(qa('.hl-note', root), function (n) { n.parentNode.removeChild(n); });
  var lastBlk = null, after = null;
  eachA(list, function (el, i) {
    var o = cover[i]; if (!o || !o.head || !trim(o.v.n)) return;
    var b = el.parentNode; if (!b) return;
    if (b.tagName === 'B' && b.parentNode) b = b.parentNode.parentNode || b;
    if (b !== lastBlk) { lastBlk = b; after = b; }
    var d = document.createElement('div'); d.className = 'hl-note'; d.setAttribute('data-color', o.v.c); d.setAttribute('data-hk', no + '|' + o.k);
    d.textContent = o.v.n;
    if (after.nextSibling) after.parentNode.insertBefore(d, after.nextSibling); else after.parentNode.appendChild(d); after = d;
  });
  mkRefreshBar(no);
}
var hlCur = null;
function mkTextFromDom(list, i, n) { var t = ''; for (var j = i; j < Math.min(list.length, i + n); j++) t += list[j].textContent + (isEN() ? ' ' : ''); return trim(t.replace(/\s+/g, isEN() ? ' ' : '')); }
mkTap = function (sig, el) {
  var p = String(sig).split('|'), no = parseInt(p[0], 10), key = p[1];
  if (S.bmMode) {
    var bk = no + '|' + key; if (S.bm[bk]) delete S.bm[bk]; else S.bm[bk] = now(); save(); paintMarks();
    toast(S.bm[bk] ? T('bmAdded') : T('bmRemoved')); return;
  }
  if (el && el.getAttribute('data-op')) { key = el.getAttribute('data-op'); }
  var all = mkAll(), m = all[String(no)]; if (!m) { m = {}; all[String(no)] = m; }
  if (Object.prototype.hasOwnProperty.call(m, key)) { openHlSheet(no, key); return; }
  var list = mkList(), idx = -1; for (var i = 0; i < list.length; i++) if (list[i] === el) { idx = i; break; }
  m[key] = { c: S.lastColor || 'gold', n: '', sp: 1, t: idx >= 0 ? mkTextFromDom(list, idx, 1) : mkSpanText(no, key, 1), ts: now() };
  mkStore(all); paintMarks(); toast(T('hlAdded'));
  try { k3track('mark_add'); nsMark('word'); } catch (e) { }
};
function mkSet(no, key, v) { var all = mkAll(); if (!all[String(no)]) all[String(no)] = {}; all[String(no)][key] = v; mkStore(all); }
function openHlSheet(no, key) {
  var v = mkVal(mkGet(no)[key]); if (!v) return;
  if (!v.t) v.t = mkSpanText(no, key, v.sp);
  hlCur = { no: no, key: key, v: v };
  var sw = ''; eachA(HL_COLORS, function (c) { sw += '<button class="hlswatch' + (v.c === c ? ' on' : '') + '" data-xact="hlc" data-c="' + c + '" style="background:' + HL_SWATCH[c] + '" aria-label="' + c + '"></button>'; });
  openHSheet('<div class="sheet-title">' + esc(T('hlTitle')) + '<span class="sheet-ref">' + esc(mkRefOf(no)) + '</span></div>' +
    '<div class="sheet-quote" id="hlQuote">' + esc(v.t) + '</div>' +
    '<div class="sheet-row"><span class="sheet-lab">' + esc(T('hlColor')) + '</span><div class="swatches">' + sw + '</div></div>' +
    '<div class="sheet-row"><span class="sheet-lab">' + esc(T('hlSpan')) + '</span><div class="spanrow"><button class="spanbtn" data-xact="hlsp" data-d="-1">－</button><span class="spannum" id="hlNum">' + esc(T('spanUnit', v.sp)) + '</span><button class="spanbtn" data-xact="hlsp" data-d="1">＋</button><button class="spanbtn wide" data-xact="hlsp" data-d="p">' + esc(T('spanP')) + '</button></div></div>' +
    '<textarea class="sheet-ta" id="hlNote" placeholder="' + esc(T('hlNotePH')) + '">' + esc(v.n || '') + '</textarea>' +
    '<div class="sheet-acts"><button class="btn gold" data-xact="hlsave">' + esc(T('save')) + '</button><button class="btn" data-xact="hlask">' + svgI('chat') + ' ' + esc(T('askXz')) + '</button></div>' +
    '<div class="sheet-acts2"><button class="xbtn gold" data-xact="hlcard">' + svgI('img') + ' ' + esc(T('makeCard')) + '</button><button class="xbtn" data-xact="hlread">' + svgI('sound') + ' ' + esc(T('readThis')) + '</button><button class="xbtn" data-xact="hlcopy">' + esc(T('copy')) + '</button><button class="xbtn" data-xact="hlshare">' + esc(T('share')) + '</button><button class="xbtn bad" data-xact="hldel">' + esc(T('hlDel')) + '</button><button class="xbtn" data-xact="hclose">' + esc(T('close')) + '</button></div>');
}
function hlNoteGrab() { var ta = document.getElementById('hlNote'); if (ta && hlCur) { hlCur.v.n = trim(ta.value); mkSet(hlCur.no, hlCur.key, hlCur.v); } }
function hlSpan(d) {
  if (!hlCur) return; var list = mkList(), v = hlCur.v, i = -1, n, j;
  for (j = 0; j < list.length; j++) if (mkKeyOf(list[j]).key === hlCur.key) { i = j; break; }
  if (i < 0) return;
  if (d === 'p') {
    var par = list[i].parentNode; n = 1; while (i + n < list.length && list[i + n].parentNode === par) n++;
    toast(n === v.sp ? T('spanIsP') : T('spanDoneP', n));
  } else n = (v.sp || 1) + (+d);
  n = Math.max(1, Math.min(n, list.length - i)); v.sp = n; v.t = mkTextFromDom(list, i, n);
  mkSet(hlCur.no, hlCur.key, v); paintMarks();
  var q = document.getElementById('hlQuote'); if (q) q.textContent = v.t;
  var nm = document.getElementById('hlNum'); if (nm) nm.textContent = T('spanUnit', v.sp);
}
function hlShareText(no, v) { return Q(v.t) + '\n—— ' + mkRefOf(no) + (v.n ? '\n\n' + v.n : '') + '\n\n' + T('fellowshipName') + '\n' + appShareUrl(); }
function hlDelete(no, key) {
  var all = mkAll(); if (all[String(no)]) { delete all[String(no)][key]; var left = 0, k; for (k in all[String(no)]) left++; if (!left) delete all[String(no)]; }
  mkStore(all);
}
/* 舊面板的入口一律改走新面板，且不再整課重畫 */
mkOpenSheet = function (no, key) { openHlSheet(no, key); };
mkSaveNote = function () { hlNoteGrab(); closeHSheet(); paintMarks(); };
mkClearNote = function (sig) { var p = String(sig).split('|'), v = mkVal(mkGet(+p[0])[p[1]]); if (v) { v.n = ''; mkSet(+p[0], p[1], v); } mkCloseSheet(); paintMarks(); };
mkDelMark = function (sig) { var p = String(sig).split('|'); hlDelete(+p[0], p[1]); mkCloseSheet(); paintMarks(); };
mkBarHTML = function (no) {
  var c = mkCount(no); if (!c) return '';
  var n = mkNoteCount(no);
  return '<button class="btn ghost" id="mkBar" data-xact="gomarks" style="margin-top:14px">📑 ' + esc(f9('這一課的畫線與默想（' + c + ' 處' + (n ? '・默想 ' + n : '') + '）', 'Highlights in this lesson (' + c + (n ? ' · notes ' + n : '') + ')')) + '</button>';
};
mkCopyAll = function (no) {
  var m = mkGet(no), lines = [f9('【第' + no + '課・我的畫線與默想】', '[Lesson ' + no + ' · my highlights]')];
  for (var k in m) { if (!Object.prototype.hasOwnProperty.call(m, k)) continue; var v = mkVal(m[k]); lines.push('・' + (v.t || mkSpanText(no, k, v.sp))); if (trim(v.n)) lines.push('　' + f9('默想：', 'Note: ') + v.n); }
  lines.push('—— ' + T('fellowshipName')); copyText(lines.join('\n')); toast(T('copied'));
};

/* ---------- 「我的畫線・收藏・書籤」頁 ---------- */
var MARKS_TAB = 'hl';
function allMarks() {
  var a = mkAll(), out = [];
  for (var no in a) for (var k in a[no]) if (Object.prototype.hasOwnProperty.call(a[no], k)) {
    var v = mkVal(a[no][k]); out.push({ no: +no, key: k, v: v, t: v.t || mkSpanText(+no, k, v.sp), ts: v.ts || 0 });
  }
  out.sort(function (x, y) { return (y.ts - x.ts) || (x.no - y.no); });
  return out;
}
function marksPage() {
  var tabs = [['hl', T('fHl')], ['fav', T('fFav')], ['bm', T('fBm')]], h = '';
  h += pageHead(f9('我的', 'MINE'), f9('畫線・收藏・書籤', 'Highlights · Saved · Bookmarks'), T('hlTip'));
  h += '<div class="seg">'; eachA(tabs, function (x) { h += '<button class="' + (MARKS_TAB === x[0] ? 'on' : '') + '" data-xact="mtab" data-t="' + x[0] + '">' + esc(x[1]) + '</button>'; }); h += '</div>';
  if (MARKS_TAB === 'hl') {
    var ms = allMarks();
    if (!ms.length) return h + '<div class="card center"><p class="note">' + esc(T('noHl')) + '</p></div>';
    h += '<div class="card" style="padding:4px 16px">';
    eachA(ms, function (x) {
      h += '<div class="hitem"><div class="q" data-color="' + x.v.c + '">' + esc(x.t) + '</div>' + (trim(x.v.n) ? '<div class="n">' + esc(x.v.n) + '</div>' : '') +
        '<div class="m"><span>' + esc(mkRefOf(x.no)) + (x.ts ? ' · ' + fmtDate(x.ts) : '') + '</span><span>' +
        '<button data-xact="hlgo" data-no="' + x.no + '" data-k="' + esc(x.key) + '" aria-label="open">↗</button>' +
        '<button data-xact="hlcard2" data-no="' + x.no + '" data-k="' + esc(x.key) + '" aria-label="picture">🖼</button>' +
        '<button data-xact="hldel2" data-no="' + x.no + '" data-k="' + esc(x.key) + '" aria-label="delete">✕</button></span></div></div>';
    });
    return h + '</div>';
  }
  if (MARKS_TAB === 'fav') {
    var F = aicFavs();
    if (!F.length) return h + '<div class="card center"><p class="note">' + esc(T('noFav')) + '</p></div>';
    h += '<div class="card" style="padding:4px 16px">';
    eachA(F, function (f, i) {
      h += '<div class="hitem">' + (f.q ? '<div class="fq">' + esc(f.q) + '</div>' : '') + '<div class="md">' + mdToHtml(f.a) + '</div><div class="m"><span>' + (f.t ? fmtDate(f.t) : '') + '</span><span>' +
        '<button data-xact="favtts" data-i="' + i + '">🔊</button><button data-xact="favcard" data-i="' + i + '" aria-label="picture">🖼</button><button data-xact="favshare" data-i="' + i + '" aria-label="share">↗</button><button data-xact="favdel" data-i="' + i + '" aria-label="delete">✕</button></span></div></div>';
    });
    return h + '</div>';
  }
  var bms = []; for (var b in S.bm) bms.push([b, S.bm[b]]); bms.sort(function (x, y) { return y[1] - x[1]; });
  if (!bms.length) return h + '<div class="card center"><p class="note">' + esc(T('noBm')) + '</p></div>';
  h += '<div class="card" style="padding:4px 16px">';
  eachA(bms, function (x) {
    var p = x[0].split('|'), no = +p[0];
    h += '<div class="hitem"><div class="q">🔖 ' + esc(mkSpanText(no, p[1], 1)) + '</div><div class="m"><span>' + esc(mkRefOf(no)) + ' · ' + fmtDate(x[1]) + '</span><span><button data-xact="hlgo" data-no="' + no + '" data-k="' + esc(p[1]) + '">↗</button><button data-xact="bmdel" data-k="' + esc(x[0]) + '">✕</button></span></div></div>';
  });
  return h + '</div>';
}
var GOTO_MK = null;
function gotoMark(no, key) { GOTO_MK = no + '|' + key; openLesson(no); }
