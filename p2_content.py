# -*- coding: utf-8 -*-
"""步驟二：奉獻帳號改成與《321互動聖經》相同的五筆；App 生態改成 晨讀321、321互動聖經 ＋ 六個生活操練 App"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
IC = json.load(open(os.path.join(HERE, 'icons.json')))


def offering(tw_qr=None):
    tw = {"country": "台灣", "holder": "社團法人中華活力全人關懷協會", "bank": "新光商業銀行 新埔分行", "account": "(103) 0338101013000"}
    if tw_qr:
        tw["qr"] = tw_qr
    return [tw,
            {"country": "馬來西亞", "holder": "馬來西亞安提阿教會", "bank": "Public Bank", "account": "3178557627"},
            {"country": "紐西蘭", "holder": "Bin Lu", "bank": "ASB Bank Auckland Branch", "account": "12-3231-0055109-00"},
            {"country": "新加坡", "holder": "LEE CHEW YONG", "bank": "DBS My Account", "account": "275-153637-9"},
            {"country": "中國", "holder": "微信支付", "holderEn": "WeChat Pay", "bank": "", "account": "", "qr": IC['wxpay'], "qrPhoto": True, "qrCap": "請用微信掃一掃奉獻", "qrCapEn": "Scan with WeChat to give"}]


LIFE = [
    ("spiritual", "屬", "321屬靈生活", "與神同行 · 靈修禱告 · 活出新生命", "321 Spiritual Life", "Walking with God · devotion and prayer · living the new life", "https://spch321-sudo.github.io/321spirituallife/"),
    ("family", "家", "321家庭生活", "家人相愛 · 同心建立屬神的家", "321 Family Life", "Loving one another · building a godly home together", "https://spch321-sudo.github.io/321familylife/"),
    ("marriage", "婚", "321婚姻生活", "二人成為一體 · 彼此相愛同心", "321 Marriage Life", "The two become one · loving with one heart", "https://spch321-sudo.github.io/321marriagelife/"),
    ("work", "職", "321職場生活", "在職場作光作鹽 · 成為職場的贏家", "321 Work Life", "Salt and light at work · winning in the workplace", "https://spch321-sudo.github.io/321worklife/"),
    ("church", "教", "321教會生活", "肢體相連 · 彼此配搭建造教會", "321 Church Life", "One body · serving together to build the church", "https://spch321-sudo.github.io/321churchlife/"),
    ("social", "社", "321社交生活", "活出基督的愛 · 建立美好的關係", "321 Social Life", "Living out Christ’s love · building good relationships", "https://spch321-sudo.github.io/321sociallife/"),
]


def js(v):
    return json.dumps(v, ensure_ascii=False)


def apply(s):
    # ---- 生態系（繁體資料）----
    a = s.index('  ecosystem: [\n    { badge:"晨"')
    b = s.index('  ]\n};', a)
    old = s[a:b]
    chendu_img = re.search(r'id:"chendu".*?img:"(data:image[^"]+)"', old, re.S).group(1)
    items = ['    { badge:"晨", name:"晨讀321", id:"chendu", desc:"每日靈修 · 171課三語", url:"https://spch321-sudo.github.io/chendu321/", '
             'urlSc:"https://spch321-sudo.github.io/chendu321-cn/", urlEn:"https://spch321-sudo.github.io/chendu321-en/", img:"%s" }' % chendu_img,
             '    { badge:"經", name:"321互動聖經", id:"bible", desc:"逐句朗讀 · 畫線默想 · 小智陪讀", url:"https://spch321-sudo.github.io/bible/", '
             'urlSc:"https://spch321-sudo.github.io/bible/", urlEn:"https://spch321-sudo.github.io/bible/", img:"%s" }' % IC['bible']]
    for k, badge, nm, desc, _ne, _de, url in LIFE:
        items.append('    { badge:%s, name:%s, id:"%s", group:"life", desc:%s, url:"%s", urlSc:"%s", urlEn:"%s", img:"%s" }'
                     % (js(badge), js(nm), k, js(desc), url, url, url, IC[k]))
    s = s[:a] + '  ecosystem: [\n' + ',\n'.join(items) + '\n' + s[b:]
    # ---- 生態系（英文層）----
    a = s.index('window.APP_EN.ecosystem = [')
    b = s.index('];', a) + 2
    en = ['  { name:"Morning Devotion 321", desc:"Daily devotion \\u00b7 171 lessons in three languages" }',
          '  { name:"321 Interactive Bible", desc:"Read aloud \\u00b7 highlight and reflect \\u00b7 study with Sage AI" }']
    for _k, _b, _n, _d, ne, de, _u in LIFE:
        en.append('  { name:%s, desc:%s }' % (js(ne), js(de)))
    s = s[:a] + 'window.APP_EN.ecosystem = [\n' + ',\n'.join(en) + '\n];' + s[b:]
    # ---- 奉獻帳號：APP_DATA 內嵌 ----
    a = s.index('    offering: [\n      { country:"台灣"')
    b = s.index('    ]\n', a) + 6
    s = s[:a] + '    offering: ' + js(offering()) + '\n' + s[b:]
    # ---- 奉獻帳號：內嵌的 data.json 備份 ----
    m = re.search(r'"offering":(\[\{"country":"台灣".*?\}\])\},"topics"', s)
    old = json.loads(m.group(1))
    s = s[:m.start(1)] + js(offering(old[0].get('qr'))) + s[m.end(1):]
    # ---- 奉獻卡片：微信支付（沒有帳號，只有 QR 與說明）----
    o1 = "'<div class=\"qrcap\">'+esc(f9(\"掃碼查看帳戶\",\"Scan for account details\"))+'</div></div>'"
    n1 = "'<div class=\"qrcap\">'+esc(a.qrCap?f9(a.qrCap,a.qrCapEn||a.qrCap):f9(\"掃碼查看帳戶\",\"Scan for account details\"))+'</div></div>'"
    assert o1 in s; s = s.replace(o1, n1)
    o3 = "'<div class=\"qrbox\"><img class=\"qrimg\" src=\"'"
    assert o3 in s; s = s.replace(o3, "'<div class=\"qrbox\"><img class=\"qrimg'+(a.qrPhoto?' photo':'')+'\" src=\"'")
    o2 = """          '<div class="oh">'+esc(a.holder)+'</div>'+
          '<div class="od">'+esc(a.bank)+'</div>'+
          '<div class="oa">'+esc(a.account)+'</div>'+noteHtml+copyBtn+qrhtml+'</div>';"""
    n2 = """          '<div class="oh">'+esc(a.holderEn?f9(a.holder,a.holderEn):a.holder)+'</div>'+
          (a.bank?'<div class="od">'+esc(a.bank)+'</div>':'')+
          (a.account?'<div class="oa">'+esc(a.account)+'</div>':'')+noteHtml+copyBtn+qrhtml+'</div>';"""
    assert o2 in s; s = s.replace(o2, n2)
    for bad in ('郭麗淑', 'Jonathan kifli', 'Wong Seet Ting', '6217359901008264673'):
        assert bad not in s, bad
    return s


def data_json(path_in, path_out):
    d = json.load(open(path_in, encoding='utf-8'))
    old = d.get('links', {}).get('offering') or []
    tw_qr = old[0].get('qr') if old else None
    d.setdefault('links', {})['offering'] = offering(tw_qr)
    json.dump(d, open(path_out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
