# -*- coding: utf-8 -*-
"""國度321空中團契 · 依 321 App 技能全面更新的建置腳本
輸入：原始 index.html（單檔）；輸出：dist/ 下的 index.html、media.js、sw.js、version.json"""
import json, os, re, sys, time, subprocess
sys.path.insert(0, os.path.dirname(__file__))
import p1_names, p2_content
from t2s import t2s

HERE = os.path.dirname(os.path.abspath(__file__))
REF = '/root/.claude/skills/synced/c98744ad-7fb9-4279-b9b8-95ec09c9f3bb_ed4c62f8-e6d6-4f05-bbc5-bb6ec4d5be7a/321-bible-app-features/references'
SRC = os.path.join(HERE, 'src')
ORIG = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/w/orig.html'
DIST = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'dist')
os.makedirs(DIST, exist_ok=True)
VER = time.strftime('4.0.%Y%m%d%H%M', time.gmtime(time.time() + 8 * 3600))


def rd(p):
    return open(p, encoding='utf-8').read()


def rep(s, old, new, count=1):
    assert old in s, ('找不到要替換的片段', old[:80])
    return s.replace(old, new, count)


s = rd(ORIG)

# ---------- 1. 刪除人名 ----------
s = p1_names.apply(s)
p1_names.check(s)
s = p2_content.apply(s)
p2_content.data_json_min(os.path.join(DIST, 'data.json'), re.search(r'contentVersion: "([^"]+)"', s).group(1))

# CSP：朗讀解鎖用的靜音 wav（data:）、Pexels 圖庫縮圖
s = rep(s, "media-src 'self' blob:", "media-src 'self' blob: data:")
s = rep(s, "img-src 'self' data: blob: https://i.ytimg.com", "img-src 'self' data: blob: https://images.pexels.com https://i.ytimg.com")

# ---------- 2. 設定頁：四段字級、護眼主題 ----------
s = rep(s, '<button data-fs="1.45">特大</button>', '<button data-fs="1.45">特大</button>\n        <button data-fs="1.7">超大</button>')
s = rep(s, '<button data-th="dark">深色</button>', '<button data-th="dark">深色</button>\n        <button data-th="sepia">護眼</button>')
s = rep(s, 'var keys=["fsStd","fsBig","fsXl"];', 'var keys=["fsStd","fsBig","fsXl","fsXxl"];')
s = rep(s, 'var keys2=["thAuto","thLight","thDark"];', 'var keys2=["thAuto","thLight","thDark","thSepia"];')
def rep_after(s, marker, old, new):
    i = s.index(marker); j = s.index(old, i)
    return s[:j] + new + s[j + len(old):]
s = rep_after(s, '"zh-Hant": {', 'fsXl:"特大",', 'fsXl:"特大", fsXxl:"超大",')
s = rep_after(s, '"zh-Hans": {', 'fsXl:"特大",', 'fsXl:"特大", fsXxl:"超大",')
s = rep(s, 'fsXl:"X-Large",', 'fsXl:"X-Large", fsXxl:"XX-Large",')
s = rep_after(s, '"zh-Hant": {', 'thDark:"深色",', 'thDark:"深色", thSepia:"護眼",')
s = rep_after(s, '"zh-Hans": {', 'thDark:"深色",', 'thDark:"深色", thSepia:"护眼",')
s = rep(s, 'thDark:"Dark",', 'thDark:"Dark", thSepia:"Sepia",')
# 舊的 SW 註冊交給新的自動更新模組（updateViaCache:'none'）
s = rep(s, '  if("serviceWorker" in navigator){\n    try{\n      navigator.serviceWorker.register("sw.js")',
        '  if(false && "serviceWorker" in navigator){\n    try{\n      navigator.serviceWorker.register("sw.js")')

# 刪除「我需要幫助」浮動鈕與面板
import re as _re
s, _n = _re.subn(r'  <div class="help-fab">.*?</div>\n', '', s, count=1, flags=_re.S); assert _n == 1
s, _n = _re.subn(r'<!-- 求助面板 -->\n<div class="sheet" id="helpSheet">.*?\n  </div>\n</div>\n', '', s, count=1, flags=_re.S); assert _n == 1
s = rep(s, '  initHelp();\n', '')

