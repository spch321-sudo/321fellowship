/* =====================================================================
   小智：markdown 美編、長回答收合、截斷自動接續、追問、回答對象、收藏／分享／美圖／朗讀／複製／刪除
   對話保留最近 60 則（只存在這台裝置）。
   ===================================================================== */
var CHAT_KEY = 'k321_ai_chat', chatSrc = null;
(function () { try { var a = JSON.parse(lsGet(CHAT_KEY) || '[]'); if (a && a.length) aic.msgs = a; } catch (e) { } })();
function chatSave() {
  var keep = []; eachA(aic.msgs, function (m) { if (!m.wait && !m.cont) keep.push(m); });
  if (keep.length > 60) keep = keep.slice(-60);
  try { lsSet(CHAT_KEY, JSON.stringify(keep)); } catch (e) { }
}
var SYS_FMT_ZH = '回答格式：可以用簡短的小標題（####）與條列分段；需要並列或對照時可以用 markdown 表格，畫面會畫成真正的表格、朗讀時會說成自然的句子、分享時會變成清單。請把最重要的那一句用「> 」標成引言，那一句會被做成美圖。小標題要短。不要用 ASCII 圖案、程式碼區塊或唸不出來的裝飾符號。若寫到禱告，結尾一律用「奉主耶穌的名禱告，阿們」。';
var SYS_FMT_EN = 'Format: you may use short headings (####) and bullet lists; use a markdown table for side-by-side comparisons (it is drawn as a real table, read aloud as natural sentences and shared as a list). Mark the single most important sentence as a quote with "> " — it becomes the picture card. Keep headings short. No ASCII art, code blocks or unpronounceable decorations. If you write a prayer, always end with "in the name of the Lord Jesus we pray, Amen."';
var _aicSystem0 = aicSystem;
aicSystem = function () {
  var s = _aicSystem0();
  s = s.replace(/不要使用 Markdown 語法[^\n]*/, isEN() ? SYS_FMT_EN : f9(SYS_FMT_ZH, ''));
  s += '\n\n' + (isEN() ? 'Audience:' : f9('【回答對象】', '')) + AUD_SYS();
  if (isZS()) s += '\n请一律用简体中文回答。';
  return s;
};
function msgLong(m) { return m && m.role !== 'user' && !m.wait && !m.cont && mdStrip(m.text || '').length > (isEN() ? 420 : 200); }
function foldOld() { for (var k = 0; k < aic.msgs.length - 1; k++) if (msgLong(aic.msgs[k])) aic.msgs[k].fold = true; }
function msgFold(i) {
  var m = aic.msgs[i]; if (!m) return; m.fold = !m.fold; chatSave();
  var el = document.getElementById('msg' + i); if (!el) { renderAIC(); return; }
  el.className = 'aic-msg aic-ai' + (m.fold ? ' fold' : '');
  var b = el.querySelector('.msg-more'); if (b) b.textContent = T(m.fold ? 'foldMore' : 'foldLess');
  if (m.fold) { try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { } }
}
function foldAll() {
  var n = 0; eachA(aic.msgs, function (m) { if (msgLong(m) && !m.fold) { m.fold = true; n++; } });
  chatSave(); renderAIC(); toast(T(n ? 'foldedAll' : 'foldNone'));
}
var QBANK_ADULT = {
  zh: ['神是怎樣的神？請從這一課（或今天的經文）說給我聽。', '我身上「舊人有己」的生命，最常在哪裡露出來？', '如果今天真的「讓耶穌作王」，我會怎麼做？', '耶穌的榜樣，在這件事上會怎麼做？', '聖靈今天可能引導我走的一小步是什麼？', '我常失敗的根源是驕傲還是恐懼？怎麼分辨？', '這個星期我可以怎樣操練「無己」？', '這個真理可以用在我和誰的關係上？', '這和主禱文「願你的國降臨」有什麼關聯？', '請用一個比喻，說明這一課最核心的真理。'],
  en: ['What is God like? Show me from this lesson (or today’s verse).', 'Where does my old, self-centred life show up most?', 'If I truly let Jesus be King today, what would I do?', 'What would Jesus’ example look like in this situation?', 'What small step might the Holy Spirit be leading me to take today?', 'Is the root of my failures pride or fear? How can I tell?', 'How can I practise a selfless life this week?', 'Which relationship of mine does this truth speak to?', 'How does this connect with “Your kingdom come” in the Lord’s Prayer?', 'Explain the core truth of this lesson with one picture or parable.']
};
function qbankNow() {
  if (S.aud === 'adult') return isEN() ? QBANK_ADULT.en : (isZS() ? QBANK_ADULT.zh.map(toSimp) : QBANK_ADULT.zh);
  var a = AUD.qbank[S.aud]; return (a && (a[L()] || a.zh)) || QBANK_ADULT.zh;
}
function fuList() { var b = AUD.fu[L()] || AUD.fu.zh; return b[S.aud] || []; }
function cardText(md) {
  var LIM = isEN() ? 300 : 140, raw = String(md || ''), m = raw.match(/^> ?(.+)$/m);
  if (m) { var q = mdStrip(m[1]); if (q.length >= 16 && q.length <= LIM + 60) return q; }
  var lines = mdStrip(raw).split('\n'), body = []; eachA(lines, function (l) { if (trim(l) && !/^・/.test(trim(l))) body.push(trim(l)); });
  var b = body.join(isEN() ? ' ' : '');
  if (b.length <= LIM) return b;
  var cut = b.slice(0, LIM), k = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('！'), cut.lastIndexOf('. '));
  return (k > 40 ? cut.slice(0, k + 1) : cut) + '…';
}
function msgShare(i) {
  var m = aic.msgs[i]; if (!m) return; var src = m.src;
  var head = src ? Q(src.t) + '\n—— ' + src.ref + '\n\n' : '';
  shareText(head + mdStrip(m.text) + '\n\n—— ' + T('fellowshipName') + '\n' + appShareUrl());
}
function cutOff(d, t) {
  var sr = d && (d.stop_reason || d.finish_reason || (d.choices && d.choices[0] && d.choices[0].finish_reason));
  if (sr) return { sure: sr === 'max_tokens' || sr === 'length' };
  t = trim(mdStrip(t)); return { guess: t.length > 300 && !/[。！？.!?」』”)）們men]$/.test(t) };
}
function joinCont(a, b) {
  b = String(b).replace(/^\s*(好的|好|接續|繼續|继续|接着|接著|Continuing|Sure)[，,:：。.!！]?\s*/, '');
  for (var n = Math.min(80, a.length, b.length); n >= 6; n--) if (a.slice(-n) === b.slice(0, n)) return a + b.slice(n);
  var nl = /^(#|>|-|\*|\d+[.、]|\|)/.test(trim(b)) && !/\n$/.test(a);
  return a + (nl ? '\n\n' : (/^(-|\*|\d+[.、]|\|)/.test(trim(b)) ? '\n' : '')) + b;
}
function extractReply(d) {
  if (!d) return ''; if (typeof d === 'string') return d; var t = '';
  if (d.content && d.content.length) { for (var i = 0; i < d.content.length; i++) if (d.content[i].type === 'text' || d.content[i].text) t += d.content[i].text || ''; if (t) return t; }
  return d.reply || d.text || d.message || (d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '') || '';
}
function sendChat(text, src) {
  text = trim(text); if (!text || aic.busy) return;
  aic.favView = false;
  if (navigator.onLine === false) { aic.msgs.push({ role: 'user', text: text }); aic.msgs.push({ role: 'assistant', text: t('aiOffline') }); chatSave(); renderAIC(); aicScrollBottom(); return; }
  src = src || chatSrc; chatSrc = null;
  aic.msgs.push({ role: 'user', text: text, src: src || null });
  var last = { role: 'assistant', text: '', wait: true, src: src || null };
  aic.msgs.push(last); if (aic.msgs.length > 60) aic.msgs = aic.msgs.slice(-60);
  aic.busy = true; BUSY = true; renderAIC(); aicScrollBottom();
  try { k3track('ai_ask'); } catch (e) { }
  var msgs = []; eachA(aic.msgs, function (m) { if (!m.wait && m.text && !m.err) msgs.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }); });
  msgs = msgs.slice(-12); while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  var acc = '', sys = aicSystem(), guessed = 0;
  function done(r, st) {
    last.wait = false; last.cont = false; foldOld(); last.fold = false;
    if (r) { last.text = r; last.ok = true; } else { last.text = T('chatErr') + (st ? '（' + (st > 0 ? 'http ' + st : (st < 0 ? 'timeout' : 'network')) + '）' : ''); last.err = true; }
    aic.busy = false; BUSY = BUSY_OTHER(); chatSave();
    if (aic.open) { renderAIC(); var el = document.getElementById('msg' + (aic.msgs.length - 1)); if (el) try { el.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) { } }
    else toast(T('xzReplied'));
    updIdle();
  }
  (function round(k) {
    var ms = msgs.slice(); if (k) { ms.push({ role: 'assistant', content: acc }); ms.push({ role: 'user', content: T('xzGoOn') }); }
    var payload = { model: SVC.model, max_tokens: 1600, system: sys, messages: ms };
    (function attempt(n) {
      ajax('POST', SVC.xz, payload, null, function (st, txt) {
        var r = '', d = null;
        if (st === 200) { try { d = JSON.parse(txt); r = extractReply(d); } catch (e) { r = txt; } }
        if (!r && n < 2) { setTimeout(function () { attempt(n + 1); }, 900 * (n + 1)); return; }
        if (!r) { done(acc, acc ? 0 : st); return; }
        acc = k ? joinCont(acc, r) : r;
        var c = cutOff(d, acc);
        if ((c.sure && k < 4) || (c.guess && !guessed && k < 4)) {
          if (c.guess) guessed = 1;
          last.wait = false; last.cont = true; last.text = acc; if (aic.open) { renderAIC(); }
          round(k + 1); return;
        }
        done(acc, st);
      }, null, 60000);
    })(0);
  })(0);
}
function openXz(q, src) { aic.open = true; renderAIC(); if (q) sendChat(q, src); setTimeout(aicScrollBottom, 60); }

