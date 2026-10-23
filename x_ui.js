/* =====================================================================
   介面整合：頂列「繁 简 EN ／A+」、四段字級、護眼主題、設定頁（回答對象、朗讀聲音語速、版本與更新）、
   新頁面（我的畫線・收藏・書籤、讀經樂）、課文工具列、事件委派、自動更新
   ===================================================================== */
function BUSY_OTHER() {
  var rec = false; try { rec = !!(window.MX && MX.busy && MX.busy()); } catch (e) { }
  var typing = false; try { var ae = document.activeElement; typing = !!(ae && /^(TEXTAREA|INPUT)$/.test(ae.tagName) && trim(ae.value)); } catch (e) { }
  return !!(rec || aic.busy || (PL && !PL.done) || rwShowing || document.getElementById('hsheet') || typing ||
    (document.getElementById('studioOv') && document.getElementById('studioOv').className.indexOf('open') >= 0));
}
function updBusy() { return !!(BUSY || spk.on || sayKey || BUSY_OTHER()); }

/* ---------- 字級四段、主題四種 ---------- */
var FS_LEVELS = ['1', '1.2', '1.45', '1.7'];
function fsCycle() {
  var cur = lsGet('k321_fontscale') || '1', i = FS_LEVELS.indexOf(cur); i = (i + 1) % FS_LEVELS.length;
  applyFs(FS_LEVELS[i]); lsSet('k321_fontscale', FS_LEVELS[i]);
  toast(T('fontNow', [t('fsStd'), t('fsBig'), t('fsXl'), t('fsXxl')][i]));
  if (aic.open) renderAIC();
}
var _applyTheme0 = applyTheme;
applyTheme = function (v) {
  _applyTheme0(v);
  if (v === 'sepia') { document.documentElement.setAttribute('data-theme', 'sepia'); var mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.setAttribute('content', '#5B4630'); }
  markTheme(v);
};

/* ---------- 頂列：繁 简 EN ＋ A+ ---------- */
function switchLang(v) {
  if (v === curLang()) return;
  stopAll(); closeHSheet(); lsSet('k321_lang', v); applyLang(v); render(CUR_ROUTE);
  if (aic.open) renderAIC();
}
var _renderTabs0 = renderTabs;
renderTabs = function (active) {
  _renderTabs0(active);
  var bb = document.getElementById('brandBox'); if (!bb || bb.querySelector('.xpill')) return;
  var lg = curLang(), h = '<span class="xpills">';
  eachA([['zh-Hant', '繁'], ['zh-Hans', '简'], ['en', 'EN']], function (x) { h += '<button class="xpill' + (lg === x[0] ? ' on' : '') + '" data-xact="lang" data-l="' + x[0] + '" aria-label="' + x[0] + '">' + x[1] + '</button>'; });
  h += '<button class="xpill fs" data-xact="fscycle" aria-label="text size">A<sup>+</sup></button></span>';
  bb.innerHTML = bb.innerHTML.replace(/<small>[\s\S]*<\/small>/, '<small class="xtag">' + esc(t('brandTag')) + '</small>') + h;
  var top = document.querySelector('.appbar');
  if (top && !document.getElementById('xRead')) {
    var b = document.createElement('button'); b.className = 'iconbtn'; b.id = 'xRead'; b.setAttribute('aria-label', 'read aloud'); b.setAttribute('data-xact', 'ttspage');
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
    var sb = document.getElementById('setBtn'); top.insertBefore(b, sb);
  }
};

