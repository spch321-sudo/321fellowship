/* 小智回答：markdown 美編（mdToHtml）、分享／美圖用純文字（mdStrip）、朗讀用口語（mdSpeak）——移植自 321教會生活 ext.js */
function tbRow(x) { return /^\s*\|.*\|\s*$/.test(x); }
function tbSep(x) { return /^\s*\|[\s:|\-]+\|\s*$/.test(x) && x.indexOf('-') >= 0; }
function tbCells(x) { var a = trim(x).replace(/^\||\|$/g, '').split('|'), o = []; eachA(a, function (c) { o.push(trim(c)); }); return o; }
function mdTableMap(src, fmt) {
  var Ls = String(src || '').split('\n'), out = [], i = 0;
  while (i < Ls.length) {
    if (tbRow(Ls[i]) && i + 1 < Ls.length && tbSep(Ls[i + 1])) { var head = tbCells(Ls[i]); i += 2; var rows = []; while (i < Ls.length && tbRow(Ls[i])) { rows.push(tbCells(Ls[i])); i++; } out.push(rows.length ? fmt(head, rows) : head.join(' ')); continue; }
    out.push(Ls[i]); i++;
  }
  return out.join('\n');
}
function mdStrip(x) {
  return trim(mdTableMap(String(x || ''), function (head, rows) { var ls = [], hh = []; eachA(head, function (c) { if (c) hh.push(c); }); if (hh.length) ls.push(hh.join(' → ')); eachA(rows, function (r) { var r2 = []; eachA(r, function (c) { if (c) r2.push(c); }); ls.push('・' + r2.join(' → ')); }); return ls.join('\n'); })
    .replace(/^#{1,6} /gm, '').replace(/\*\*([\s\S]+?)\*\*/g, '$1').replace(/\*([\s\S]+?)\*/g, '$1').replace(/\*/g, '')
    .replace(/^> ?/gm, '').replace(/^---+$/gm, '').replace(/^[-*] /gm, '・').replace(/`+/g, '').replace(/\n{3,}/g, '\n\n'));
}
/* 小智回答說成自然的口語。先把整篇切成區塊、看前後文再決定怎麼帶入：
   小標題輪替「先談／再來看／接下來談／最後談」；條列依內容選方式——短詞併成一句、
   有粗體標籤用「首先是X／再來是X／最後是X」、步驟或編號用「第一、第二」（照原編號，中間隔說明段也不重來）、
   一般句子用「首先／另外／還有／最後」，只有一項就不加；已自帶連接詞不重複。表情符號與出處括號都不唸 */
var NUMZH = ['第一', '第二', '第三', '第四', '第五', '第六', '第七', '第八', '第九', '第十'], NUMEN = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
var CNUM = '一二三四五六七八九十';
function endP(t) { t = trim(t); return !t ? '' : (/[。！？.!?：:」』”]$/.test(t) ? t : t + (isEN() ? '.' : '。')); }
function mdTok(t) {
  var m, b = t.match(/^\*\*([^*]+)\*\*[：:]?$/), u = b ? trim(b[1]) : t;
  if ((m = u.match(/^(\d{1,2})[.、）)．]\s*(.+)$/)) || (m = u.match(/^[（(]?([一二三四五六七八九十])[)）、.．]\s*(.+)$/))) {
    var n = /\d/.test(m[1]) ? +m[1] : CNUM.indexOf(m[1]) + 1; return { k: 'li', n: n, t: m[2], hd: !!b };
  }
  if ((m = t.match(/^(?:[-*+]\s+|・\s*|•\s*)(.+)$/))) return { k: 'li', n: 0, t: m[1] };
  return { k: 'p', t: t };
}
var LEADW = /^(首先|其次|另外|還有|还有|再來|再来|最後|最后|第[一二三四五六七八九十]|一方面|另一方面|同時|同时|此外|所以|因此|First|Second|Third|Also|Next|Finally|Then|Another)/i;
var STEPW = /步驟|步骤|方法|做法|行動|行动|怎麼做|怎么做|如何|操練|操练|練習|练习|(兩|两|二|三|四|五|六|七|幾|几)(個|个|件|點|点|步|方面|種|种)|steps?|ways|how to|practices|things/i;
function mdSpeak(md) {
  var zh = !isEN(), nq = 0, SP = zh ? '' : ' ';
  var src = mdTableMap(String(md || '').replace(/(\d)️?⃣/g, '$1. ').replace(EMOJI_RE, ''), function (head, rows) {
    var out = [zh ? '我們用一個對照來整理。' : 'Let us lay this out side by side.'];
    eachA(rows, function (r, ri) {
      var p = [], lead = trim(r[0] || '');
      for (var j = 1; j < r.length; j++) { var c = trim(r[j] || ''), hd = trim(head[j] || ''); if (c) p.push(hd ? (zh ? hd + '是' + c : hd + ' is ' + c) : c); }
      var pre = rows.length > 1 && ri === rows.length - 1 ? (zh ? '最後，' : 'Finally, ') : '';
      out.push(endP(pre + (lead ? lead + (zh ? '：' : ': ') : '') + p.join(zh ? '，' : '; ')));
    });
    return '\u0001' + out.join('\n\u0001');
  });
  /* 1. 切成區塊 */
  var tk = [];
  eachA(src.split('\n'), function (ln) {
    var t = trim(ln), m;
    if (!t || /^---+$/.test(t)) { tk.push({ k: 'gap' }); return; }
    if (t.charAt(0) === '\u0001') { tk.push({ k: 'raw', t: t.slice(1) }); return; }
    if ((m = t.match(/^#{1,6}\s*(.+)$/))) { tk.push({ k: 'h', t: trim(m[1].replace(/[*_`]/g, '').replace(/[：:]$/, '')) }); return; }
    if ((m = t.match(/^>\s?(.*)$/))) { tk.push({ k: 'q', t: trim(m[1]) }); return; }
    tk.push(mdTok(t));
  });
  /* 2. 小標題：數一般標題，輪替帶入語 */
  var hs = [], i, j;
  for (i = 0; i < tk.length; i++) if (tk[i].k === 'h' && !/想更多|延伸|多想|再想|深思|Think (more|further)|Going deeper|禱告|祷告|Pray/i.test(tk[i].t)) hs.push(i);
  /* 3. 條列分組：中間空行不斷；有編號的清單中間夾說明段也算同一組 */
  var grp = [], cur = null, numG = null, nCnt = 0;
  for (i = 0; i < tk.length; i++) if (tk[i].k === 'li' && tk[i].n) nCnt++;
  for (i = 0; i < tk.length; i++) {
    var x = tk[i];
    if (x.k === 'gap') continue;
    if (x.k === 'h') { cur = numG = null; continue; }
    if (x.k === 'li' && x.n) {
      if (!numG || x.n !== numG.last + 1) { numG = { items: [], intro: introOf(i), num: true }; grp.push(numG); }
      numG.items.push(i); numG.last = x.n; x.g = numG; cur = null; continue;
    }
    if (x.k === 'li') {
      if (!cur || cur.lastI !== prevNonGap(i)) { cur = { items: [], intro: introOf(i), num: false }; grp.push(cur); }
      cur.items.push(i); cur.lastI = i; x.g = cur; continue;
    }
    cur = null;
  }
  function prevNonGap(k) { for (k--; k >= 0; k--) if (tk[k].k !== 'gap') return k; return -1; }
  function introOf(k) { var q = prevNonGap(k); return q >= 0 && tk[q].k !== 'li' ? tk[q].t || '' : ''; }
  eachA(grp, function (g) {
    var n = g.items.length, short = true, lab = 0, scr = 0;
    eachA(g.items, function (k) {
      var t = tk[k].t, plain = mdStrip(t);
      if (plain.length > (zh ? 14 : 48) || /[。！？.!?；;，,]/.test(plain.slice(0, -1))) short = false;
      if (/^\*\*[^*]+\*\*/.test(t) || tk[k].hd) lab++;
      if (/\d+\s*[:：]\s*\d+|[「『“]/.test(t)) scr++;
    });
    g.mode = g.num && nCnt > 1 ? 'ord' : n < 2 ? 'one' : scr === n ? 'plain' : (g.num || STEPW.test(g.intro)) ? 'ord' : lab * 2 >= n ? 'lab' : short ? 'enum' : 'conn';
    g.n = n;
  });
  /* 4. 說出來 */
  var res = [], CZ = ['首先，', '另外，', '還有，', '再來，', '同時，'], CE = ['First, ', 'Also, ', 'Next, ', 'On top of that, ', 'Then, '];
  for (i = 0; i < tk.length; i++) {
    var y = tk[i], t = y.t;
    if (y.k === 'gap') continue;
    if (y.k === 'raw') { res.push(t); continue; }
    if (y.k === 'h') {
      if (/想更多|延伸|多想|再想|深思|Think (more|further)|Going deeper/i.test(t)) res.push(zh ? '如果想更多一點，可以這樣想。' : 'If you want to think further, consider this.');
      else if (/禱告|祷告|Pray/i.test(t)) res.push(zh ? '讓我們一起禱告。' : 'Let us pray together.');
      else {
        var hi = hs.indexOf(i), hl = hs.length, w;
        if (hl === 1) w = zh ? '我們來談「' + t + '」。' : 'Let us talk about ' + t + '.';
        else if (hi === 0) w = zh ? '先談「' + t + '」。' : 'Let us start with ' + t + '.';
        else if (hi === hl - 1 && hl > 2) w = zh ? '最後談「' + t + '」。' : 'Finally, ' + t + '.';
        else w = zh ? ['接下來談「', '再來看「', '我們再看「'][(hi - 1) % 3] + t + '」。' : ['Next, let us look at ', 'Then, ', 'Now consider '][(hi - 1) % 3] + t + '.';
        res.push(w);
      }
      continue;
    }
    if (y.k === 'q') {
      if (!t) continue;
      var sc = /[「『“"]/.test(t) || /\d+\s*[:：]\s*\d+/.test(t);
      res.push((zh ? (sc ? '聖經說：' : (nq++ ? '還有一句：' : '有一句話特別要記住：')) : (sc ? 'Scripture says: ' : (nq++ ? 'And another: ' : 'Here is the line to remember: '))) + endP(t));
      continue;
    }
    if (y.k === 'li' && y.g) {
      var g = y.g, ix = g.items.indexOf(i), last = ix === g.n - 1 && g.n > 1, has = LEADW.test(mdStrip(t));
      if (g.mode === 'enum') {
        if (ix === 0) {
          var ws = []; eachA(g.items, function (k) { ws.push(mdStrip(tk[k].t).replace(/[。.]$/, '')); });
          res.push(endP(zh ? (g.n === 2 ? ws.join('和') : ws.slice(0, -1).join('、') + '，還有' + ws[ws.length - 1]) : (g.n === 2 ? ws.join(' and ') : ws.slice(0, -1).join(', ') + ', and ' + ws[ws.length - 1])));
        }
        continue;
      }
      var pre = '';
      if (!has && g.mode === 'ord') { var on = (y.n || ix + 1) - 1; pre = on < 10 ? (zh ? NUMZH[on] + '，' : NUMEN[on] + ', ') : ''; }
      else if (!has && g.mode === 'lab') {
        var lm = t.match(/^\*\*([^*]+?)\*\*\s*[：:—–-]?\s*(.*)$/) || [0, mdStrip(t), ''];
        var L = trim(lm[1]).replace(/[：:]$/, ''), body = trim(lm[2]);
        res.push(endP((zh ? (ix === 0 ? '首先是' : last ? '最後是' : '再來是') + '「' + L + '」' : (ix === 0 ? 'First, ' : last ? 'Finally, ' : 'Next, ') + L) + (body ? (zh ? '，' : ': ') + body : '')));
        continue;
      }
      else if (!has && g.mode === 'conn') pre = last ? (zh ? '最後，' : 'Finally, ') : (zh ? CZ : CE)[ix % 5];
      res.push(endP(pre + t)); continue;
    }
    res.push(endP(t));
  }
  return mdStrip(res.join('\n'));
}
function mdToHtml(s) {
  var h = esc(s);
  h = mdTableMap(h, function (head, rows) { var t = '\n\n<table class="mdtb"><thead><tr>'; eachA(head, function (c) { t += '<th>' + c + '</th>'; }); t += '</tr></thead><tbody>'; eachA(rows, function (r) { t += '<tr>'; eachA(r, function (c) { t += '<td>' + c + '</td>'; }); t += '</tr>'; }); return t + '</tbody></table>\n\n'; });
  h = h.replace(/^#{5,6} (.*)$/gm, '<h5>$1</h5>').replace(/^#{1,4} (.*)$/gm, '<h4>$1</h4>');
  h = h.replace(/\*\*([\s\S]+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+?)\*/g, '$1<i>$2</i>');
  h = h.replace(/^&gt; ?(.*)$/gm, '<blockquote>$1</blockquote>').replace(/<\/blockquote>\n<blockquote>/g, '<br>');
  h = h.replace(/^---+$/gm, '<hr>');
  h = h.replace(/^(\d+)[.、] (.*)$/gm, '<li class="ol" data-n="$1">$2</li>');
  h = h.replace(/^[-*・] (.*)$/gm, '<li>$1</li>');
  h = h.replace(/((?:<li[^>]*>[\s\S]*?<\/li>\n?)+)/g, function (m) { return (m.indexOf('class="ol"') >= 0 ? '<ol>' : '<ul>') + m.replace(/\n/g, '') + (m.indexOf('class="ol"') >= 0 ? '</ol>' : '</ul>'); });
  h = h.replace(/(\d+:\d+(?:[–-]\d+)?)/g, '<span class="vref">$1</span>');
  var parts = h.split(/\n{2,}/), o = ''; eachA(parts, function (p) { o += /^\s*<(h\d|ul|ol|blockquote|hr|table)/.test(p) ? p : '<p>' + trim(p).replace(/\n/g, '<br>') + '</p>'; }); return o;
}
