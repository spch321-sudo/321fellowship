/* CPAR321 國度321空中團契版（2026-11-09）：內容頁逐句中英並讀
   繁／简並讀英文、英文並讀繁體中文。英文內容就在 index.html 的 APP_EN（英文介面時疊在 APP_DATA 上）：
   暫時把語言換成另一種、用同一個頁面函式（PAGES[route]）再畫一次，取得另一語言的 HTML，
   兩邊依段落結構（tag+class 簽名，LCS）配對，每一句下面插入另一語言的對應句子（.cps）。
   課文句子已包成畫線單位（.mk-s），插在整個單位後面不切開；其他段落在句尾切文字節點，句子依長度比例對齊。
   另一語言還沒翻譯（仍是中文）的段落不插。朗讀從資料取文字、畫線只認 .mk-s，所以並讀句不會被朗讀或畫線。
   設定存 localStorage cpar321。 */
(function () {
  if (window.CPAR321) return;
  var X = window.X321 && window.X321.cpar;
  if (!X || typeof curLang !== 'function') return;
  var PAGES = X.PAGES;
  var ROUTES = { home: 1, about: 1, concept: 1, equip: 1, lesson: 1, practice: 1, connect: 1, serve: 1, newfriend: 1, invite: 1, family: 1, meet: 1 };
  var origLang = curLang;
  function LN() { var l = origLang(); return l === 'en' ? 'en' : (l === 'zh-Hans' ? 'sc' : 'tc'); }
  function EN() { return LN() === 'en'; }
  var STR = {
    tc: { btn: '中英並讀', on: '開', off: '關' },
    sc: { btn: '中英并读', on: '开', off: '关' },
    en: { btn: 'Chinese parallel', on: 'On', off: 'Off' }
  };
  function T(k) { return STR[LN()][k]; }
  function isOn() { try { return localStorage.getItem('cpar321') === '1'; } catch (e) { return false; } }
  function setOn(v) { try { localStorage.setItem('cpar321', v ? '1' : ''); } catch (e) {} }

  /* 用另一種語言執行一次頁面函式，取得 HTML；語言、資料都會還原 */
  function altHTML(route) {
    var alt = EN() ? 'zh-Hant' : 'en', saveD = X.getD(), out = null;
    var fake = function () { return alt; };
    try {
      window.curLang = fake;
      try { X.setD(X.langData()); } catch (e) {}
      out = PAGES[route]();
    } catch (e) { out = null; }
    finally { window.curLang = origLang; X.setD(saveD); }
    return typeof out === 'string' ? out : null;
  }

  /* ── 段落配對 ── */
  var SEL = 'h1,h2,h3,h4,h5,p,li,blockquote,td,th,dt,dd,.txt,.ref,.motto,.lv-t,.lv-r,.llight,.prayerbox,.pill,.eyebrow';
  var SKIP = '.cps,.cparbar,button,summary,.vact,.quick,.nh-meta,.lnav,.tab,input,textarea,select,.embedwrap,.mk-note,.mk-hint,svg';
  function blocks(root) {
    var all = root.querySelectorAll(SEL), out = [];
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (e.closest(SKIP)) continue;
      var p = e.parentElement, nested = false;
      while (p && p !== root) { if (p.matches && p.matches(SEL)) { nested = true; break; } p = p.parentElement; }
      if (!nested) out.push(e);
    }
    return out;
  }
  function sig(e) { return e.tagName + '.' + (e.className || '').toString().split(/\s+/).filter(function (c) { return c && !/^(on|mk-hl|first)$/.test(c); }).sort().join('.'); }
  function lcs(a, b) {
    var n = a.length, m = b.length, i, j, L = [];
    for (i = 0; i <= n; i++) L.push(new Uint16Array(m + 1));
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var pairs = []; i = 0; j = 0;
    while (i < n && j < m) { if (a[i] === b[j]) { pairs.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
    return pairs;
  }
  function txt(e) {
    var c = e.cloneNode(true), k = c.querySelectorAll('.mk-note,.mk-flag,button,svg,.cps');
    for (var i = 0; i < k.length; i++) k[i].parentNode.removeChild(k[i]);
    return (c.textContent || '').replace(/\s+/g, ' ').trim();
  }
  /* 另一語言真的是那個語言才插（還沒翻譯的課文，英文版其實仍是中文） */
  function altOK(t) {
    var cjk = (t.match(/[㐀-鿿]/g) || []).length, lat = (t.match(/[A-Za-z]/g) || []).length;
    return EN() ? cjk >= 2 : (lat >= 3 && lat > cjk);
  }
  function pairInto(root, html) {
    if (!root || !html) return 0;
    var box = document.createElement('div'); box.innerHTML = html;
    var A = blocks(root), B = blocks(box);
    if (!A.length || !B.length) return 0;
    var n = 0;
    lcs(A.map(sig), B.map(sig)).forEach(function (p) {
      var me = A[p[0]], t1 = txt(me), t2 = txt(B[p[1]]);
      if (!t2 || t1 === t2 || !altOK(t2)) return;
      n += sentPair(me, t2);
    });
    return n;
  }

  /* ── 切句與對齊（與聖經講義版同一套演算法） ── */
  var ZH_END = /[。！？；!?]+(?:[」』”’）)】〕]*)/g, EN_END = /[.!?;](?:["”’)\]]*)(?=\s|$)/g;
  function splitSents(t, zh) {
    t = t.replace(/\s+/g, ' ').trim(); if (!t) return [];
    var re = zh ? /[^。！？；!?]+(?:[。！？；!?]+[」』”’）)】〕]*)?/g : /[^.!?;]+(?:[.!?;]+["”’)\]]*)?(?=\s|$)|[^.!?;]+$/g;
    var out = (t.match(re) || [t]).map(function (x) { return x.trim(); }).filter(Boolean), merged = [];
    out.forEach(function (x) {
      if (merged.length && (x.replace(/[\s\p{P}]/gu, '').length < (zh ? 3 : 6))) merged[merged.length - 1] += (zh ? '' : ' ') + x;
      else merged.push(x);
    });
    return merged;
  }
  function plen(t, zh) { return Math.max(1, zh ? t.replace(/[\s\p{P}]/gu, '').length : t.replace(/\s+/g, ' ').length); }
  function mainBounds(block) {
    var en = EN(), re = en ? EN_END : ZH_END, w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null), node, out = [], acc = '';
    while ((node = w.nextNode())) {
      var pe = node.parentElement;
      if (pe && pe.closest('.cps,.mk-note,.mk-flag,button,svg')) continue;
      var tx = node.nodeValue, m, pos = 0, unit = pe && pe.closest('.mk-s');
      if (unit && !block.contains(unit)) unit = null;
      re.lastIndex = 0;
      while ((m = re.exec(tx))) {
        var end = m.index + m[0].length;
        acc += tx.slice(pos, end); pos = end;
        out.push({ node: node, off: end, unit: unit, text: acc }); acc = '';
      }
      acc += tx.slice(pos);
      if (unit && acc.replace(/\s/g, '') && unit.lastChild === node) { out.push({ node: null, off: 0, unit: unit, text: acc }); acc = ''; }
    }
    if (acc.replace(/\s/g, '')) out.push({ node: null, off: 0, unit: null, text: acc, tail: true });
    var res = [];
    out.forEach(function (b) {
      var last = res[res.length - 1];
      if (last && b.unit && last.unit === b.unit) { last.text += b.text; return; }
      if (b.tail && last && !last.unit && !last.node) { last.text += b.text; return; }
      res.push(b);
    });
    return res;
  }
  function align(ma, al) {
    var en = EN(), M = ma.map(function (t) { return plen(t, !en); }), A2 = al.map(function (t) { return plen(t, en); });
    var sm = M.reduce(function (a, b) { return a + b; }, 0), sa = A2.reduce(function (a, b) { return a + b; }, 0), r = sa / sm;
    var m = M.length, n = A2.length, INF = 1e9, C = [], B = [], i, j;
    for (i = 0; i <= m; i++) { C.push(new Float64Array(n + 1).fill(INF)); B.push(new Array(n + 1)); }
    C[0][0] = 0;
    var moves = [[1, 1, 0], [1, 2, .6], [2, 1, .6], [1, 3, 1.4], [3, 1, 1.4], [2, 2, 1], [1, 0, 3], [0, 1, 3]];
    for (i = 0; i <= m; i++) for (j = 0; j <= n; j++) {
      if (C[i][j] >= INF) continue;
      for (var q = 0; q < moves.length; q++) {
        var mv = moves[q], a = i + mv[0], b = j + mv[1]; if (a > m || b > n) continue;
        var x = 0, y = 0, k; for (k = i; k < a; k++) x += M[k]; for (k = j; k < b; k++) y += A2[k];
        var c = C[i][j] + mv[2] + Math.abs(y - r * x) / Math.sqrt(r * x + y + 1);
        if (c < C[a][b]) { C[a][b] = c; B[a][b] = [i, j]; }
      }
    }
    var groups = []; i = m; j = n;
    while (i > 0 || j > 0) { var p = B[i][j]; if (!p) break; groups.unshift([p[0], i, p[1], j]); i = p[0]; j = p[1]; }
    return groups;
  }
  function mkSpan(t) { var d = document.createElement('span'); d.className = 'cps'; d.setAttribute('lang', EN() ? 'zh-Hant' : 'en'); d.textContent = t; return d; }
  function sentPair(me, altText) {
    var en = EN(), bounds = mainBounds(me), alts = splitSents(altText, en);
    if (!bounds.length || !alts.length) return 0;
    var groups = bounds.length === 1 ? [[0, 1, 0, alts.length]] : align(bounds.map(function (b) { return b.text; }), alts);
    var ins = [];
    groups.forEach(function (g) {
      var t = alts.slice(g[2], g[3]).join(en ? '' : ' ');
      if (!t) return;
      var at = g[1] > g[0] ? g[1] - 1 : Math.max(0, g[0] - 1);
      if (ins.length && ins[ins.length - 1][0] === at) ins[ins.length - 1][1] += (en ? '' : ' ') + t; else ins.push([at, t]);
    });
    for (var k = ins.length - 1; k >= 0; k--) {
      var b = bounds[ins[k][0]], sp = mkSpan(ins[k][1]);
      if (b.unit) {
        var after = b.unit;                               // 畫線單位後面若接著領受旗標／筆記，插在它們後面
        while (after.nextSibling && after.nextSibling.classList && (after.nextSibling.classList.contains('mk-flag') || after.nextSibling.classList.contains('mk-note'))) after = after.nextSibling;
        after.parentNode.insertBefore(sp, after.nextSibling);
      }
      else if (b.node) { var rest = b.node.splitText(b.off); rest.parentNode.insertBefore(sp, rest); }
      else me.appendChild(sp);
    }
    return ins.length;
  }

  function css() {
    if (document.getElementById('cparCss')) return;
    var st = document.createElement('style'); st.id = 'cparCss';
    st.textContent = '.cps{display:block;margin:2px 0 8px;padding:1px 0 1px 9px;border-left:3px solid color-mix(in srgb,var(--gold,#b08a3e) 50%,transparent);font-size:.88em;line-height:1.65;color:inherit;opacity:.72;font-weight:400;font-style:normal;letter-spacing:0;text-transform:none;text-align:left;white-space:normal}'
      + '.verse .cps{border-left-color:rgba(255,255,255,.45)}.pill .cps{border:0;padding:0;margin:2px 0 0}'
      + '.cparbar{display:flex;justify-content:flex-end;margin:0 0 8px}.cparbtn{border:1px solid var(--line,rgba(128,128,128,.35));background:transparent;color:inherit;border-radius:999px;padding:6px 14px;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}'
      + '.cparbtn.on{border-color:var(--gold,#b08a3e);color:var(--gold,#b08a3e)}';
    document.head.appendChild(st);
  }
  function apply(route) {
    var view = document.getElementById('view'); if (!view || !ROUTES[route]) return;
    css();
    var on = isOn(), bar = document.createElement('div'); bar.className = 'cparbar';
    bar.innerHTML = '<button type="button" class="cparbtn' + (on ? ' on' : '') + '">🌐 ' + T('btn') + (EN() ? ': ' : '：') + (on ? T('on') : T('off')) + '</button>';
    bar.firstChild.onclick = function (e) { e.stopPropagation(); window.CPAR321.toggle(); };
    view.insertBefore(bar, view.firstChild);
    if (on) { try { pairInto(view, altHTML(route)); } catch (e) {} }
  }
  X.wrapRender(apply);
  window.CPAR321 = {
    toggle: function () { setOn(!isOn()); try { X.render(X.route()); } catch (e) {} },
    _alt: altHTML
  };
  try { var v0 = document.getElementById('view'); if (v0 && v0.children.length && !v0.querySelector('.cparbar')) apply(X.route()); } catch (e) {}
})();