/* ---------- 設定頁：回答對象、朗讀聲音、版本與更新 ---------- */
renderVoiceBlock = function () {
  var host = document.getElementById('setVoiceBlock'); if (!host) return;
  var lg = L(), vs = VOICES[lg], vb = '', rb = '';
  eachA(vs, function (v, i) { vb += '<button data-xact="voice" data-i="' + i + '"' + (voiceIdx() === i ? ' class="on"' : '') + '>' + esc(isZS() ? toSimp(v[1]) : v[1]) + '</button>'; });
  eachA([T('rateSlow'), T('rateStd'), T('rateFast'), T('rateFaster')], function (x, i) { rb += '<button data-xact="rate" data-i="' + i + '"' + (S.rate === i ? ' class="on"' : '') + '>' + esc(x) + '</button>'; });
  host.innerHTML =
    '<div class="fsrow" style="margin-top:16px"><div>' + esc(T('audT')) + '</div></div>' + audBar('set') +
    '<div class="fsrow" style="margin-top:16px"><div>' + esc(T('voiceT')) + '</div><div class="opts">' + vb + '</div></div>' +
    '<div class="fsrow" style="margin-top:10px"><div>' + esc(T('rateT')) + '</div><div class="opts">' + rb + '</div></div>' +
    '<div class="xrow" style="margin-top:8px"><button class="xbtn" data-xact="voicetest">🔊 ' + esc(T('voiceTest')) + '</button><button class="xbtn" data-xact="ttsclear">' + esc(t('ttsClearCache')) + '</button></div>' +
    '<p class="note">' + esc(T('voiceNote')) + '</p>' +
    '<hr class="hr"><div class="xrow wrap"><button class="xbtn" data-xact="gomarks">📑 ' + esc(T('myMarks')) + '</button><button class="xbtn" data-xact="goplay">🎯 ' + esc(T('plTitle')) + '</button></div>' +
    '<hr class="hr"><div class="fsrow"><div>' + esc(T('verT')) + '</div><div class="vtag">v' + esc(APPVER) + '</div></div>' +
    '<div class="xrow"><button class="xbtn" data-xact="chkupd">' + esc(T('checkUpd')) + '</button><button class="xbtn" data-xact="hardupd">' + esc(T('hardUpd')) + '</button></div>';
  simpifyEl(host);
};
var _openSet0 = openSet;
openSet = function () { renderVoiceBlock(); _openSet0(); };

/* ---------- 新頁面 ---------- */
PAGES.marks = function () { return marksPage(); };
PAGES.play = function () { return playPage(); };
TITLES.marks = '我的畫線'; TITLES.play = '讀經樂';
var _more0 = PAGES.more;
PAGES.more = function () {
  var h = _more0();
  var add = rowlink('spark', f9('讀經樂', 'Play & Learn'), f9('小智照課文出題：測驗・猜謎・錯題本', 'Quizzes and riddles from your lesson · review book'), 'play') +
    rowlink('book', f9('我的畫線・收藏・書籤', 'My Highlights · Saved · Bookmarks'), f9('畫過的句子、默想、小智收藏', 'Highlighted lines, notes and saved answers'), 'marks') +
    '<button class="rowlink" data-xact="studio"><span class="ri">' + icon('image', 22) + '</span><span class="rt"><b>' + esc(f9('經文美圖工作室', 'Verse Picture Studio')) + '</b><span>' + esc(f9('美圖・配樂・錄音錄影・我的作品', 'Pictures · music · voice and video · my works')) + '</span></span><span class="chev">' + icon('chev', 20) + '</span></button>';
  return h.replace('<div class="hr"></div>', add + '<div class="hr"></div>');
};