renderAIC = function () {
  var host = document.getElementById('aicHost'); if (!host) return;
  if (!aicEnabled()) { host.innerHTML = ''; return; }
  var keepTa = document.getElementById('aic-input'), draft = keepTa ? keepTa.value : '';
  var box = document.getElementById('aic-msgs'), keepY = box ? box.scrollTop : null;
  var fabBottom = (CUR_ROUTE === 'lesson') ? '150px' : '96px', pos = aic._pos;
  var fabStyle = pos ? ('left:' + pos.x + 'px;top:' + pos.y + 'px;right:auto;bottom:auto') : ('bottom:' + fabBottom);
  var html = '<button class="aic-fab" style="' + fabStyle + '" onclick="if(!window.__aicJustDragged)aicOpen()"><span class="aic-fab-ic">✨</span><span class="aic-fab-tx">' + esc(t('aiName')) + '</span></button>';
  if (aic.open) {
    var intro = (CUR_ROUTE === 'lesson' && LESSON_NO) ? t('aiIntroLesson', { n: LESSON_NO }) : t('aiIntroHome'), mh = '';
    if (aic.favView) mh = aicFavsHTML();
    else {
      mh = '<div class="aic-msg aic-ai"><div class="aic-bubble">' + esc(intro) + '</div></div>';
      if (CUR_ROUTE === 'lesson' && LESSON_NO) { var LL = lessonFromCache(LESSON_NO); if (LL) mh += '<div class="chatctx">' + esc(T('xzCtxChip', f9('第' + LESSON_NO + '課 ', 'Lesson ' + LESSON_NO + ' ') + lessonTitleOf(LESSON_NO, LL.title))) + '</div>'; }
      var lastI = aic.msgs.length - 1;
      eachA(aic.msgs, function (m, i) {
        if (m.role === 'user') { mh += '<div class="aic-msg me"><div class="aic-bubble">' + (m.src ? '<div class="msrc">' + esc(Q(m.src.t)) + '</div>' : '') + esc(m.text).split('\n').join('<br>') + '</div></div>'; return; }
        var lg = msgLong(m), fd = lg && m.fold;
        mh += '<div class="aic-msg aic-ai' + (fd ? ' fold' : '') + '" id="msg' + i + '"><div class="aic-bubble"><div class="msg-body">' +
          (m.wait ? '<span class="aic-typing"><span></span><span></span><span></span></span> ' + esc(T('thinking')) : mdToHtml(m.text)) +
          (m.cont ? '<p class="xs"><span class="aic-typing"><span></span><span></span><span></span></span> ' + esc(T('xzCont')) + '</p>' : '') + '</div>' +
          (lg ? '<button class="msg-more" data-xact="msgfold" data-i="' + i + '">' + esc(T(fd ? 'foldMore' : 'foldLess')) + '</button>' : '');
        if (!m.wait && !m.cont && !m.err) {
          var q = (i > 0 && aic.msgs[i - 1] && aic.msgs[i - 1].role === 'user') ? aic.msgs[i - 1].text : '';
          var fav = aicIsFav(q, m.text);
          mh += '<div class="msg-actions"><button class="msg-act' + (fav ? ' on' : '') + '" data-xact="msgfav" data-i="' + i + '">★ ' + esc(fav ? T('favOn') : T('favB')) + '</button>' +
            '<button class="msg-act" data-xact="msgshare" data-i="' + i + '">↗ ' + esc(T('share')) + '</button>' +
            '<button class="msg-act" data-xact="msgcard" data-i="' + i + '">🖼 ' + esc(T('makeCard')) + '</button>' +
            '<button class="msg-act" data-xact="msgcopy" data-i="' + i + '">⧉ ' + esc(T('copy')) + '</button>' +
            '<button class="msg-act" data-xact="msgtts" data-i="' + i + '">🔊 ' + esc(T('readThis')) + '</button>' +
            '<button class="msg-act" data-xact="msgdel" data-i="' + i + '">✕</button></div>';
          if (m.ok && i === lastI && !aic.busy) {
            var fl = fuList();
            if (fl.length) { mh += '<div class="fu-row"><span class="fu-t">' + esc(T('fuT')) + '</span>'; eachA(fl, function (x) { mh += '<button class="fu-chip" data-xact="fuq" data-q="' + esc(x[2]) + '">' + x[0] + ' ' + esc(x[1]) + '</button>'; }); mh += '</div>'; }
          }
        }
        mh += '</div></div>';
      });
      if (!aic.busy) {
        var topics = aicTopics();
        var picker = function (label) {
          var h = '<div class="aic-cat-label">' + esc(label) + '</div><div class="aic-cats">' + topics.map(function (tp, ci) { return '<button class="aic-cat' + (aic.topic === ci ? ' active' : '') + '" onclick="aicTopic(' + ci + ')">' + esc(tp.c) + '</button>'; }).join('') + '</div>';
          if (aic.topic >= 0 && topics[aic.topic]) h += '<div class="aic-quicks aic-topic-qs">' + topics[aic.topic].qs.map(function (q2, qi) { return '<button class="aic-quick" onclick="aicTopicAsk(' + aic.topic + ',' + qi + ')">' + esc(q2) + '</button>'; }).join('') + '</div>';
          return h;
        };
        var ex = '<button class="qs-toggle" data-xact="qstog">💡 ' + esc(T('xzExamples')) + '</button><div class="aic-quicks qs-panel" id="qsPanel"' + (aic.msgs.length ? ' style="display:none"' : '') + '>' + qbankNow().map(function (q3) { return '<button class="aic-quick" data-xact="chatq">' + esc(q3) + '</button>'; }).join('') + '</div>';
        if (!aic.msgs.length) mh += '<div class="aic-quicks">' + aicQuicks().map(function (q4, qi) { return '<button class="aic-quick" onclick="aicQuick(' + qi + ')">' + esc(q4) + '</button>'; }).join('') + '</div>' + ex + picker(t('aiTopicLabel'));
        else mh += '<div class="aic-home-sep">' + esc(t('aiHomeSep')) + '</div>' + ex + picker(t('aiTopicLabel2'));
      }
    }
    html += '<div class="aic-overlay"><div class="aic-sheet">' +
      '<div class="aic-head"><div class="aic-head-l"><span class="aic-ava">✨</span><div><div class="aic-name">' + esc(t('aiName')) + '</div><div class="aic-role">' + esc(t('aiRole')) + '</div></div></div>' +
      '<div class="aic-head-r"><button class="aic-hbtn txt" data-xact="chatfoldall" title="' + esc(T('foldAll')) + '">' + esc(T('foldAllB')) + '</button>' +
      '<button class="aic-hbtn" onclick="aicToggleFavs()" aria-label="favorites">⭐</button><button class="aic-hbtn" onclick="aicClearAll()" aria-label="new">🏠</button><button class="aic-x" onclick="aicClose()">✕</button></div></div>' +
      '<div class="aic-aud">' + audBar('chat') + '</div>' +
      '<div class="aic-msgs" id="aic-msgs">' + mh + '</div>' +
      '<div class="aic-foot"><textarea id="aic-input" class="aic-input" rows="1" placeholder="' + esc(t('aiPlaceholder')) + '"></textarea><button class="aic-send" onclick="aicSend()">' + esc(t('aiSend')) + '</button></div>' +
      '<div class="aic-note">' + esc(t('aiNote')) + '</div></div></div>';
  }
  host.innerHTML = html;
  simpifyEl(host);
  var fab = host.querySelector('.aic-fab'); if (fab) attachAicDrag(fab);
  var ta = document.getElementById('aic-input');
  if (ta) {
    ta.value = draft;
    ta.onkeydown = function (e) { if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey && !e.isComposing) { e.preventDefault(); aicSend(); } };
    ta.oninput = function () { ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px'; };
  }
  var nb = document.getElementById('aic-msgs'); if (nb && keepY != null) nb.scrollTop = keepY;
  paintSay();
};
window.aicSend = function () { var i = document.getElementById('aic-input'); if (!i) return; var v = trim(i.value); if (!v || aic.busy) return; i.value = ''; sendChat(v); };
window.aicQuick = function (idx) { var q = aicQuicks()[idx]; if (q) sendChat(q); };
window.aicTopicAsk = function (ci, qi) { var tp = aicTopics(); var q = tp[ci] && tp[ci].qs[qi]; if (!q) return; aic.topic = -1; sendChat(q); };
window.aicOpen = function () { aic.open = true; renderAIC(); aicScrollBottom(); };
window.aicClose = function () { aic.open = false; if (sayKey && /^m\d/.test(sayKey)) stopAll(); renderAIC(); };
window.aicClearAll = function () {
  if (aic.msgs.length && !window.confirm(t('aiClearConfirm'))) return;
  if (sayKey) stopAll(); aic.msgs = []; aic.topic = -1; aic.favView = false; chatSave(); renderAIC();
};
aicFavsHTML = function () {
  var F = aicFavs();
  var h = '<div class="aic-favs-head"><button class="aic-back-chat" onclick="aicToggleFavs()">' + esc(t('aiBackChat')) + '</button><div class="aic-favs-title">⭐ ' + esc(t('aiFavs')) + '（' + F.length + '）</div></div>';
  if (!F.length) return h + '<div class="aic-favs-empty">' + t('aiFavsEmpty') + '</div>';
  eachA(F, function (f, i) {
    h += '<div class="aic-fav-card">' + (f.q ? '<div class="aic-fav-q">' + esc(f.q) + '</div>' : '') + '<div class="aic-fav-a msg-body">' + mdToHtml(f.a) + '</div>' +
      '<div class="msg-actions"><button class="msg-act" data-xact="favtts" data-i="' + i + '">🔊</button><button class="msg-act" data-xact="favcard" data-i="' + i + '">🖼 ' + esc(T('makeCard')) + '</button><button class="msg-act" data-xact="favshare" data-i="' + i + '">↗ ' + esc(T('share')) + '</button><button class="msg-act" data-xact="favdel" data-i="' + i + '">✕</button></div></div>';
  });
  return h;
};
window.aicFav = function (mi) {
  var m = aic.msgs[mi]; if (!m) return;
  var q = (mi > 0 && aic.msgs[mi - 1] && aic.msgs[mi - 1].role === 'user') ? aic.msgs[mi - 1].text : '', a = m.text || '';
  var F = aicFavs(), sig = aicFavSig(q, a), idx = -1;
  for (var k = 0; k < F.length; k++) if (aicFavSig(F[k].q, F[k].a) === sig) { idx = k; break; }
  if (idx >= 0) { F.splice(idx, 1); toast(T('favRemoved')); } else { F.unshift({ q: q, a: a, t: now() }); toast(T('favSaved')); }
  aicSaveFavs(F); renderAIC();
};
function msgDelete(i) {
  if (!aic.msgs[i]) return; if (sayKey) stopAll();
  if (!window.confirm(t('aiDelConfirm'))) return;
  var from = i, cnt = 1; if (i > 0 && aic.msgs[i - 1] && aic.msgs[i - 1].role === 'user') { from = i - 1; cnt = 2; }
  aic.msgs.splice(from, cnt); chatSave(); renderAIC();
}
