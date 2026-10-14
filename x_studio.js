/* =====================================================================
   美圖工作室（全螢幕面板）：卡片＋相片＋Pexels；下方載入 media.js（小智寫祝福、配樂、錄音／影片、我的作品）
   入口：今日金句、課文（經文／亮光／宣告／我的畫線／默想）、畫線面板、小智回答、收藏。
   ===================================================================== */
function chipRow(act, list, cur) {
  var b = '<div class="xchips">';
  eachA(list, function (x) { b += '<button class="xchip' + (String(cur) === String(x[0]) ? ' on' : '') + '" data-xact="' + act + '" data-v="' + esc(x[0]) + '">' + esc(x[1]) + '</button>'; });
  return b + '</div>';
}
function openStudio(c) {
  stopAll(); closeHSheet(); try { mkCloseSheet(); } catch (e) { }
  if (aic.open) { aic.open = false; renderAIC(); }
  studio = { t: c.t || '', ref: c.ref || '', n: c.n || '', n0: c.n || '', plain: !!c.plain, opts: c.opts || null, opt: 0 };
  var ov = document.getElementById('studioOv');
  if (!ov) { ov = document.createElement('div'); ov.id = 'studioOv'; ov.className = 'studio-ov'; document.body.appendChild(ov); }
  ov.className = 'studio-ov open'; ov.scrollTop = 0;
  try { document.documentElement.style.overflow = 'hidden'; } catch (e) { }
  try { history.pushState({ studio: 1 }, '', location.href); STUDIO_PUSHED = true; } catch (e) { STUDIO_PUSHED = false; }
  studioRender();
}
var STUDIO_PUSHED = false;
function closeStudio(fromPop) {
  var ov = document.getElementById('studioOv'); if (!ov || ov.className.indexOf('open') < 0) return true;
  if (window.MX && MX.busy && MX.busy()) { toast(T('recBusyClose')); if (fromPop) { try { history.pushState({ studio: 1 }, '', location.href); } catch (e) { } } return false; }
  try { if (window.MX) MX.leave(); } catch (e) { }
  ov.className = 'studio-ov'; ov.innerHTML = ''; studio = null;
  try { document.documentElement.style.overflow = ''; } catch (e) { }
  if (!fromPop && STUDIO_PUSHED) { STUDIO_PUSHED = false; try { history.back(); } catch (e) { } }
  STUDIO_PUSHED = false; BUSY = BUSY_OTHER(); updIdle();
  return true;
}
window.addEventListener('popstate', function () { var ov = document.getElementById('studioOv'); if (ov && ov.className.indexOf('open') >= 0) { STUDIO_PUSHED = false; closeStudio(true); } }, false);
function studioRender() {
  var ov = document.getElementById('studioOv'); if (!ov || !studio) return;
  var y = ov.scrollTop, c = studio;
  var b = '<div class="studio-in"><div class="studio-top"><button class="xib" data-xact="stclose" aria-label="close">✕</button><b>' + esc(T('studioT')) + '</b><span></span></div>';
  if (c.opts && c.opts.length > 1) { var o = []; eachA(c.opts, function (x, i) { o.push([i, x.label]); }); b += '<p class="eyebrow">' + esc(T('cFrom')) + '</p>' + chipRow('copt', o, c.opt); }
  b += '<div class="cardpv" id="cardPv"></div>' +
    '<div class="xrow"><button class="btn gold" data-xact="csave">' + esc(T('saveImg')) + '</button><button class="btn ghost" data-xact="cshare">' + esc(T('share')) + '</button></div><div class="card">';
  var tp = []; eachA(CARD_ORDER, function (k) { tp.push([k, T(CARD_TPL[k].n)]); });
  b += '<p class="eyebrow">' + esc(T('cTpl')) + '</p>' + chipRow('ctpl', tp, S.card.tpl);
  b += '<p class="eyebrow">' + esc(T('cSize')) + '</p>' + chipRow('csize', [['p', T('sz916')], ['t', T('sz45')], ['s', T('szSq')], ['w', T('szWide')]], S.card.size);
  var bd = []; eachA(CARD_BORDERS, function (k) { bd.push([k, T('bd_' + k)]); }); b += '<p class="eyebrow">' + esc(T('cBorder')) + '</p>' + chipRow('cborder', bd, S.card.border);
  var fs = []; eachA(CARD_FS, function (f) { fs.push([f[0], T(f[1])]); }); b += '<p class="eyebrow">' + esc(T('cFs')) + '</p>' + chipRow('cfs', fs, S.card.fs);
  b += '<p class="eyebrow">' + esc(T('cPhoto')) + '</p><div class="xrow wrap"><button class="xbtn" data-xact="cphoto">' + esc(T('pickPhoto')) + '</button><button class="xbtn" data-xact="cpexels">' + esc(T('pexels')) + '</button>' + (photoImg ? '<button class="xbtn bad" data-xact="cnophoto">' + esc(T('noPhoto')) + '</button>' : '') + '<input type="file" id="cphotoIn" accept="image/*" style="display:none"></div></div><div class="card">';
  b += '<div class="q"><label>' + esc(T('cText')) + '</label><textarea data-c="t">' + esc(c.t) + '</textarea></div>';
  b += '<div class="q"><label>' + esc(T('cRef')) + '</label><input type="text" data-c="ref" value="' + esc(c.ref) + '"></div>';
  b += '<div class="q"><label>' + esc(T('cNote')) + '</label><textarea data-c="n" placeholder="' + esc(T('cNotePH')) + '">' + esc(c.n) + '</textarea><div id="mxNote"></div></div>';
  b += '<div class="q"><label>' + esc(T('cTo')) + '</label><input type="text" data-cs="to" value="' + esc(S.card.to) + '" placeholder="' + esc(T('cToPH')) + '"><div class="audnote">' + esc(T('audFor', AUD.icon[S.aud] + ' ' + audL().name[S.aud])) + '</div></div>';
  b += '<div class="q"><label>' + esc(T('cTop')) + '</label><input type="text" data-cs="top" value="' + esc(S.card.top) + '" placeholder="' + esc(T('fellowshipName')) + '"></div>';
  b += '<div class="q"><label>' + esc(T('cSignL')) + '</label><input type="text" data-cs="sign" value="' + esc(S.card.sign) + '" placeholder="' + esc(T('cardBless')) + '"></div></div><div id="mxBox"><div class="card center"><p class="note">' + esc(T('loadingMedia')) + '</p></div></div></div>';
  ov.innerHTML = b; simpifyEl(ov.querySelector('.studio-top')); ov.scrollTop = y;
  renderCard(); loadMedia();
  eachA(qa('[data-c],[data-cs]', ov), function (e) {
    e.oninput = function () {
      var k = e.getAttribute('data-c'); if (k) studio[k] = e.value; else { S.card[e.getAttribute('data-cs')] = e.value; save(); }
      clearTimeout(studioRender._t); studioRender._t = setTimeout(renderCard, 250);
    };
  });
  var fi = document.getElementById('cphotoIn');
  if (fi) fi.onchange = function () {
    var f = this.files && this.files[0]; if (!f) return; var rd = new FileReader();
    rd.onload = function () { var im = new Image(); im.onload = function () { photoImg = im; photoBy = ''; studioRender(); }; im.onerror = function () { toast(T('photoBad')); }; im.src = rd.result; };
    rd.readAsDataURL(f);
  };
}
function loadMedia() {
  if (window.MX) { try { MX.paint(); } catch (e) { } return; }
  if (loadMedia.on) return; loadMedia.on = 1;
  var sc = document.createElement('script'); sc.src = 'media.js?v=' + APPVER;
  sc.onload = function () { if (window.MX && document.getElementById('mxBox')) MX.paint(); };
  sc.onerror = function () { loadMedia.on = 0; var bx = document.getElementById('mxBox'); if (bx) bx.innerHTML = '<div class="card center"><p class="note">' + esc(T('mediaFail')) + '</p></div>'; };
  document.body.appendChild(sc);
}