/* ---------- 每次畫面重畫之後 ---------- */
var LANG_SEEN = curLang(), LAST_LNO = null;
var _render0 = render;
render = function (route) {
  var r = route || currentRoute();
  var same = (r === CUR_ROUTE) && LANG_SEEN === curLang() && (r !== 'lesson' || LAST_LNO === LESSON_NO);
  if (!same) { stopAll(); closeHSheet(); if (r !== 'play' && PL && !PL.done) { PL = null; } }
  window.__keepSpeak = same;
  try { _render0(route); } finally { window.__keepSpeak = false; }
  LANG_SEEN = curLang(); LAST_LNO = LESSON_NO;
  afterRender(r, same);
};
function afterRender(r, same) {
  var view = document.getElementById('view'); if (!view) return;
  if (r === 'lesson' && LESSON_NO) {
    try { lsSet('k321_x_lastlesson', String(LESSON_NO)); } catch (e) { }
    paintMarks(view);
    var va = view.querySelector('.vact');
    if (va && !view.querySelector('.xtools')) {
      var d = document.createElement('div'); d.className = 'xtools';
      d.innerHTML = '<button class="xbtn' + (S.bmMode ? ' on' : '') + '" data-xact="bmmode">🔖 ' + esc(T(S.bmMode ? 'bmOn' : 'bmMode')) + '</button>' +
        '<button class="xbtn" data-xact="fscycle">A<sup>+</sup> ' + esc(T('fontB')) + '</button>' +
        '<button class="xbtn" data-xact="quizme">🎯 ' + esc(T('quizMe')) + '</button>' +
        '<button class="xbtn" data-xact="gomarks">📑 ' + esc(T('fHl')) + '</button>';
      simpifyEl(d); va.parentNode.insertBefore(d, va.nextSibling);
    }
    eachA(qa('.section-label', view), function (sl) {
      if (sl.querySelector('.xsec')) return;
      var nx = sl.nextElementSibling; if (!nx || !nx.querySelector || !nx.querySelector('.mk-s')) return;
      var b = document.createElement('button'); b.className = 'xsec rd-skip'; b.setAttribute('data-xact', 'ttssec'); b.setAttribute('aria-label', 'read this section'); b.innerHTML = '🔊';
      sl.appendChild(b);
    });
    var lb = view.querySelector('.lbody-card');
    if (lb && !lb.querySelector('.xsec')) { var b2 = document.createElement('button'); b2.className = 'xsec in rd-skip'; b2.setAttribute('data-xact', 'ttsbody'); b2.innerHTML = '🔊 ' + esc(T('readBody')); lb.insertBefore(b2, lb.firstChild); }
    if (GOTO_MK) {
      var p = GOTO_MK.split('|'); GOTO_MK = null;
      setTimeout(function () { var el = view.querySelector('[data-mk="' + p[0] + '|' + p[1] + '"]'); if (el) { try { el.scrollIntoView({ block: 'center' }); } catch (e) { } el.className += ' flash'; setTimeout(function () { el.className = el.className.replace(/\s*flash/g, ''); }, 2200); } }, 120);
    }
  }
  if (same) ttsRebind();
  updIdle();
}