# ---------- 3. 組裝功能模組 ----------
xi = json.load(open(os.path.join(REF, 'ext_i18n.json'), encoding='utf-8'))
extra = json.load(open(os.path.join(HERE, 'xi_extra.json'), encoding='utf-8'))
for lg in ('zh', 'en'):
    xi[lg].update(extra[lg])
xi['en'] = {k: v.replace('Xiaozhi', 'Sage AI') for k, v in xi['en'].items()}
aud = json.load(open(os.path.join(HERE, 'aud.json'), encoding='utf-8'))
for lg in ('zh', 'zs', 'en'):
    aud[lg]['style']['seeker'] = aud[lg]['skstyle']
    for a in aud[lg]['sys']:
        aud[lg]['sys'][a] = aud[lg]['sys'][a].replace('經文脈絡', '經文與課文的脈絡').replace('经文脉络', '经文与课文的脉络')
aud2 = json.load(open(os.path.join(HERE, 'aud2.json'), encoding='utf-8'))
NEW_AUD = {
 'elder': ['👴', ('長輩', '长辈', 'Elder'), ('尊敬溫和、慢慢說，句子清楚好懂', '尊敬温和、慢慢说，句子清楚好懂', 'Respectful, gentle and unhurried, in clear words')],
 'parent': ['👨‍👩‍👧', ('父母', '父母', 'Parent'), ('貼近養兒育女的日常：溝通、管教、陪伴與禱告', '贴近养儿育女的日常：沟通、管教、陪伴与祷告', 'Close to raising children: talking, discipline, presence and prayer')],
 'couple': ['💑', ('夫妻', '夫妻', 'Couple'), ('夫妻同行：溝通、饒恕、同心與一起禱告', '夫妻同行：沟通、饶恕、同心与一起祷告', 'Walking together: talking, forgiving, unity and praying as a couple')],
 'single_parent': ['👩‍👧', ('單親', '单亲', 'Single parent'), ('先接住你的辛苦，給做得到的小步驟與盼望', '先接住你的辛苦，给做得到的小步骤与盼望', 'Hear your weariness first — small doable steps and hope')],
 'single': ['🙋', ('單身', '单身', 'Single'), ('真誠平等，不催婚，談身分、等待與使命', '真诚平等，不催婚，谈身分、等待与使命', 'Sincere and equal — no pressure about marriage; identity, waiting and purpose')],
 'pastor': ['⛪', ('牧者', '牧者', 'Pastor'), ('同工口吻：牧養、講道預備、團隊與不倦怠', '同工口吻：牧养、讲道预备、团队与不倦怠', 'As a fellow worker: shepherding, sermon prep, team and avoiding burnout')],
}
aud.setdefault('write2', {'zh': {}, 'zs': {}, 'en': {}}); aud.setdefault('res2', {'zh': {}, 'zs': {}, 'en': {}})
for k, (ic, nm, hint) in NEW_AUD.items():
    aud['icon'][k] = ic
    aud['qbank'][k] = {}
    for li, lg in enumerate(('zh', 'zs', 'en')):
        d = aud2[k][lg]
        aud[lg]['name'][k] = nm[li]; aud[lg]['hint'][k] = hint[li]
        aud[lg]['sys'][k] = d['sys']; aud[lg]['style'][k] = d['style']
        aud['write2'][lg][k] = d['write']
        aud['res2'][lg][k] = [x.replace('這一章', '這一課').replace('这一章', '这一课').replace('this chapter', 'this lesson') for x in d['res']]
        aud['qbank'][k][lg] = d['q']
        aud['fu'][lg][k] = d['fu']