/* ---------- 取代舊入口：今日金句美圖／錄音、課文美圖 ---------- */
makeVerseImage = function () {
  var v = todayVerse(); if (!v) return;
  openStudio({ t: v.text, ref: v.ref, n: v.motto || '' });
};
openRec = function () { makeVerseImage(); setTimeout(function () { var bx = document.getElementById('mxBox'); if (bx) try { bx.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { } }, 900); };
function lessonCardOpts(no) {
  var L1 = ensureLesson(no) || {}, ref = mkRefOf(no) + ' ' + lessonTitleOf(no, L1.title || ''), o = [];
  var sc = L1.scripture || {};
  if (sc.text) o.push({ label: T('optVerse'), t: sc.text, ref: sc.ref || '', n: '' });
  var lg = (L1.lights && L1.lights[0]) || ''; if (!lg) eachA(L1.blocks || [], function (b) { if (!lg && b.t === 'light') lg = b.v; });
  if (lg) o.push({ label: T('optLight'), t: lg, ref: ref, n: '', plain: true });
  if (L1.declaration) o.push({ label: T('optDec'), t: L1.declaration, ref: ref, n: '', plain: true });
  var m = mkGet(no), firstK = null, firstN = null;
  for (var k in m) if (Object.prototype.hasOwnProperty.call(m, k)) { var v = mkVal(m[k]); if (!firstK) firstK = { t: v.t || mkSpanText(no, k, v.sp), n: v.n }; if (!firstN && trim(v.n)) firstN = { t: v.t || mkSpanText(no, k, v.sp), n: v.n }; }
  if (firstK) o.push({ label: T('optMark'), t: firstK.t, ref: ref, n: firstK.n || '' });
  if (firstN && firstN !== firstK) o.push({ label: T('optNote'), t: firstN.t, ref: ref, n: firstN.n });
  return o;
}
lmtOpen = function (no) {
  var o = lessonCardOpts(no); if (!o.length) { toast(T('noCardSrc')); return; }
  var c = o[0]; openStudio({ t: c.t, ref: c.ref, n: c.n, plain: c.plain, opts: o });
};