/* ---------- 事件委派 ---------- */
document.addEventListener('click', function (e) {
  var tg = e.target;
  if (tg && tg.className === 'hl-note') { var hk = tg.getAttribute('data-hk').split('|'); openHlSheet(+hk[0], hk[1]); return; }
  var n = tg; while (n && n !== document && !(n.getAttribute && n.getAttribute('data-xact'))) n = n.parentNode;
  if (!n || n === document) return;
  var a = n.getAttribute('data-xact'), i = +n.getAttribute('data-i'), v = n.getAttribute('data-v');
  switch (a) {
    case 'lang': switchLang(n.getAttribute('data-l')); break;
    case 'fscycle': fsCycle(); break;
    case 'aud': setAud(n.getAttribute('data-a')); break;
    case 'ttspage': if (spk.on || sayKey) stopAll(); else ttsPage(null, '', false, currentRoute() === 'lesson' ? 'lesson' : ''); break;
    case 'ttssec': stopAll(); var nx = n.parentNode.nextElementSibling, f0 = nx && nx.querySelector('.mk-s,.rd-s'); if (f0) ttsPage(f0, n.parentNode.textContent.replace(/🔊/g, ''), true); break;
    case 'ttsbody': stopAll(); var f1 = n.parentNode.querySelector('.mk-s'); if (f1) { spk.on = false; ttsPage(f1, f9('課文', 'Lesson text'), false, 'lesson'); } break;
    case 'spkprev': spkSkip(-1); break;
    case 'spknext': spkSkip(1); break;
    case 'spkstop': stopAll(); break;
    case 'hlc': if (!hlCur) return; hlCur.v.c = n.getAttribute('data-c'); S.lastColor = hlCur.v.c; save(); hlNoteGrab(); paintMarks(); eachA(qa('.hlswatch'), function (b) { b.className = 'hlswatch' + (b === n ? ' on' : ''); }); break;
    case 'hlsp': hlSpan(n.getAttribute('data-d')); break;
    case 'hlsave': hlNoteGrab(); closeHSheet(); paintMarks(); toast(T('saved')); try { k3track('note_save'); } catch (x) { } break;
    case 'hlask': hlNoteGrab(); var h1 = hlCur; closeHSheet(); openXz(T('xzAboutHl', Q(h1.v.t), mkRefOf(h1.no), h1.v.n ? f9('我的默想：', 'My note: ') + h1.v.n + '\n' : ''), { t: h1.v.t, ref: mkRefOf(h1.no) }); break;
    case 'hlcard': hlNoteGrab(); var h2 = hlCur; openStudio({ t: h2.v.t, ref: mkRefOf(h2.no) + ' ' + lessonTitleOf(h2.no, (ensureLesson(h2.no) || {}).title || ''), n: h2.v.n }); break;
    case 'hlread': speakText(hlCur.v.t, 'hl', mkRefOf(hlCur.no)); break;
    case 'hlcopy': copyText(hlShareText(hlCur.no, hlCur.v)); toast(T('copied')); break;
    case 'hlshare': hlNoteGrab(); shareText(hlShareText(hlCur.no, hlCur.v)); break;
    case 'hldel': if (confirm(T('delHl'))) { hlDelete(hlCur.no, hlCur.key); closeHSheet(); paintMarks(); } break;
    case 'hclose': closeHSheet(); break;
    case 'gomarks': closeSheets(); MARKS_TAB = 'hl'; go('marks'); break;
    case 'goplay': closeSheets(); go('play'); break;
    case 'quizme': PL_SRC = 'cur'; go('play'); break;
    case 'bmmode': S.bmMode = !S.bmMode; save(); n.className = 'xbtn' + (S.bmMode ? ' on' : ''); n.innerHTML = '🔖 ' + esc(T(S.bmMode ? 'bmOn' : 'bmMode')); toast(T(S.bmMode ? 'bmOnT' : 'bmOffT')); break;
    case 'mtab': MARKS_TAB = n.getAttribute('data-t'); render('marks'); break;
    case 'hlgo': gotoMark(+n.getAttribute('data-no'), n.getAttribute('data-k')); break;
    case 'hlcard2': var no2 = +n.getAttribute('data-no'), k2 = n.getAttribute('data-k'), v2 = mkVal(mkGet(no2)[k2]); if (v2) openStudio({ t: v2.t || mkSpanText(no2, k2, v2.sp), ref: mkRefOf(no2), n: v2.n }); break;
    case 'hldel2': if (confirm(T('delHl'))) { hlDelete(+n.getAttribute('data-no'), n.getAttribute('data-k')); render('marks'); } break;
    case 'bmdel': delete S.bm[n.getAttribute('data-k')]; save(); render('marks'); break;
    case 'favtts': var fv = aicFavs()[i]; if (fv) { if (sayKey === 'f' + i) stopAll(); else speakText(mdSpeak(fv.a), 'f' + i, T('fFav')); } break;
    case 'favcard': var fc = aicFavs()[i]; if (fc) openStudio({ t: cardText(fc.a), ref: '', plain: true }); break;
    case 'favshare': var fs2 = aicFavs()[i]; if (fs2) shareText((fs2.q ? fs2.q + '\n\n' : '') + mdStrip(fs2.a) + '\n\n—— ' + T('fellowshipName') + '\n' + appShareUrl()); break;
    case 'favdel': if (confirm(t('aiFavRemoveConfirm'))) { var F = aicFavs(); F.splice(i, 1); aicSaveFavs(F); if (currentRoute() === 'marks') render('marks'); if (aic.open) renderAIC(); } break;
    case 'msgfold': msgFold(i); break;
    case 'chatfoldall': foldAll(); break;
    case 'msgfav': aicFav(i); break;
    case 'msgshare': msgShare(i); break;
    case 'msgcard': var mm = aic.msgs[i]; if (mm) openStudio(mm.src ? { t: mm.src.t, ref: mm.src.ref, n: cardText(mm.text) } : { t: cardText(mm.text), ref: '', plain: true }); break;
    case 'msgcopy': var mc = aic.msgs[i]; if (mc) { copyText(mdStrip(mc.text)); toast(T('copied')); } break;
    case 'msgtts': var mt = aic.msgs[i]; if (mt) { if (sayKey === 'm' + i) stopAll(); else speakText(mdSpeak(mt.text), 'm' + i, T('xz')); } break;
    case 'msgdel': msgDelete(i); break;
    case 'fuq': sendChat(n.getAttribute('data-q')); break;
    case 'chatq': sendChat(n.textContent); break;
    case 'qstog': var qp = document.getElementById('qsPanel'); if (qp) qp.style.display = qp.style.display === 'none' ? '' : 'none'; break;
    case 'studio': makeVerseImage(); break;
    case 'stclose': closeStudio(false); break;
    case 'copt': if (studio && studio.emb) { studioEmbSwitch(+v); break; } var o = studio && studio.opts && studio.opts[+v]; if (o) { studio.opt = +v; studio.t = o.t; studio.ref = o.ref; studio.n = o.n; studio.n0 = o.n; studio.plain = !!o.plain; studioRender(); } break;
    case 'ctpl': S.card.tpl = v; save(); studioRender(); break;
    case 'csize': S.card.size = v; save(); studioRender(); break;
    case 'cborder': S.card.border = v; save(); studioRender(); break;
    case 'cfs': S.card.fs = +v; save(); studioRender(); break;
    case 'cphoto': var ci = document.getElementById('cphotoIn'); if (ci) ci.click(); break;
    case 'cnophoto': photoImg = null; photoBy = ''; studioRender(); break;
    case 'cpexels': openPexels(); break;
    case 'pxq': px.q = n.getAttribute('data-q'); var pq = document.getElementById('pxQ'); if (pq) pq.value = px.q; pxRun(true); break;
    case 'pxgo': px.q = (document.getElementById('pxQ') || {}).value || ''; pxRun(true); break;
    case 'pxmore': pxRun(false); break;
    case 'pxpick': pxPick(i); break;
    case 'csave': cardSave(); break;
    case 'cshare': cardShare(); break;
    case 'plsrc': PL_SRC = v; render('play'); break;
    case 'plgo': plStart(n.getAttribute('data-m')); break;
    case 'plquit': PL = null; BUSY = BUSY_OTHER(); render('play'); updIdle(); break;
    case 'plpick': plPick(+n.getAttribute('data-k')); break;
    case 'plnext': plNext(); break;
    case 'plguess': plGuess(); break;
    case 'plhint': if (PL && PL.hints < 3) { PL.hints++; render('play'); } break;
    case 'plgive': if (PL) { PL.solved = true; PL.gave = true; render('play'); } break;
    case 'rwagain': eachA(rwUnits(), function (c) { if (c.id === n.getAttribute('data-u')) rwShow(c, true); }); break;
    case 'voice': S.voice[L()] = i; save(); renderVoiceBlock(); speakText(T('voiceSample'), 'vt', T('voiceT')); break;
    case 'rate': S.rate = i; save(); renderVoiceBlock(); break;
    case 'voicetest': speakText(T('voiceSample'), 'vt', T('voiceT')); break;
    case 'ttsclear': window.rvClearCache(); TTS_MEM = {}; break;
    case 'chkupd': checkUpdate(1); break;
    case 'hardupd': applyUpdate(true); break;
  }
}, false);
document.addEventListener('keydown', function (e) { if (e.target && e.target.id === 'plIn' && (e.key === 'Enter' || e.keyCode === 13)) { e.preventDefault(); plGuess(); } });
/* 設定頁裡的字級按鈕改成四段後，舊的綁定沿用（data-fs）；主題多一個「護眼」 */