order = ['x_core.js', 'x_tts.js', 'x_md.js', 'x_marks.js', 'x_chat.js', 'x_card.js', 'x_studio.js', 'x_play.js', 'x_ui.js']
mod = '\n'.join(rd(os.path.join(SRC, f)) for f in order)
mod = mod.replace('@@XI18N@@', json.dumps({'zh': xi['zh'], 'en': xi['en']}, ensure_ascii=False))
mod = mod.replace('@@AUD@@', json.dumps(aud, ensure_ascii=False))
mod = mod.replace('@@VER@@', VER)
mod += '''
/* ---------- 給 media.js 用的橋接（主程式包在閉包裡） ---------- */
window.X321 = { S: S, SVC: SVC, APPVER: APPVER, L: L, isEN: isEN, isZS: isZS, toast: toast, trim: trim, esc: esc, extractReply: extractReply,
  renderCard: renderCard, drawCard: drawCard, closeHSheet: closeHSheet, openHSheet: openHSheet, stopAll: stopAll, now: now, uid: uid, isIOS: isIOS,
  fmtDate: fmtDate, cardSans: cardSans, T: T, updIdle: updIdle, save: save, AUD_WRITE: AUD_WRITE, ttsPrep: ttsPrep, mdSpeak: mdSpeak, buildQueue: buildQueue, checkUpdate: checkUpdate, PL: function () { return PL; } };
Object.defineProperty(window.X321, 'studio', { get: function () { return studio; } });
Object.defineProperty(window.X321, 'BUSY', { get: function () { return BUSY; }, set: function (v) { BUSY = !!v; if (!v) updIdle(); } });
window.updIdle = updIdle; window.renderAIC = renderAIC; window.renderVoiceBlock = renderVoiceBlock;
'''
s = rep(s, 'if(document.readyState!=="loading") init();\nelse document.addEventListener("DOMContentLoaded",init);\n\n})();',
        '/* ==================== 321 App 功能套件 ==================== */\n' + mod +
        '\nif(document.readyState!=="loading") init();\nelse document.addEventListener("DOMContentLoaded",init);\n\n})();')
css = rd(os.path.join(SRC, 'x.css'))
s = rep(s, '</head>', '<style id="x321css">\n' + css + '</style>\n</head>')

# ---------- 4. 简體字表：補上新字串用到的字 ----------
m = re.search(r'var TRAD2SIMP_TABLE = (\{.*?\});', s)
table = json.loads(m.group(1))
need = set(re.findall(r'[一-鿿]', mod + json.dumps(xi['zh'], ensure_ascii=False)))
add = {}
for ch in need:
    if ch in table:
        continue
    sc = t2s(ch)
    if sc != ch:
        add[ch] = sc
table.update(add)
s = s[:m.start(1)] + json.dumps(table, ensure_ascii=False) + s[m.end(1):]
print('简體字表新增', len(add), '字')

open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8').write(s)

