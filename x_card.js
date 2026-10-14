/* 經文美圖：9 版型、4 尺寸、6 外框、5 段字級、相片背景、Pexels、避頭尾、繁簡英字型——移植自 321教會生活 ext.js */
var CARD_TPL = {
  navy: { n: 'tplNavy', bg: ['#123F92', '#0D3988', '#071A42'], glow: 'rgba(212,166,91,.30)', ink: '#F2ECDD', accent: '#F7EFDC', gold: '#D4A65B', sub: '#BBA98A', frame: 'rgba(212,166,91,.42)' },
  paper: { n: 'tplPaper', bg: ['#FBF8F1', '#F4EFE3', '#EDE6D6'], glow: 'rgba(212,166,91,.45)', ink: '#3A3122', accent: '#23211C', gold: '#A9762F', sub: '#8A7C63', frame: 'rgba(169,118,47,.34)' },
  dawn: { n: 'tplDawn', bg: ['#FFF6EC', '#FBE9D2', '#F6D9B8'], glow: 'rgba(255,214,150,.6)', ink: '#3A2A1A', accent: '#8A4B16', gold: '#C97A22', sub: '#8A6A4A', frame: 'rgba(181,101,29,.30)' },
  grace: { n: 'tplGrace', bg: ['#F2F7F1', '#E4EFE6', '#D6E7DA'], glow: 'rgba(160,200,170,.5)', ink: '#1C2E26', accent: '#255943', gold: '#3C8A64', sub: '#5C7A6A', frame: 'rgba(46,106,80,.28)' },
  rose: { n: 'tplRose', bg: ['#FCF5F3', '#F6E7E3', '#EFD8D2'], glow: 'rgba(220,160,150,.45)', ink: '#33221E', accent: '#8A3D2E', gold: '#B36A54', sub: '#8A6A62', frame: 'rgba(154,74,58,.28)' },
  sky: { n: 'tplSky', bg: ['#F1F7FB', '#DFEEF6', '#CFE4F0'], glow: 'rgba(150,200,230,.5)', ink: '#1B2A33', accent: '#1E5270', gold: '#2E7DA0', sub: '#5A7684', frame: 'rgba(37,96,128,.28)' },
  linen: { n: 'tplLinen', bg: ['#F7F4EE', '#EFEAE0', '#E6DFD2'], glow: 'rgba(200,190,170,.4)', ink: '#2A2620', accent: '#4A4234', gold: '#8A7A5A', sub: '#7A7263', frame: 'rgba(90,80,64,.26)' },
  night: { n: 'tplNight', bg: ['#101E1B', '#16302A', '#0E2420'], glow: 'rgba(232,201,122,.26)', ink: '#EDEAE0', accent: '#E8C97A', gold: '#E8C97A', sub: '#9FB0AA', frame: 'rgba(232,201,122,.34)' },
  plain: { n: 'tplPlain', bg: ['#FFFFFF', '#FFFFFF', '#FFFFFF'], glow: 'rgba(0,0,0,0)', ink: '#23211C', accent: '#0D3988', gold: '#A9762F', sub: '#6B6255', frame: 'rgba(13,57,136,.22)' }
};
var CARD_ORDER = ['navy', 'paper', 'dawn', 'grace', 'rose', 'sky', 'linen', 'night', 'plain'];
var CARD_SIZES = { p: [1080, 1920, 'sz916'], t: [1080, 1350, 'sz45'], s: [1080, 1080, 'szSq'], w: [1920, 1080, 'szWide'] };
var CARD_BORDERS = ['classic', 'corner', 'inline', 'dots', 'ornate', 'none'];
var CARD_FS = [[0.9, 'cfs0'], [1, 'cfs1'], [1.2, 'cfs2'], [1.45, 'cfs3'], [1.7, 'cfs4']];
var studio = null, photoImg = null, photoBy = '', cardImg = null;
var NO_START = '，。、；：？！）」』】》〉·…—％', NO_END = '（「『【《〈';
function cardSerif() { return isZS() ? '"Noto Serif SC","Songti SC","STSong","SimSun",Georgia,serif' : (isEN() ? 'Georgia,"Times New Roman",serif' : '"Noto Serif TC","Songti TC","PMingLiU",Georgia,serif'); }
function cardSans() { return isZS() ? '"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif' : (isEN() ? '-apple-system,"Segoe UI",Roboto,Arial,sans-serif' : '"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif'); }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function wrapText(ctx, text, maxW) {
  var out = [];
  eachA(String(text || '').split('\n'), function (par) {
    if (!par) { out.push(''); return; } var line = '';
    if (isEN()) { eachA(par.split(/\s+/), function (w) { if (!w) return; var pr = line ? line + ' ' + w : w; if (ctx.measureText(pr).width > maxW && line) { out.push(line); line = w; } else line = pr; }); out.push(line); return; }
    for (var i = 0; i < par.length; i++) {
      var ch = par.charAt(i);
      if (ctx.measureText(line + ch).width > maxW && line) {
        if (NO_START.indexOf(ch) >= 0) { line += ch; continue; }
        var carry = ''; while (line.length > 1 && NO_END.indexOf(line.charAt(line.length - 1)) >= 0) { carry = line.charAt(line.length - 1) + carry; line = line.slice(0, -1); }
        out.push(line); line = carry + ch;
      } else line += ch;
    }
    out.push(line);
  });
  return out;
}
function coverDraw(ctx, img, x, y, w, h) { var ir = img.width / img.height, r = w / h, sw, sh, sx, sy; if (ir > r) { sh = img.height; sw = sh * r; sx = (img.width - sw) / 2; sy = 0; } else { sw = img.width; sh = sw / r; sx = 0; sy = (img.height - sh) / 2; } ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h); }
function drawBorder(ctx, W, H, pad, F, Tp) {
  var B = S.card.border; if (B === 'none') return;
  var line = Tp.frame, line2 = Tp.frame.replace(/[\d.]+\)$/, '0.55)'), gold = Tp.gold, m = pad * .5, x = m, y = m, w = W - m * 2, h = H - m * 2, Rr = Math.round(18 * F);
  if (B === 'classic') {
    ctx.strokeStyle = line; ctx.lineWidth = Math.max(2, W * .0022); rr(ctx, x, y, w, h, Rr); ctx.stroke();
    ctx.strokeStyle = line2; ctx.lineWidth = Math.max(1, W * .0009); rr(ctx, x + 9 * F, y + 9 * F, w - 18 * F, h - 18 * F, Math.round(12 * F)); ctx.stroke();
    ctx.fillStyle = gold; eachA([[x, y], [x + w, y], [x, y + h], [x + w, y + h]], function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], Math.round(5 * F), 0, 7); ctx.fill(); });
  } else if (B === 'corner') {
    ctx.strokeStyle = gold; ctx.lineWidth = Math.max(2, W * .003); ctx.lineCap = 'round'; var Lg = Math.round(56 * F);
    var seg = function (cx, cy, dx, dy) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * Lg, cy); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + dy * Lg); ctx.stroke(); };
    seg(x, y, 1, 1); seg(x + w, y, -1, 1); seg(x, y + h, 1, -1); seg(x + w, y + h, -1, -1); ctx.lineCap = 'butt';
  } else if (B === 'inline') { ctx.strokeStyle = line2; ctx.lineWidth = Math.max(1, W * .0013); rr(ctx, x + 6 * F, y + 6 * F, w - 12 * F, h - 12 * F, Math.round(14 * F)); ctx.stroke(); }
  else if (B === 'dots') {
    ctx.fillStyle = line2; var r0 = Math.max(2, W * .0026), gap = Math.round(26 * F), ex = x + 6 * F, ey = y + 6 * F, ew = w - 12 * F, eh = h - 12 * F, px2, py2;
    var dot = function (a, b) { ctx.beginPath(); ctx.arc(a, b, r0, 0, 7); ctx.fill(); };
    for (px2 = ex; px2 <= ex + ew; px2 += gap) { dot(px2, ey); dot(px2, ey + eh); } for (py2 = ey; py2 <= ey + eh; py2 += gap) { dot(ex, py2); dot(ex + ew, py2); }
  } else if (B === 'ornate') {
    ctx.strokeStyle = line; ctx.lineWidth = Math.max(2, W * .0022); rr(ctx, x, y, w, h, Rr); ctx.stroke();
    ctx.strokeStyle = gold; ctx.lineWidth = Math.max(1.5, W * .0016); ctx.lineCap = 'round'; var L2 = Math.round(34 * F), o = Math.round(16 * F);
    var flo = function (cx, cy, dx, dy) { ctx.beginPath(); ctx.moveTo(cx + dx * o, cy + dy * o); ctx.lineTo(cx + dx * (o + L2), cy + dy * o); ctx.moveTo(cx + dx * o, cy + dy * o); ctx.lineTo(cx + dx * o, cy + dy * (o + L2)); ctx.stroke(); ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(cx + dx * o, cy + dy * o, Math.round(4.5 * F), 0, 7); ctx.fill(); };
    flo(x, y, 1, 1); flo(x + w, y, -1, 1); flo(x, y + h, 1, -1); flo(x + w, y + h, -1, -1); ctx.lineCap = 'butt';
  }
}
function drawCard(cv, c, W, H) {
  var ctx = cv.getContext('2d'); cv.width = W; cv.height = H;
  var Tp = CARD_TPL[S.card.tpl] || CARD_TPL.navy, F = W / 1080, pad = Math.round(W * .085), iw = W - pad * 2, sans = cardSans(), serif = cardSerif(), FB = Math.min(1.8, Math.max(.85, +S.card.fs || 1));
  var g = ctx.createLinearGradient(0, 0, W * .3, H); g.addColorStop(0, Tp.bg[0]); g.addColorStop(.55, Tp.bg[1]); g.addColorStop(1, Tp.bg[2]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (photoImg) {
    coverDraw(ctx, photoImg, 0, 0, W, H); var hx = Tp.bg[1].replace('#', ''), R0 = parseInt(hx.slice(0, 2), 16), G0 = parseInt(hx.slice(2, 4), 16), B0 = parseInt(hx.slice(4, 6), 16);
    var sc = ctx.createLinearGradient(0, 0, 0, H), rgb = 'rgba(' + R0 + ',' + G0 + ',' + B0 + ','; sc.addColorStop(0, rgb + '0.46)'); sc.addColorStop(.5, rgb + '0.66)'); sc.addColorStop(1, rgb + '0.56)'); ctx.fillStyle = sc; ctx.fillRect(0, 0, W, H);
  }
  var rg = ctx.createRadialGradient(W * .84, H * .10, 10, W * .84, H * .10, W * .75); rg.addColorStop(0, Tp.glow); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  drawBorder(ctx, W, H, pad, F, Tp);
  var grp = trim(S.card.top) || T('fellowshipName'), grpSz = Math.round(30 * F * FB), grpY = pad + Math.round(30 * F) + grpSz;
  while (grpSz > Math.round(16 * F)) { ctx.font = '600 ' + grpSz + 'px ' + sans; if (ctx.measureText(grp).width <= iw - 80 * F) break; grpSz -= 2; }
  ctx.textAlign = 'center'; ctx.fillStyle = Tp.sub; ctx.font = '600 ' + grpSz + 'px ' + sans; var gw = ctx.measureText(grp).width; ctx.fillText(grp, W / 2, grpY);
  ctx.strokeStyle = Tp.frame.replace(/[\d.]+\)$/, '0.6)'); ctx.lineWidth = Math.max(1, 1.5 * F);
  eachA([[W / 2 - gw / 2 - 28 * F, -1], [W / 2 + gw / 2 + 28 * F, 1]], function (a) { ctx.beginPath(); ctx.moveTo(a[0], grpY - 9 * F); ctx.lineTo(a[0] + a[1] * 30 * F, grpY - 9 * F); ctx.stroke(); });
  var toName = trim(S.card.to);
  if (toName) { var ts2 = Math.round(40 * F * FB); ctx.fillStyle = Tp.ink; while (ts2 > Math.round(22 * F * FB)) { ctx.font = '600 ' + ts2 + 'px ' + serif; if (ctx.measureText(toName).width <= iw) break; ts2 -= Math.round(2 * F); } ctx.font = '600 ' + ts2 + 'px ' + serif; ctx.fillText(toName, W / 2, grpY + Math.round(80 * F)); }
  var botRoom0 = pad + Math.round(40 * F) + Math.round(30 * F * FB), topRoom = grpY + Math.round((toName ? 120 : 46) * F), botRoom = botRoom0, room = H - topRoom - botRoom;
  var raw = trim(String(c.t || '').replace(/\s+/g, isEN() ? ' ' : '')).replace(/[，、；：,;]+$/, '');
  var verse = isEN() ? ((/^[“"']/.test(raw) ? '' : '“') + raw + (/[”"']$/.test(raw) ? '' : '”')) : ((/^[「『]/.test(raw) ? '' : '「') + raw + (/[」』]$/.test(raw) ? '' : '」'));
  if (c.plain) verse = raw;
  var note = trim(c.n || ''), vs = Math.round(58 * F * FB), vl;
  while (true) { ctx.font = '600 ' + vs + 'px ' + serif; vl = wrapText(ctx, verse, iw); if (vl.length <= (isEN() ? 9 : 7) || vs <= Math.round(28 * F)) break; vs -= Math.round(3 * F); }
  var fixed = vs * .9 + vl.length * vs * 1.52 + Math.round(64 * F) + (note ? Math.round(86 * F) : 0), ns = Math.round(38 * F * FB), nl = [];
  if (note) { while (true) { ctx.font = ns + 'px ' + sans; nl = wrapText(ctx, note, iw); if (fixed + nl.length * ns * 1.76 <= room || ns <= Math.round(21 * F)) break; ns -= Math.round(2 * F); } }
  var total = fixed + (note ? nl.length * ns * 1.76 : 0), y = topRoom + Math.max(0, (room - total) / 2);
  ctx.fillStyle = Tp.accent; ctx.font = '600 ' + vs + 'px ' + serif; y += vs * .9; eachA(vl, function (l) { ctx.fillText(l, W / 2, y); y += vs * 1.52; });
  if (c.ref) { ctx.font = Math.round(30 * F) + 'px ' + sans; ctx.fillStyle = Tp.accent; ctx.fillText(c.ref, W / 2, y); } y += Math.round(64 * F);
  if (note) {
    ctx.fillStyle = Tp.gold; ctx.beginPath(); ctx.arc(W / 2, y, Math.round(5 * F), 0, 7); ctx.fill(); ctx.strokeStyle = Tp.gold; ctx.lineWidth = 2.5 * F;
    ctx.beginPath(); ctx.moveTo(W / 2 - 52 * F, y); ctx.lineTo(W / 2 - 16 * F, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W / 2 + 16 * F, y); ctx.lineTo(W / 2 + 52 * F, y); ctx.stroke();
    y += Math.round(44 * F) + ns; ctx.textAlign = 'left'; ctx.fillStyle = Tp.ink; ctx.font = ns + 'px ' + sans; eachA(nl, function (l) { ctx.fillText(l, pad, y); y += ns * 1.76; }); ctx.textAlign = 'center';
  }
  var sign = trim(S.card.sign) || T('cardBless'), ss = Math.round(30 * F * FB); ctx.fillStyle = Tp.sub;
  while (ss > Math.round(15 * F * FB)) { ctx.font = '600 ' + ss + 'px ' + sans; if (ctx.measureText(sign).width <= iw) break; ss -= 2; }
  ctx.fillText(sign, W / 2, H - pad * .72 - Math.round(18 * F));
  if (photoBy) { ctx.font = Math.round(16 * F) + 'px ' + sans; ctx.globalAlpha = .7; ctx.fillText('Photo: ' + photoBy + ' / Pexels', W / 2, H - pad * .38); ctx.globalAlpha = 1; }
}
function renderCard() { var sz = CARD_SIZES[S.card.size] || CARD_SIZES.t, cv = document.createElement('canvas'); drawCard(cv, studio, sz[0], sz[1]); try { cardImg = cv.toDataURL('image/png'); } catch (e) { cardImg = null; toast(T('photoBad')); } var box = qs1('#cardPv'); if (box && cardImg) box.innerHTML = '<img src="' + cardImg + '" alt="">'; }
function cardBlob(url) { var b = atob(url.split(',')[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return new Blob([a], { type: 'image/png' }); }
function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function holdSave() { openHSheet('<div class="sheet-title">' + T('holdT') + '</div><div class="hl-tip">' + T('holdS') + '</div><div class="holdpv"><img src="' + cardImg + '" alt=""></div><div class="sheet-acts" style="margin-top:12px"><button class="btn" data-xact="hclose">' + T('close') + '</button></div>'); }
function shareFile() { var f; try { f = new File([cardBlob(cardImg)], '321-card.png', { type: 'image/png' }); } catch (e) { return false; } if (navigator.canShare && navigator.canShare({ files: [f] })) { var p = navigator.share({ files: [f], title: T('appName') }); if (p && p['catch']) p['catch'](function () { }); return true; } return false; }
function cardSave() { if (!cardImg) return; if (isIOS()) { if (!shareFile()) holdSave(); else toast(T('saveIOS')); return; } var a = document.createElement('a'); a.href = cardImg; a.download = '321-card-' + now() + '.png'; document.body.appendChild(a); a.click(); document.body.removeChild(a); toast(T('savedFile')); }
function cardShare() { if (!cardImg) return; if (!shareFile()) cardSave(); }
var px = { q: '', page: 1, items: [], busy: false, end: false };
var PX_PRE = { zh: [['風景', 'landscape'], ['日出', 'sunrise'], ['天空', 'sky'], ['海', 'ocean'], ['山', 'mountain'], ['花', 'flowers'], ['光', 'light rays'], ['樹', 'tree'], ['教堂', 'church'], ['小路', 'path'], ['麥田', 'wheat field'], ['水', 'calm water'], ['雲', 'clouds'], ['晨霧', 'morning mist'], ['星空', 'starry sky'], ['十字架', 'cross'], ['手', 'hands together'], ['餐桌', 'family table']],
  en: [['Landscape', 'landscape'], ['Sunrise', 'sunrise'], ['Sky', 'sky'], ['Ocean', 'ocean'], ['Mountain', 'mountain'], ['Flowers', 'flowers'], ['Light', 'light rays'], ['Tree', 'tree'], ['Church', 'church'], ['Path', 'path'], ['Wheat', 'wheat field'], ['Water', 'calm water'], ['Clouds', 'clouds'], ['Mist', 'morning mist'], ['Stars', 'starry sky'], ['Cross', 'cross'], ['Hands', 'hands together'], ['Table', 'family table']] };
var ZS_PX = { '風景': '风景', '樹': '树', '麥田': '麦田', '雲': '云', '晨霧': '晨雾', '餐桌': '餐桌' };
function pxOrient() { var s = S.card.size; return s === 'w' ? 'landscape' : (s === 's' ? 'square' : 'portrait'); }
function openPexels() {
  var pre = PX_PRE[isEN() ? 'en' : 'zh'], chips = ''; eachA(pre, function (p) { chips += '<button class="chip" data-xact="pxq" data-q="' + esc(p[1]) + '">' + esc(isZS() ? (ZS_PX[p[0]] || p[0]) : p[0]) + '</button>'; });
  openHSheet('<div class="sheet-title">' + T('pexelsT') + '</div><div class="row" style="gap:8px;margin-bottom:10px"><input type="text" id="pxQ" value="' + esc(px.q) + '" placeholder="' + esc(T('pxPH')) + '"><button class="btn sm" data-xact="pxgo">' + T('search') + '</button></div><div class="chips pxchips" style="flex-wrap:wrap">' + chips + '</div><div class="pxgrid" id="pxGrid"></div><div class="sheet-acts2" style="margin-top:12px"><button class="btn sm" data-xact="pxmore" id="pxMore">' + T('more') + '</button><button class="btn sm" data-xact="hclose">' + T('close') + '</button></div><div class="xs muted" style="margin-top:8px">' + T('pxHint') + '</div>');
  pxRun(true);
}
function pxPaint() {
  var g = qs1('#pxGrid'); if (!g) return; if (!px.items.length) { g.innerHTML = '<div class="empty" style="grid-column:1/-1">' + (px.busy ? T('loading') : T('pxNone')) + '</div>'; return; }
  var h = ''; eachA(px.items, function (p, i) { h += '<button class="pxcell" data-xact="pxpick" data-i="' + i + '"><img src="' + esc(p.src && (p.src.tiny || p.src.small) || '') + '" alt="" loading="lazy"><span>' + esc(p.photographer || '') + '</span></button>'; }); g.innerHTML = h;
  var mb = qs1('#pxMore'); if (mb) mb.style.display = px.end ? 'none' : '';
}
function pxRun(reset) {
  if (px.busy) return; px.busy = true; if (reset) { px.page = 1; px.items = []; px.end = false; } pxPaint();
  var q = trim(px.q), url = (q ? 'https://api.pexels.com/v1/search?query=' + encodeURIComponent(q) + '&orientation=' + pxOrient() + '&' : 'https://api.pexels.com/v1/curated?') + 'per_page=24&page=' + px.page;
  ajax('GET', url, null, null, function (st, txt) {
    px.busy = false; if (st !== 200) { toast(T('pxErr') + ' (' + st + ')'); pxPaint(); return; }
    try { var d = JSON.parse(txt), got = d.photos || []; px.items = px.items.concat(got); px.end = got.length < 24; px.page++; } catch (e) { } pxPaint();
  }, { Authorization: PEXELS_KEY });
}
function pxPick(i) {
  var p = px.items[i]; if (!p) return; toast(T('pxLoading')); var url = p.src && (p.src.large2x || p.src.large || p.src.original);
  ajax('GET', url, null, 'blob', function (st, blob) {
    if (st !== 200 || !blob) { toast(T('photoBad')); return; } var u = URL.createObjectURL(blob), im = new Image();
    im.onload = function () { photoImg = im; photoBy = p.photographer || ''; closeHSheet(); studioRender(); toast(T('pxPicked')); }; im.onerror = function () { toast(T('photoBad')); }; im.src = u;
  });
}