/* =====================================================================
   自動更新：version.json 輪詢 ＋ Service Worker 更新 ＋ 新 SW 通知。忙碌時只顯示更新條。
   ===================================================================== */
var UPD = { reg: null, target: '', pending: false };
function ssGet(k) { try { return sessionStorage.getItem(k) || ''; } catch (e) { return ''; } }
function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }
function verFetch(ok, fail) {
  var x = new XMLHttpRequest();
  x.open('GET', 'version.json?t=' + now(), true);
  try { x.setRequestHeader('Cache-Control', 'no-cache'); } catch (e) { }
  x.timeout = 15000;
  x.onload = function () { if (x.status >= 200 && x.status < 300) { try { return ok(JSON.parse(x.responseText)); } catch (e) { } } if (fail) fail(); };
  x.onerror = x.ontimeout = function () { if (fail) fail(); };
  x.send();
}
function updBar(on) {
  var b = document.getElementById('updbar');
  if (!on) { if (b) b.parentNode.removeChild(b); return; }
  if (!b) { b = document.createElement('div'); b.id = 'updbar'; b.className = 'updbar'; b.onclick = function () { applyUpdate(false); }; document.body.appendChild(b); }
  b.textContent = T('newVer');
}
function reloadFresh() { if (window.__reloading) return; window.__reloading = 1; location.replace(location.pathname + '?u=' + now() + location.hash); }
function applyUpdate(hard) {
  updBar(false); toast(T('updating'));
  ssSet('updTry', UPD.target || 'x');
  if (!hard && navigator.serviceWorker && UPD.reg) {
    try { if (UPD.reg.waiting) UPD.reg.waiting.postMessage('skip'); UPD.reg.update(); } catch (e) { }
    setTimeout(reloadFresh, 900); return;
  }
  ssSet('updHard', UPD.target || 'x');
  var done = 0, fin = function () { if (!done) { done = 1; reloadFresh(); } };
  try {
    if (window.caches && caches.keys) caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches['delete'](k); })); })['catch'](function () { });
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) navigator.serviceWorker.getRegistrations().then(function (rs) { for (var i = 0; i < rs.length; i++) rs[i].unregister(); setTimeout(fin, 300); }, fin);
  } catch (e) { }
  setTimeout(fin, 1500);
}
function onNewVersion(v) {
  if (!v || v === APPVER) return;
  UPD.target = v;
  if (updBusy()) { UPD.pending = true; updBar(true); return; }
  if (ssGet('updHard') === v) { updBar(true); return; }
  applyUpdate(ssGet('updTry') === v);
}
function updIdle() { if (UPD.pending && !updBusy()) { UPD.pending = false; onNewVersion(UPD.target); } }
function checkUpdate(manual) {
  if (navigator.onLine === false) { if (manual) toast(T('netErr')); return; }
  try { if (UPD.reg) UPD.reg.update(); } catch (e) { }
  verFetch(function (j) {
    if (j && j.v && j.v !== APPVER) { if (manual) { UPD.target = j.v; applyUpdate(ssGet('updTry') === j.v); } else onNewVersion(j.v); }
    else if (manual) toast(T('upToDate'));
  }, function () { if (manual) toast(T('netErr')); });
}
function initUpdate() {
  if (!/^https?:/.test(location.protocol)) return;
  if (/[?&]u=\d+/.test(location.search) && history.replaceState) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { } }
  if ('serviceWorker' in navigator) {
    var sw = navigator.serviceWorker;
    try {
      sw.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
        UPD.reg = reg;
        var track = function (w) { if (w) w.addEventListener('statechange', function () { if (w.state === 'installed' && sw.controller) checkUpdate(0); }); };
        track(reg.installing); track(reg.waiting);
        reg.addEventListener('updatefound', function () { track(reg.installing); });
      })['catch'](function () { });
    } catch (e) { }
    /* 同網域還有其他 321 App（互動聖經等），它們的 SW 也會廣播 sw-updated；只接受自己這支 sw.js 的通知 */
    sw.addEventListener('message', function (e) {
      var d = e.data || {}; if (d.t !== 'sw-updated' || !d.v || d.v === APPVER) return;
      var src = e.source && e.source.scriptURL, mine = new URL('sw.js', location.href).href;
      if (src && src !== mine) return;
      if (d.app && d.app !== 'k321') return;
      onNewVersion(d.v);
    });
    sw.addEventListener('controllerchange', function () { if (UPD.target && UPD.target !== APPVER && !updBusy()) reloadFresh(); });
  }
  setTimeout(function () { checkUpdate(0); }, 2500);
  setInterval(function () { checkUpdate(0); }, 30 * 60 * 1000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') checkUpdate(0); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) checkUpdate(0); });
  window.addEventListener('online', function () { checkUpdate(0); });
  setInterval(updIdle, 20000);
}