# ---------- 5. media.js ----------
mi = json.load(open(os.path.join(REF, 'media_i18n.json'), encoding='utf-8'))
mi['zh']['blessSys'] = mi['zh']['blessSys'].replace('送給教會裡的弟兄姊妹', '送給空中團契的家人').replace('貼近教會生活與日常', '貼近家庭、職場與日常生活')
mi['en']['blessSys'] = mi['en']['blessSys'].replace('for a brother or sister in the church', 'for a member of the fellowship family').replace('touches church and everyday life', 'touches family, work and everyday life')
mi['zh']['hyNoList'] = '詩歌庫暫時載入不到，請稍後再試，或改用「從檔案選音樂」。'
mi['en']['hyNoList'] = 'The music library could not load right now. Try again later, or pick a music file instead.'
mi['en'] = {k: v.replace('Xiaozhi', 'Sage AI') for k, v in mi['en'].items()}
mi['zs'] = {k: t2s(v) for k, v in mi['zh'].items()}
head = rd(os.path.join(REF, 'media_head.js'))
head = head.replace('/*@@MI18N@@*/{}', json.dumps(mi, ensure_ascii=False))
head = head.replace('321教會生活 · 美圖影音', '國度321空中團契 · 美圖影音')
shim = '''
const X = window.X321;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const { S, SVC, APPVER, L, isEN, isZS, toast, trim, esc, extractReply, renderCard, drawCard, closeHSheet, openHSheet, stopAll, now, uid, isIOS, fmtDate, cardSans, T, updIdle, save } = X;
const pad = n => (n < 10 ? '0' : '') + n;
/* 詩歌庫：先找本站的 music.json，找不到就用同網域《321互動聖經》的詩歌庫 */
let MROOT = '';
'''
head = head.replace("'use strict';", "'use strict';" + shim, 1)
body = rd(os.path.join(REF, 'media_body.js'))
body = body.replace("$('#app [data-c=\"n\"]')", "$('#studioOv [data-c=\"n\"]')")
body = body.replace("indexedDB.open('cl_works', 1)", "indexedDB.open('k321_works', 1)")
body = body.replace("M('blessSys')", "(M('blessSys') + X.AUD_WRITE())").replace("M('twSys')", "(M('twSys') + X.AUD_WRITE())")
old_load = re.search(r"async function hymnLoadList\(\) \{.*?\n\}\n", body, re.S).group(0)
new_load = '''async function hymnLoadList() {
  if (hymnList) return hymnList;
  let err = null;
  for (const root of ['', '../bible/']) {
    try {
      const r = await fetch(root + MUSIC_JSON + '?v=' + APPVER);
      if (!r.ok) throw new Error('http ' + r.status);
      const d = await r.json();
      const list = Array.isArray(d) ? d : ((d && d.songs) || []);
      if (list.length) { MROOT = root; hymnList = list; return hymnList; }
    } catch (e) { err = e; }
  }
  throw err || new Error('no list');
}
'''
body = body.replace(old_load, new_load)
body = body.replace("[MUSIC_DIR, '']", "[MROOT + MUSIC_DIR, MROOT]")
body = body.replace("musicBase !== null ? musicBase : MUSIC_DIR", "musicBase !== null ? musicBase : MROOT + MUSIC_DIR")
body = re.sub(r'\bstudio\b', 'X.studio', body)
body = re.sub(r'\bBUSY\b', 'X.BUSY', body)
assert 'X.X.' not in body
media = head + '\n' + rd(os.path.join(REF, 'media_mx.js')) + '\n' + body
open(os.path.join(DIST, 'media.js'), 'w', encoding='utf-8').write(media)

# ---------- 6. sw.js、version.json ----------
sw = rd(os.path.join(SRC, 'sw.js')).replace('@@VER@@', VER)
open(os.path.join(DIST, 'sw.js'), 'w', encoding='utf-8').write(sw)
open(os.path.join(DIST, 'version.json'), 'w', encoding='utf-8').write(json.dumps({'v': VER}) + '\n')

# ---------- 7. 檢查 ----------
scripts = re.findall(r'<script>(.*?)</script>', s, re.S)
for i, js in enumerate(scripts):
    p = '/tmp/claude-0/chk%d.js' % i
    open(p, 'w', encoding='utf-8').write(js)
    subprocess.run(['node', '--check', p], check=True)
for f in ('media.js', 'sw.js'):
    subprocess.run(['node', '--check', os.path.join(DIST, f)], check=True)


def es5_lint(js, name):
    x = re.sub(r'/\*.*?\*/', '', js, flags=re.S)
    x = re.sub(r'"(?:\\.|[^"\\\n])*"', '""', x)
    x = re.sub(r"'(?:\\.|[^'\\\n])*'", "''", x)
    x = re.sub(r'(?m)^\s*//.*$', '', x)
    x = re.sub(r'/[^/\n]*`[^/\n]*/[gimy]*', '/re/', x)
    bad = []
    for pat in ('=>', '`', 'let ', 'const ', '...', 'class '):
        if pat in x:
            bad.append(pat)
    if bad:
        raise SystemExit('ES5 lint 失敗 %s：%s' % (name, bad))


es5_lint(mod, '功能模組')
es5_lint(sw, 'sw.js')
assert VER in s and VER in sw
print('建置完成', VER, '｜index.html %.1f KB｜media.js %.1f KB' % (len(s.encode()) / 1024, len(media.encode()) / 1024))
