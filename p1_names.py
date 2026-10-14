# -*- coding: utf-8 -*-
"""步驟一：刪除服侍團隊、各國空中團契、夫妻成長營的所有人名，只留團隊、職責與地區。
奉獻帳戶的戶名依使用者指示保留。"""
import re

ZH_TEAM = '''    groups: [
      { n:"一", title:"決策團隊",
        duty:"負責異象、方向、人事及財務等重大決策。" },

      { n:"二", title:"專任團隊",
        duty:"負責全時間推動空中團契各項事工。",
        subs:[
          { h:"全職同工", people:[
            { k:"", d:"負責召集並主持會議、連結並推動空中團契各項事工、發展午修靈糧。" },
            { k:"", d:"負責關懷牧養、文書行政、聯絡協調、規劃服侍表、發展晚禱事工。" }
          ] },
          { h:"專職同工", people:[
            { k:"", d:"負責牧養、代禱站、關懷站。" },
            { k:"", d:"負責財務、螞蟻家教會。" },
            { k:"", d:"負責影音、App與數位平台。" }
          ] }
        ] },

      { n:"三", title:"執行團隊",
        duty:"包含決策團隊及專任團隊，負責各項事工的規劃、帶領與執行。",
        members:["電腦操作","敬拜事工","傳遞推廣","檔案管理","晚禱牧養"] },

      { n:"四", title:"牧養團隊",
        duty:"關懷新朋友、各小家同工及病痛、軟弱的家人。" },

      { n:"五", title:"小家團隊",
        duty:"關懷與牧養各小家的家人。",
        members:["小家長","副家長","核心同工"] },

      { n:"六", title:"事工團隊",
        duty:"共同事工",
        members:["講道團隊","應用分享團隊","電腦團隊","主持團隊","敬拜團隊","歡迎團隊",
                 "影音團隊","配音團隊","代禱站團隊","關懷站團隊","職場得勝團契","夫妻成長團契"] }
    ],
    fellowships: {
      title:"各國空中團契",
      areas:[
        { a:"印尼空中團契" },
        { a:"紐西蘭空中團契" },
        { a:"澳洲英語空中團契" },
        { a:"新加坡空中團契" },
        { a:"日本空中團契" }
      ]
    },
    camps: {
      title:"321夫妻成長營團隊",
      areas:[
        { a:"台灣夫妻成長營" },
        { a:"沙巴夫妻成長營" },
        { a:"紐西蘭夫妻成長營" },
        { a:"新加坡夫妻成長營" }
      ]
    }
  },
'''

EN_TEAM = '''  groups: [
    { n:"1", title:"Decision-Making Team",
      duty:"Responsible for major decisions \\u2014 vision, direction, personnel and finance." },

    { n:"2", title:"Full-Time Team",
      duty:"Responsible for advancing every ministry of the fellowship full-time.",
      subs:[
        { h:"FULL-TIME CO-WORKERS", people:[
          { k:"", d:"Convenes and chairs meetings; connects and advances the ministries of the fellowship; develops the Midday Word." },
          { k:"", d:"Care and pastoring; administration; liaison and coordination; service rosters; develops the Evening Prayer ministry." }
        ] },
        { h:"DEDICATED CO-WORKERS", people:[
          { k:"", d:"Pastoring; the Prayer Station; the Care Station." },
          { k:"", d:"Finance; ant house churches." },
          { k:"", d:"Audio-visual; the app and digital platforms." }
        ] }
      ] },

    { n:"3", title:"Executive Team",
      duty:"Includes the Decision-Making and Full-Time Teams; responsible for planning, leading and carrying out each ministry.",
      members:["Technical operations","Worship ministry","Outreach and promotion","Archives","Evening Prayer pastoring"] },

    { n:"4", title:"Pastoral Team",
      duty:"Caring for new friends, for small-group co-workers, and for family members who are ill or weary." },

    { n:"5", title:"Small-Group Team",
      duty:"Caring for and pastoring the family members of each small group.",
      members:["Small-group leaders","Deputy leaders","Core co-workers"] },

    { n:"6", title:"Ministry Teams",
      duty:"Shared ministries",
      members:["Preaching","Application Sharing","Technical","Hosting","Worship","Welcome",
               "Audio-Visual","Voice-Over","Prayer Station","Care Station",
               "Marketplace Victory Fellowship","Couples Growth Fellowship"] }
  ],
  fellowships: {
    title:"Online Fellowships by Nation",
    areas:[
      { a:"Indonesia Online Fellowship" },
      { a:"New Zealand Online Fellowship" },
      { a:"Australia (English) Online Fellowship" },
      { a:"Singapore Online Fellowship" },
      { a:"Japan Online Fellowship" }
    ]
  },
  camps: {
    title:"321 Couples Growth Camp Teams",
    areas:[
      { a:"Taiwan" },
      { a:"Sabah" },
      { a:"New Zealand" },
      { a:"Singapore" }
    ]
  }
};
'''

