/* =====================================================================
   讀經樂：小智依課文現場出題——測驗（5 題單選）與猜謎（4 題、三個提示），錯題本（離線可複習）、最佳成績
   課程獎章：一個單元的每一課都標記「讀完」就跳出動畫獎章，單元卡上留下 🏅
   ===================================================================== */
var PL_QN = 5, PL_RN = 4, PL = null, PL_SRC = 'cur';
function lessonPlain(no, max) {
  var L1 = ensureLesson(no); if (!L1) return '';
  var P = [], cl = function (x) { return trim(String(x || '').replace(/\s+/g, ' ')); };
  P.push(f9('第' + no + '課：', 'Lesson ' + no + ': ') + cl(lessonTitleOf(no, L1.title)));
  if (L1.scripture && L1.scripture.text) P.push(f9('主題經文', 'Key verse') + '（' + cl(L1.scripture.ref) + '）：' + cl(L1.scripture.text));
  eachA(L1.blocks || [], function (b) { if (b && b.v) P.push(b.t === 'h' ? '【' + cl(b.v) + '】' : cl(b.v)); });
  if (L1.practices && L1.practices.length) P.push(f9('生活應用操練：', 'Practice: ') + L1.practices.map(cl).join('；'));
  if (L1.declaration) P.push(f9('信心宣告：', 'Declaration: ') + cl(L1.declaration));
  var s = P.join('\n'); max = max || 3600;
  if (s.length > max) { var st = Math.floor(Math.random() * (s.length - max)); s = P[0] + '\n…' + s.slice(st, st + max) + '…'; }
  return s;
}
function plLastLesson() { return LESSON_NO || +(lsGet('k321_x_lastlesson') || 0) || 1; }
function plResolve() {
  if (PL_SRC === 'rand') { var m = readMap(), a = []; for (var k in m) if (m[k]) a.push(+k); if (!a.length) a = allLessonNos(); return a[Math.floor(Math.random() * a.length)] || 1; }
  return plLastLesson();
}
function plSysQuiz() {
  var lang = isEN() ? 'Write in English.' : (isZS() ? '请用简体中文。' : '請用繁體中文。');
  if (isEN()) return 'You are a Bible teacher writing a quiz for a discipleship app. From the lesson text the user gives you, write ' + PL_QN + ' single-answer multiple-choice questions, each with exactly 4 options and exactly one correct option. Questions must be clear and unambiguous, and every answer must be found directly in the lesson — do not go beyond it, no obscure trivia or guessing. Order from easy to harder, covering the main truths, the key verse, who God is, and one or two life applications. Each question asks one thing. Each explanation is one short sentence saying why. "v" names where the answer is (e.g. the heading or the key verse). ' + PL_STYLE() + ' ' + lang + ' Reply with JSON ONLY — no explanation, no markdown fence: {"q":[{"q":"question","o":["option","option","option","option"],"a":index of the correct option from 0,"e":"one-sentence explanation","v":"where"}]}';
  return f9('你是聖經教師，替門徒訓練App出測驗題。依使用者提供的課文，出 ' + PL_QN + ' 題單選題，每題剛好 4 個選項、只有一個正確。題目要清楚明確、一看就懂、針對這一課的重點；答案必須能直接從課文找到，不可超出課文，不要考冷僻細節或要靠猜的題；由易到難，涵蓋主要真理、主題經文、神是怎樣的神，並有一兩題生命應用；每題只問一件事。解析用一句話（30字內）說明為什麼。v 寫出答案在課文的哪裡（例如小標題或主題經文）。', '') + PL_STYLE() + lang + f9('只回傳 JSON，不要任何說明、不要 markdown 圍欄：{"q":[{"q":"題目","o":["選項","選項","選項","選項"],"a":正確選項的序號（從0開始）,"e":"一句解析","v":"出處"}]}', '');
}
function plSysRiddle() {
  var lang = isEN() ? 'Write in English.' : (isZS() ? '请用简体中文。' : '請用繁體中文。');
  if (isEN()) return 'You write Bible riddles for a discipleship app. From the lesson text the user gives you, write ' + PL_RN + ' riddles. Each answer is a person, place, object, key word or event that appears in the lesson (1–4 words). Give exactly three hints: hint 1 is subtle and never contains the answer, hint 2 is clearer, hint 3 is the clearest but still does not say the answer. "alt" lists other acceptable answers, "v" says where it is in the lesson, "e" is one sentence of insight shown after it is solved. ' + PL_STYLE() + ' ' + lang + ' Reply with JSON ONLY: {"r":[{"h":["hint1","hint2","hint3"],"a":"answer","alt":[],"v":"where","e":"insight"}]}';
  return f9('你替門徒訓練App出聖經猜謎。依使用者提供的課文，出 ' + PL_RN + ' 題謎語，答案是課文裡出現的人、地、物、關鍵字詞或事件（1–4 個字）。每題剛好三個提示：第一個隱晦、絕不含答案，第二個中等，第三個最明確但仍不說出答案。alt 列出其他可接受的說法，v 寫出在課文的哪裡，e 是猜中後的一句領受。', '') + PL_STYLE() + lang + f9('只回傳 JSON：{"r":[{"h":["提示一","提示二","提示三"],"a":"答案","alt":[],"v":"出處","e":"一句領受"}]}', '');
}
function plParse(txt) {
  var s = String(txt || '').replace(/```(?:json)?/g, ''), a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a < 0) return null; if (b > a) { try { return JSON.parse(s.slice(a, b + 1)); } catch (e) { } }
  /* 被截斷：盡量救回已完整的題目 */
  var body = s.slice(a), cut = body.lastIndexOf('},');
  while (cut > 0) { try { return JSON.parse(body.slice(0, cut + 1) + ']}'); } catch (e) { cut = body.lastIndexOf('},', cut - 1); } }
  return null;
}
function plShuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
function plNormQuiz(d) {
  var out = []; eachA((d && d.q) || [], function (x) {
    if (!x || !x.q || !x.o || x.o.length < 2 || !(x.a >= 0 && x.a < x.o.length)) return;
    var ok = x.o[x.a], opts = plShuffle(x.o.slice(0, 4).map(String)); if (opts.indexOf(String(ok)) < 0) { opts[0] = String(ok); plShuffle(opts); }
    out.push({ q: String(x.q), o: opts, a: opts.indexOf(String(ok)), e: String(x.e || ''), v: String(x.v || '') });
  });
  return out.slice(0, PL_QN);
}
function plNormRiddle(d) {
  var out = []; eachA((d && d.r) || [], function (x) {
    if (!x || !x.a || !x.h || !x.h.length) return;
    out.push({ h: x.h.slice(0, 3).map(String), a: String(x.a), alt: (x.alt || []).map(String), v: String(x.v || ''), e: String(x.e || '') });
  });
  return out.slice(0, PL_RN);
}
function plNorm(s) { return String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[\s.,，。、！？!?「」『』“”"'：:；;（）()\-–—]/g, ''); }
function plMatch(g, r) {
  var x = plNorm(g); if (!x) return false; var c = [r.a].concat(r.alt || []);
  for (var i = 0; i < c.length; i++) { var y = plNorm(c[i]); if (!y) continue; if (x === y) return true; if (x.length >= 2 && y.length >= 2 && (x.indexOf(y) >= 0 || y.indexOf(x) >= 0)) return true; if (isZS() && plNorm(toSimp(c[i])) === x) return true; }
  return false;
}
function plStart(mode) {
  if (mode === 'wrong') {
    if (!S.quizWrong.length) { toast(T('plNoWrong')); return; }
    PL = { mode: 'wrong', qs: S.quizWrong.slice(0, 10).map(function (w) { return { q: w.q, o: w.o, a: w.a, e: w.e, v: w.v, id: w.id }; }), i: 0, right: 0, picked: -1, no: 0 };
    BUSY = true; render('play'); return;
  }
  var no = plResolve(), txt = lessonPlain(no);
  if (!txt) { toast(T('plNoLesson')); return; }
  if (navigator.onLine === false) { toast(T('plOffline')); return; }
  PL = { mode: mode, loading: true, no: no, i: 0, right: 0, picked: -1, hints: 1, tries: 0, solved: false, score: 0, max: 0 };
  BUSY = true; render('play');
  var my = PL, sys = mode === 'quiz' ? plSysQuiz() : plSysRiddle();
  (function attempt(n) {
    ajax('POST', SVC.xz, { model: SVC.model, max_tokens: 2400, system: sys, messages: [{ role: 'user', content: txt }] }, null, function (st, resp) {
      if (my !== PL) return;
      var d = null; if (st === 200) { try { d = plParse(extractReply(JSON.parse(resp))); } catch (e) { d = null; } }
      var items = d ? (mode === 'quiz' ? plNormQuiz(d) : plNormRiddle(d)) : [];
      if (items.length < 2 && n < 2) { setTimeout(function () { attempt(n + 1); }, 900 * (n + 1)); return; }
      if (!items.length) { PL = null; BUSY = BUSY_OTHER(); toast(T('plFail') + (st && st !== 200 ? '（http ' + st + '）' : '')); render('play'); return; }
      PL.loading = false; if (mode === 'quiz') PL.qs = items; else { PL.rs = items; PL.max = items.length * 3; }
      if (currentRoute() === 'play') render('play');
    }, null, 70000);
  })(0);
}
function plAddWrong(q) {
  var id = plNorm(q.q).slice(0, 40); for (var i = 0; i < S.quizWrong.length; i++) if (S.quizWrong[i].id === id) return;
  S.quizWrong.unshift({ id: id, q: q.q, o: q.o, a: q.a, e: q.e, v: q.v, no: PL.no, lang: L(), ts: now() });
  if (S.quizWrong.length > 100) S.quizWrong.length = 100; save();
}
function plPick(k) {
  if (!PL || PL.picked >= 0) return; var q = PL.qs[PL.i]; PL.picked = k;
  if (k === q.a) { PL.right++; if (PL.mode === 'wrong') { S.quizWrong = S.quizWrong.filter(function (w) { return w.id !== q.id; }); save(); } }
  else if (PL.mode !== 'wrong') plAddWrong(q);
  render('play');
}
function plNext() {
  if (!PL) return; PL.i++; PL.picked = -1; PL.hints = 1; PL.tries = 0; PL.solved = false; PL.gave = false;
  var tot = PL.mode === 'riddle' ? PL.rs.length : PL.qs.length;
  if (PL.i >= tot) plFinish(); else render('play');
}
function plGuess() {
  var inp = document.getElementById('plIn'), r = PL.rs[PL.i]; if (!inp || PL.solved) return;
  var g = trim(inp.value); if (!g) return;
  if (plMatch(g, r)) { PL.solved = true; PL.score += Math.max(1, 4 - PL.hints); toast(T('plRight')); }
  else { PL.tries++; if (PL.hints < 3) { PL.hints++; toast(T('plMoreHint')); } else { PL.solved = true; PL.gave = true; } }
  render('play');
}
function plFinish() {
  var pct = PL.mode === 'riddle' ? Math.round(PL.score * 100 / Math.max(1, PL.max)) : Math.round(PL.right * 100 / Math.max(1, PL.qs.length));
  if (PL.mode !== 'wrong') {
    S.play.total += (PL.mode === 'quiz' ? PL.qs.length : PL.rs.length); S.play.right += (PL.mode === 'quiz' ? PL.right : PL.score);
    PL.best = pct > (S.play.best[PL.mode] || 0) && pct > 0; if (PL.best) S.play.best[PL.mode] = pct; save();
  }
  PL.done = true; PL.pct = pct; BUSY = BUSY_OTHER(); render('play'); updIdle();
}
function plResultMsg(pct) {
  var k = pct >= 90 ? 2 : (pct >= 60 ? 1 : 0);
  if (S.aud === 'seeker') return audL().skres[k];
  var r2 = AUD.res2 && AUD.res2[L()] && AUD.res2[L()][S.aud]; if (r2) return r2[k];
  return T(['plRes0', 'plRes1', 'plRes2'][k] + (S.aud === 'kid' ? 'k' : (S.aud === 'teen' ? 't' : '')));
}
function playPage() {
  var h = pageHead(f9('讀經樂', 'PLAY & LEARN'), f9('考考我這一課', 'Quiz Me on the Lesson'), T('plSub'));
  if (!PL) {
    var no = plLastLesson(), L1 = ensureLesson(no);
    h += '<div class="card"><p class="eyebrow">' + esc(T('audT')) + '</p>' + audBar('play') + '</div>';
    h += '<div class="card"><p class="eyebrow">' + esc(T('plSrcT')) + '</p>' + chipRow('plsrc', [['cur', T('plSrcCur') + (L1 ? f9('（第' + no + '課）', ' (Lesson ' + no + ')') : '')], ['rand', T('plSrcRand')]], PL_SRC) + '</div>';
    h += '<div class="plgrid"><button class="plbig" data-xact="plgo" data-m="quiz"><span>🎯</span><b>' + esc(T('plQuiz')) + '</b><i>' + esc(T('plQuizD')) + '</i></button>' +
      '<button class="plbig" data-xact="plgo" data-m="riddle"><span>🧩</span><b>' + esc(T('plRiddle')) + '</b><i>' + esc(T('plRiddleD')) + '</i></button>' +
      '<button class="plbig" data-xact="plgo" data-m="wrong"><span>📒</span><b>' + esc(T('plWrong')) + '（' + S.quizWrong.length + '）</b><i>' + esc(T('plWrongD')) + '</i></button></div>';
    h += '<p class="note center">' + esc(T('plBest', S.play.best.quiz || 0, S.play.best.riddle || 0)) + '</p>';
    return h;
  }
  if (PL.loading) return h + '<div class="card center"><div class="aic-typing" style="justify-content:center"><span></span><span></span><span></span></div><p class="note">' + esc(T('plMaking', f9('第' + PL.no + '課', 'Lesson ' + PL.no))) + '</p><button class="xbtn" data-xact="plquit">' + esc(T('cancel')) + '</button></div>';
  if (PL.done) {
    var stars = PL.pct >= 90 ? 3 : (PL.pct >= 60 ? 2 : 1), st = '';
    for (var s = 0; s < 3; s++) st += s < stars ? '⭐' : '☆';
    return h + '<div class="card center plres"><div class="plstars">' + st + '</div><div class="plpct">' + PL.pct + '%</div>' + (PL.best ? '<div class="plnew">🎉 ' + esc(T('plNewBest')) + '</div>' : '') + '<p>' + esc(plResultMsg(PL.pct)) + '</p>' +
      '<div class="xrow"><button class="btn gold" data-xact="plgo" data-m="' + PL.mode + '">' + esc(T('plAgain')) + '</button><button class="btn ghost" data-xact="plquit">' + esc(T('plHome')) + '</button></div></div>';
  }
  if (PL.mode === 'riddle') {
    var r = PL.rs[PL.i], hs = '';
    for (var k = 0; k < PL.hints; k++) hs += '<div class="plhint"><b>' + esc(T('plHintN', k + 1)) + '</b>' + esc(r.h[k] || '') + '</div>';
    h += '<div class="card"><div class="plprog">' + esc(T('plQof', PL.i + 1, PL.rs.length)) + ' · ' + esc(T('plScore', PL.score)) + '</div>' + hs;
    if (!PL.solved) h += '<div class="xrow"><input id="plIn" type="text" placeholder="' + esc(T('plGuessPH')) + '"><button class="btn gold" data-xact="plguess">' + esc(T('plGuess')) + '</button></div>' + (PL.hints < 3 ? '<button class="xbtn" data-xact="plhint">💡 ' + esc(T('plHintBtn')) + '</button>' : '') + ' <button class="xbtn" data-xact="plgive">' + esc(T('plGive')) + '</button>';
    else h += '<div class="plans ' + (PL.gave ? 'bad' : 'ok') + '">' + esc(PL.gave ? T('plWas') : T('plRight')) + ' <b>' + esc(r.a) + '</b>' + (r.v ? ' · ' + esc(r.v) : '') + '</div>' + (r.e ? '<p class="ple">' + esc(r.e) + '</p>' : '') + '<button class="btn gold" data-xact="plnext">' + esc(T('plNext')) + '</button>';
    return h + '</div>';
  }
  var q = PL.qs[PL.i], ob = '';
  eachA(q.o, function (o, i) {
    var c = 'plopt'; if (PL.picked >= 0) { if (i === q.a) c += ' ok'; else if (i === PL.picked) c += ' bad'; }
    ob += '<button class="' + c + '" data-xact="plpick" data-k="' + i + '"' + (PL.picked >= 0 ? ' disabled' : '') + '>' + 'ABCD'.charAt(i) + '. ' + esc(o) + '</button>';
  });
  h += '<div class="card"><div class="plprog">' + esc(T('plQof', PL.i + 1, PL.qs.length)) + (PL.mode === 'wrong' ? ' · ' + esc(T('plWrong')) : '') + '</div><div class="plq">' + esc(q.q) + '</div>' + ob;
  if (PL.picked >= 0) h += '<div class="plans ' + (PL.picked === q.a ? 'ok' : 'bad') + '">' + esc(PL.picked === q.a ? T('plRight') : T('plWrongA')) + '</div>' + (q.e ? '<p class="ple">' + esc(q.e) + (q.v ? '（' + esc(q.v) + '）' : '') + '</p>' : '') + '<button class="btn gold" data-xact="plnext">' + esc(T('plNext')) + '</button>';
  return h + '</div>';
}

/* ---------- 課程獎章 ---------- */
var RW_COLORS = [['#EDB955', '#B8761A'], ['#E58467', '#A8442F'], ['#82BE95', '#3E7D4C'], ['#78A0DA', '#2D5AA8'], ['#AE94D2', '#6A4C9C'], ['#E99AAA', '#B4435F'], ['#58BAC6', '#1F7A86'], ['#A3B0BD', '#5A6B7C'], ['#F6D766', '#C08A14'], ['#D98C5F', '#8E4A23']];
function rwUnits() { var o = []; eachA(D.courses || [], function (c) { if (/^unit\d+$/.test(String(c.id))) o.push(c); }); return o; }
function rwUnitDone(c) { var n = (c.lessons || []).length; return n > 0 && unitReadCount(c) >= n; }
function rwCount() { var n = 0; for (var k in S.rewards) n++; return n; }
function rwUnitNo(c) { return parseInt(String(c.id).replace(/\D/g, ''), 10) || 1; }
function rwMedalSvg(c) {
  var no = rwUnitNo(c), col = RW_COLORS[(no - 1) % RW_COLORS.length], rays = '';
  for (var i = 0; i < 12; i++) rays += '<path d="M100 96 L92 -14 L108 -14 Z" fill="rgba(255,226,140,.42)" transform="rotate(' + (i * 30) + ' 100 96)"/>';
  var fs = no >= 10 ? 52 : 62;
  return '<svg class="rw-medal" viewBox="0 0 200 230" aria-hidden="true"><defs><radialGradient id="rwg1" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#FFF3C4"/><stop offset=".5" stop-color="#F0C45A"/><stop offset="1" stop-color="#B8761A"/></radialGradient>' +
    '<linearGradient id="rwg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col[0] + '"/><stop offset="1" stop-color="' + col[1] + '"/></linearGradient><clipPath id="rwclip"><circle cx="100" cy="96" r="58"/></clipPath></defs>' +
    '<g class="rw-rays">' + rays + '</g><path d="M64 150 L44 224 L72 210 L86 228 L100 156 Z" fill="#C23B3B"/><path d="M136 150 L156 224 L128 210 L114 228 L100 156 Z" fill="#9E2B2B"/>' +
    '<circle cx="100" cy="96" r="72" fill="url(#rwg1)"/><circle cx="100" cy="96" r="66" fill="none" stroke="#FFF3C4" stroke-width="2" stroke-dasharray="3 5" opacity=".9"/><circle cx="100" cy="96" r="58" fill="url(#rwg2)"/>' +
    '<g clip-path="url(#rwclip)"><rect class="rw-shine" x="-20" y="30" width="26" height="140" fill="#fff" opacity=".35" transform="rotate(20 100 96)"/></g>' +
    '<text x="100" y="' + (96 + fs * 0.34) + '" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="' + fs + '" fill="#fff" style="paint-order:stroke;stroke:rgba(0,0,0,.28);stroke-width:2px">' + no + '</text>' +
    '<g fill="#FFF3C4"><path class="rw-tw" d="M30 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path class="rw-tw" style="animation-delay:.5s" d="M172 30 l2.5 6.5 6.5 2.5 -6.5 2.5 -2.5 6.5 -2.5 -6.5 -6.5 -2.5 6.5 -2.5z"/><path class="rw-tw" style="animation-delay:1s" d="M178 120 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/></g></svg>';
}
var rwQueue = [], rwShowing = false, rwTimer = 0;
function rwLine(c) {
  var nm = String(c.title || '').replace(/^第\d+單元\s*/, '');
  if (S.aud === 'kid') return [T('rwK1', nm), T('rwK2')];
  if (S.aud === 'teen') return [T('rwT1', nm), T('rwT2')];
  if (S.aud === 'seeker') return [T('rwS1', nm), T('rwS2')];
  return [T('rwA1', nm), T('rwA2')];
}
function rwShow(c, replay) {
  if (rwShowing) { rwQueue.push([c, replay]); return; }
  rwShowing = true; BUSY = true;
  var ln = rwLine(c), n = rwCount(), mask = document.createElement('div'); mask.className = 'rw-mask';
  var cols = ['#F5C84B', '#E9695C', '#6FAE71', '#6C93D1', '#E58FA0', '#FFF3C4', '#A48AC9'], conf = '';
  for (var i = 0; i < 34; i++) conf += '<i class="rw-conf" style="left:' + ((i * 29 + Math.random() * 20) % 100) + '%;background:' + cols[i % cols.length] + ';--d:' + (2.6 + Math.random() * 2.4).toFixed(2) + 's;--dl:' + (Math.random() * 2.2).toFixed(2) + 's;--dx:' + Math.round(Math.random() * 120 - 60) + 'px;--r:' + Math.round(240 + Math.random() * 480) + 'deg"></i>';
  mask.innerHTML = conf + '<div class="rw-card">' + rwMedalSvg(c) + '<div class="rw-t1">' + esc(T('rwGoal')) + '</div><div class="rw-t2">' + esc(f9('第' + rwUnitNo(c) + '單元', 'Unit ' + rwUnitNo(c))) + '</div>' +
    '<div class="rw-t3">' + esc(ln[0]) + '<br>' + esc(ln[1]) + '</div><div class="rw-t4">🏅 ' + esc(T('rwNth', n, (c.lessons || []).length)) + '</div>' +
    '<div class="rw-acts"><button class="btn ghost" data-rw="share">↗ ' + esc(T('share')) + '</button><button class="btn gold" data-rw="ok">' + esc(T('rwOk')) + '</button></div></div>';
  simpifyEl(mask); document.body.appendChild(mask);
  try { if (!replay && navigator.vibrate) navigator.vibrate([40, 60, 90]); } catch (e) { }
  var close = function () { clearTimeout(rwTimer); if (mask.parentNode) mask.parentNode.removeChild(mask); rwShowing = false; BUSY = BUSY_OTHER(); var nx = rwQueue.shift(); if (nx) setTimeout(function () { rwShow(nx[0], nx[1]); }, 350); else updIdle(); };
  mask.onclick = function (e) {
    var a = e.target && e.target.getAttribute && e.target.getAttribute('data-rw');
    if (a === 'share') { clearTimeout(rwTimer); shareText('🏅 ' + ln[0] + '\n\n—— ' + T('fellowshipName') + '\n' + appShareUrl()); return; }
    if (a === 'ok' || e.target === mask) close();
  };
  rwTimer = setTimeout(close, 14000);
}
function rwCheckLesson(no) {
  var u = unitOfLesson(no); if (!u) return;
  eachA(rwUnits(), function (c) { if (rwUnitNo(c) === u && !S.rewards[c.id] && rwUnitDone(c)) { S.rewards[c.id] = now(); save(); rwShow(c, false); } });
}
function rwBackfill() { var ch = false; eachA(rwUnits(), function (c) { if (!S.rewards[c.id] && rwUnitDone(c)) { S.rewards[c.id] = now(); ch = true; } }); if (ch) save(); }
var _toggleRead0 = toggleRead;
toggleRead = function (no) { _toggleRead0(no); if (isRead(no)) setTimeout(function () { rwCheckLesson(no); }, 400); };
var _renderUnitGrid0 = renderUnitGrid;
renderUnitGrid = function () {
  rwBackfill(); var h = _renderUnitGrid0();
  eachA(rwUnits(), function (c) { if (S.rewards[c.id]) h = h.replace('data-unit="' + c.id + '">', 'data-unit="' + c.id + '"><span class="rw-b">🏅</span>'); });
  var n = 0; eachA(rwUnits(), function (c) { if (S.rewards[c.id]) n++; });
  return '<div class="rw-line"><span>🏅 ' + esc(T('rwCount', n, rwUnits().length)) + '</span></div>' + h;
};
var _renderUnitLessons0 = renderUnitLessons;
renderUnitLessons = function (course) {
  var h = _renderUnitLessons0(course);
  if (course && S.rewards[course.id]) h = '<button class="xbtn gold" data-xact="rwagain" data-u="' + esc(course.id) + '" style="margin:0 0 12px">🏅 ' + esc(T('rwAgain')) + '</button>' + h;
  return h;
};