/* ---------- 啟動 ---------- */
(function boot() {
  try { var th = lsGet('k321_theme'); if (th === 'sepia') applyTheme('sepia'); } catch (e) { }
  try { renderTabs(TAB_ROUTES[CUR_ROUTE] ? CUR_ROUTE : 'more'); } catch (e) { }
  renderVoiceBlock();
  initUpdate();
  try { if (CUR_ROUTE) afterRender(CUR_ROUTE, true); } catch (e) { }
})();

/* ---------- 321 App 生態：上面 晨讀321、321互動聖經；下面 六個生活操練 App ---------- */
function ecoCards(from, to) {
  var list = D.ecosystem || [], out = '<div class="apps">';
  for (var i = from; i < Math.min(to, list.length); i++) {
    var a = list[i], bw = String(a.badge || '').length > 1 ? ' wide' : '';
    var head = a.img ? '<span class="appicon"><img src="' + a.img + '" alt=""></span>' : '<span class="badge' + bw + '">' + esc(a.badge) + '</span>';
    out += '<a class="appcard" href="' + esc(safeUrl(ecoUrl(a))) + '" data-openapp="' + i + '" target="_blank" rel="noopener">' + head + '<b>' + esc(a.name) + '</b><span>' + esc(a.desc + ecoLangNote(a)) + '</span></a>';
  }
  return out + '</div>';
}
PAGES.apps = function () {
  var list = D.ecosystem || [], first = 0;
  for (var i = 0; i < list.length; i++) { if (list[i].group === 'life') { first = i; break; } first = i + 1; }
  return pageHead(f9('工具 · 每天用得上', 'TOOLS · FOR EVERY DAY'), f9('321 App', '321 Apps'), f9('點一下就打開，會自動用你現在的語言', 'Tap to open — in the language you are using')) +
    sect('生', f9('321 App 生態系', 'The 3-2-1 App Ecosystem')) +
    '<p class="note" style="margin-bottom:10px">' + esc(f9('每天晨讀、讀經，親近神。點一下就在這裡打開：', 'Morning devotion and Bible reading, to draw near to God every day. Tap one to open it right here:')) + '</p>' +
    ecoCards(0, first) +
    (first < list.length ? sect('活', f9('321 生活操練', '321 Living It Out')) +
      '<p class="note" style="margin-bottom:10px">' + esc(f9('把 321 活在每一個生活領域：屬靈、家庭、婚姻、職場、教會、社交。', 'Living out 3-2-1 in every part of life: spiritual life, family, marriage, work, church and friendships.')) + '</p>' +
      ecoCards(first, list.length) : '') +
    aiToolsBlock();
};

/* 在團契 App 裡開啟的子 App：記住開的是哪一個，頁面重新載入（自動更新、iOS 回到前景）也能接著開，不會「找不到這個 App」 */
var _openApp0 = openApp;
openApp = function (i) { try { sessionStorage.setItem('k321_appview', String(i)); } catch (e) { } _openApp0(i); };
var _appview0 = PAGES.appview;
PAGES.appview = function () {
  var list = D.ecosystem || [];
  if (APP_VIEW == null || !list[APP_VIEW]) {
    var k = -1; try { k = parseInt(sessionStorage.getItem('k321_appview'), 10); } catch (e) { }
    if (k >= 0 && list[k]) APP_VIEW = k;
    else { setTimeout(function () { go('apps'); }, 0); return ''; }
  }
  return _appview0();
};
var _closeApp0 = closeApp;
closeApp = function () { try { sessionStorage.removeItem('k321_appview'); } catch (e) { } _closeApp0(); };