# 渲染：沒有名字時不印空白粗體；地區改成一排標籤，不再印「負責人」
OLD_P = "team+='<div class=\"st-p\"><b>'+esc(PL[qi].k)+'</b><span>'+esc(PL[qi].d)+'</span></div>';"
NEW_P = "team+='<div class=\"st-p\">'+(PL[qi].k?'<b>'+esc(PL[qi].k)+'</b>':'')+'<span>'+esc(PL[qi].d)+'</span></div>';"
OLD_BLOCK_RE = re.compile(r"    function stBlock\(B, lead\)\{.*?\n    team\+=stBlock\(ST\.camps, \"\"\);\n", re.S)
NEW_BLOCK = '''    function stBlock(B){
      if(!B || !B.areas || !B.areas.length) return '';
      var h='<div class="st-camp"><b>'+esc(B.title||"")+'</b><div class="st-areas">';
      for(var ai=0; ai<B.areas.length; ai++) h+='<span>'+esc(B.areas[ai].a)+'</span>';
      return h+'</div></div>';
    }
    team+=stBlock(ST.fellowships);
    team+=stBlock(ST.camps);
'''


def apply(s):
    # 繁體資料
    a = s.index('    groups: [\n      { n:"一", title:"決策團隊"')
    b = s.index('  /* 四個建立神國的建國方略')
    s = s[:a] + ZH_TEAM + '\n' + s[b:]
    # 英文資料
    a = s.index('window.APP_EN.serveTeam = {')
    a = s.index('  groups: [', a)
    b = s.index('};\n', s.index('321 Couples Growth Camp Teams', a)) + 3
    s = s[:a] + EN_TEAM + s[b:]
    assert OLD_P in s
    s = s.replace(OLD_P, NEW_P)
    s, n = OLD_BLOCK_RE.subn(NEW_BLOCK, s)
    assert n == 1, n
    s = s.replace('esc(f9("例如：財哥","e.g. Bin"))', 'esc(f9("例如：王弟兄","e.g. Brother Wang"))')
    css = ('.st-areas{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;}'
           '.st-areas span{border:1px solid rgba(233,204,107,.45);border-radius:999px;padding:4px 12px;'
           'font-size:calc(14.5px * var(--fs));color:#fff;background:rgba(255,255,255,.06);}\n')
    s = s.replace('.st-area{', css + '.st-area{', 1)
    return s


NAMES = ("財哥 珍姐 郭姐 Ann姐 振宏 Gigi 奕全 明子 偉供 呂濱 心瑀 三揚 燕琴 繼鴻 經儀 素琴 阿坤 娟娟 "
         "鐘償 有興 秋蓉 徐哥 Phoebe 子瑜 阿信 凱莉 君妮 亞祥 淑儀").split()


def check(s):
    dec = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s)
    left = [n for n in NAMES if n in dec]
    assert not left, left
    assert '提摩太"]' not in dec and '保羅、君妮' not in dec
