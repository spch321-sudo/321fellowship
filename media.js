/* 國度321空中團契 · 美圖影音（小智寫祝福、配樂、錄音／卡片影片／自拍影片、我的作品）
   進入美圖工作室才載入，不佔主程式體積。移植自《321互動聖經》。 */
(function () {
'use strict';
const X = window.X321;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const { S, SVC, APPVER, L, isEN, isZS, toast, trim, esc, extractReply, renderCard, drawCard, closeHSheet, openHSheet, stopAll, now, uid, isIOS, fmtDate, cardSans, T, updIdle, save } = X;
const pad = n => (n < 10 ? '0' : '') + n;
/* 詩歌庫：先找本站的 music.json，找不到就用同網域《321互動聖經》的詩歌庫 */
let MROOT = '';

const MI = {"zh": {"emptyReply": "回覆是空的", "verseL": "經文：", "bless": "請小智寫祝福", "blessing": "小智寫作中…", "blessDone": "小智寫好了", "blessHint": "可以自己寫，也可以請小智照這節經文寫一段關懷祝福；改完卡片會立刻跟著變。", "useMine": "用我的領受", "clearText": "不要內文", "noMine": "這段經文還沒有你的領受，可以自己寫一段", "chatErr": "小智連不上，請稍後再試。", "blessSys": "你是「小智」，國度321空中團契的屬靈同伴。請照使用者給的這節經文，寫一段溫暖的關懷祝福，送給空中團契的家人。要求：先用一兩句點出這節經文裡神的心意，再寫一句貼近家庭、職場與日常生活的祝福，最後用一句祝福收尾。總共三到四句、120 字以內，口語、溫暖、不說教，不要標題、不要條列、不要引號、不要再抄一次經文。結尾只用「阿們」收束，不要寫「奉主耶穌的名禱告」「奉耶穌的名求」這類句子。", "twSys": "你是「小智」，國度321空中團契的屬靈同伴。請照使用者的要求，修改他給你的這段祝福。只回傳改好的內文本身——不要解釋、不要標題、不要條列、不要引號、不要再抄一次經文。保持溫暖、口語、不說教。結尾只用「阿們」收束，不要寫「奉主耶穌的名禱告」「奉耶穌的名求」這類句子。", "twCur": "\n\n目前的內文：\n", "twHow": "\n\n要怎麼改：", "twBtn": "✨ 改一改", "twTitle": "要怎麼改？", "twPh": "或者自己說，例如：加一句為他的服事禱告", "twGo": "改好給我", "twBusy": "小智修改中…", "twDone": "改好了", "twNeed": "卡片內文還是空的——先自己寫一段，或請小智寫一段再來改。", "twPicks": "短一點|長一點|更溫暖|口語一點|更有力|換個說法", "close": "關閉", "loading": "載入中…", "all": "全部", "hyBtn": "🎵 從詩歌庫選", "hyTitle": "詩歌庫", "hyPh": "找歌名…", "hyNone": "找不到這首，換個字試試", "hyPicked": "已選好這首詩歌", "hyGetting": "載入詩歌中…", "hyNoList": "詩歌庫暫時載入不到，請稍後再試，或改用「從檔案選音樂」。", "hyBad": "這首載入失敗，換一首試試", "hyCredit": "詩歌：", "hy404a": "找不到 ", "hy404b": "（根目錄也找過了）　這個音檔還沒上傳到網站上", "hyNet": "連不到音檔（網路或離線）：", "hyEmpty": "　這個檔是空的，請重新上傳", "hyHtml": "　抓回來的不是音檔，是網頁（多半是 404 頁面）", "hyAgain": "找到音檔了，請再按一次 ▶", "hyHint": "詩歌放在自己的網站上，錄影片時混得進去。下載與使用請遵守各詩歌的授權規定。", "bgm": "背景音樂（選用）", "bgmPick": "從檔案選音樂", "bgmSwap": "換一首", "bgmDel": "移除音樂", "bgmVol": "音樂音量", "bgmNote": "錄製時會自動循環；按「停止並完成」後音樂淡出五秒才結束。", "bgmHint": "選一首詩歌或輕音樂；若一時找不到，按選擇視窗左下角「瀏覽」，再到 iCloud 雲碟或「我的 iPhone」裡找。", "bgmBad": "這不是音樂檔，請選 mp3、m4a、wav 等音檔", "bgmBig": "音檔太大（超過 25MB），請選短一點的", "bgmAdded": "已加入背景音樂", "bgmNeed": "請先選一首背景音樂", "volLo": "小聲", "volMid": "適中", "volHi": "明顯", "len15": "15 秒", "len30": "30 秒", "len60": "1 分鐘", "lenAll": "整首", "recSec": "錄成影片", "recVoice": "🎙 只有聲音", "recCard": "🖼 卡片畫面", "recSelfie": "📷 自拍畫面", "recVoiceD": "只錄你的聲音，存成語音檔", "recCardD": "卡片＋你的聲音，合成一支影片", "recSelfieD": "卡片＋你的臉＋聲音，合成一支影片", "recIntro": "按下開始，對著手機把這段經文與領受讀出來。可以只錄聲音，也可以把卡片、自拍合成一支影片直接傳出去。", "recIntroA": "這台裝置不支援合成影片，會先錄成語音；播放時可用手機「螢幕錄影」錄成影片。", "recReady": "按下開始，把想說的話錄進去", "recStartV": "開始錄影片", "recStartS": "開始自拍錄影", "recStartA": "開始錄音", "recStop": "停止並完成", "recing": "錄影中…", "recingA": "錄音中…", "recBusy": "錄製中不能換，先按「停止並完成」", "recTip": "建議 30～60 秒：先讀經文，再說這段話對你的意思。", "recDoneV": "影片做好了！可以分享出去", "recDoneA": "錄好了！可以播放或分享", "rvTitleV": "錄好了，先看一下", "rvTitleA": "錄好了，先聽一下", "rvHint": "滿意就存起來；不滿意可以重錄一次，或直接刪掉不留。", "rvSave": "儲存到我的作品", "rvShare": "分享出去", "rvAgain": "重錄一次", "rvDrop": "刪掉不留", "rvDropAsk": "這一段就不留了？", "rvDropped": "已刪掉，沒有存下來", "rvSaving": "存檔中…", "rvLeaveAsk": "還沒存起來，關掉就不見了，確定嗎？", "saveErr": "存檔失敗：", "recNo": "這台裝置不支援錄音", "vidNo": "這台裝置不支援自動合成影片", "micDeny": "無法使用麥克風，請允許權限", "camDeny": "無法使用相機，請允許權限", "selfieHint": "你的臉會以圓形貼在卡片右下角，錄影時同步合成。", "mcLen": "音樂卡片長度", "mcStart": "不錄音，只配音樂", "mcing": "音樂卡片製作中…", "mcHint": "卡片配上背景音樂做成影片，不必開口，結尾音樂淡出五秒。選 15 或 30 秒很快就好，選「整首」要等音樂播完。", "works": "我的作品", "noWorks": "還沒有作品。錄一段話或配一首音樂，就會出現在這裡。", "delAsk": "刪除這個作品？", "deleted": "已刪除", "saveIOSv": "請在選單裡選「儲存影片」，就會存進相簿", "fadingOut": "音樂淡出中…（再按一次立即停止）"}, "en": {"emptyReply": "empty reply", "verseL": "Verse: ", "bless": "Ask Sage AI to write", "blessing": "Sage AI is writing…", "blessDone": "Sage AI has written it", "blessHint": "Write it yourself, or let Sage AI write a short blessing from this verse. The card updates right away.", "useMine": "Use my reflection", "clearText": "No body text", "noMine": "There is no reflection on this verse yet — write one yourself", "chatErr": "Sage AI is unreachable. Please try again shortly.", "blessSys": "You are Sage AI, a spiritual companion from Kingdom 321 Fellowship. From the verse the user gives you, write a short, warm word of encouragement for a member of the fellowship family. First name in one or two sentences what this verse shows of God's heart, then one sentence that touches family, work and everyday life, then close with a blessing. Three to four sentences, under 60 words. Warm and spoken, never preachy. No headings, no bullet points, no quotation marks, and do not quote the verse again. End simply with \"Amen.\" Do not write \"in the name of the Lord Jesus we pray\" or similar.", "twSys": "You are Sage AI from Kingdom 321 Fellowship. Rewrite the short blessing the user gives you, following their instruction. Return ONLY the rewritten text — no explanation, no heading, no bullet points, no quotation marks, and do not quote the verse again. Keep it warm and spoken, never preachy. End simply with \"Amen.\" Do not write \"in the name of the Lord Jesus we pray\" or similar.", "twCur": "\n\nCurrent text:\n", "twHow": "\n\nHow to change it: ", "twBtn": "✨ Revise", "twTitle": "How should it change?", "twPh": "Or say it yourself, e.g. add a line praying for their ministry", "twGo": "Rewrite it", "twBusy": "Sage AI is rewriting…", "twDone": "Rewritten", "twNeed": "The card text is still empty — write something first, or ask Sage AI to write it.", "twPicks": "Shorter|Longer|Warmer|More everyday|Stronger|Say it another way", "close": "Close", "loading": "Loading…", "all": "All", "hyBtn": "🎵 Pick a hymn", "hyTitle": "Hymn library", "hyPh": "Find a hymn…", "hyNone": "Not found — try another word", "hyPicked": "Hymn selected", "hyGetting": "Loading the hymn…", "hyNoList": "The music library could not load right now. Try again later, or pick a music file instead.", "hyBad": "That hymn could not be loaded — try another", "hyCredit": "Hymn: ", "hy404a": "Not found: ", "hy404b": " (the site root was checked too) — this file has not been uploaded yet", "hyNet": "Cannot reach the audio file (offline?): ", "hyEmpty": " — the file is empty, please re-upload", "hyHtml": " — what came back is a web page, not audio (usually a 404 page)", "hyAgain": "Found it — tap ▶ once more", "hyHint": "Hymns are hosted on this site, so they mix into recordings properly. Please respect each hymn’s licence.", "bgm": "Background music (optional)", "bgmPick": "Choose music", "bgmSwap": "Change music", "bgmDel": "Remove music", "bgmVol": "Music volume", "bgmNote": "It loops quietly under your voice; when you stop, the music fades out over five seconds.", "bgmHint": "Pick a hymn or something gentle. If you cannot find it, tap Browse at the bottom left and look in iCloud Drive or On My iPhone.", "bgmBad": "That is not an audio file — choose an mp3, m4a or wav", "bgmBig": "That file is too large (over 25MB) — choose a shorter one", "bgmAdded": "Music added", "bgmNeed": "Choose some background music first", "volLo": "Soft", "volMid": "Medium", "volHi": "Clear", "len15": "15 sec", "len30": "30 sec", "len60": "1 min", "lenAll": "Whole track", "recSec": "Record a video", "recVoice": "🎙 Voice only", "recCard": "🖼 Card video", "recSelfie": "📷 With selfie", "recVoiceD": "Your voice alone, saved as an audio file", "recCardD": "The card plus your voice, made into a video", "recSelfieD": "The card, your face and your voice, made into a video", "recIntro": "Tap start and read the verse aloud. Record your voice alone, or add the card and your face, and it becomes a video you can send straight to anyone.", "recIntroA": "This device cannot build a video, so it will record audio only. You can use Screen Recording while it plays.", "recReady": "Tap start and say what is on your heart", "recStartV": "Start recording", "recStartS": "Start selfie recording", "recStartA": "Start recording", "recStop": "Stop and finish", "recing": "Recording…", "recingA": "Recording…", "recBusy": "Stop the recording first", "recTip": "30–60 seconds works well: read the verse, then say what it means to you.", "recDoneV": "Your video is ready to share", "recDoneA": "Recorded — you can play it or share it", "rvTitleV": "Here it is — take a look", "rvTitleA": "Here it is — have a listen", "rvHint": "Keep it if you are happy with it, record it again, or delete it without saving.", "rvSave": "Save to my recordings", "rvShare": "Share", "rvAgain": "Record again", "rvDrop": "Delete", "rvDropAsk": "Delete this without saving?", "rvDropped": "Deleted — nothing was saved", "rvSaving": "Saving…", "rvLeaveAsk": "This has not been saved yet — close anyway?", "saveErr": "Could not save: ", "recNo": "This device cannot record audio", "vidNo": "This device cannot build a video", "micDeny": "Microphone not available — please allow access", "camDeny": "Camera not available — please allow access", "selfieHint": "Your face appears in a circle at the bottom right, composed in as you record.", "mcLen": "Music card length", "mcStart": "No talking — just music", "mcing": "Building your music card…", "mcHint": "The card set to music, no need to speak; the music fades out over the last five seconds. 15 or 30 seconds is quick; “Whole track” waits for the music to finish.", "works": "My recordings", "noWorks": "Nothing yet. Record a few words, or set the card to music.", "delAsk": "Delete this recording?", "deleted": "Deleted", "saveIOSv": "Choose “Save Video” in the menu and it goes to your photos", "fadingOut": "Music fading out… (tap again to stop now)"}, "zs": {"emptyReply": "回覆是空的", "verseL": "经文：", "bless": "请小智写祝福", "blessing": "小智写作中…", "blessDone": "小智写好了", "blessHint": "可以自己写，也可以请小智照这节经文写一段关怀祝福；改完卡片会立刻跟着变。", "useMine": "用我的领受", "clearText": "不要内文", "noMine": "这段经文还没有你的领受，可以自己写一段", "chatErr": "小智连不上，请稍后再试。", "blessSys": "你是「小智」，国度321空中团契的属灵同伴。请照使用者给的这节经文，写一段温暖的关怀祝福，送给空中团契的家人。要求：先用一两句点出这节经文里神的心意，再写一句贴近家庭、职场与日常生活的祝福，最后用一句祝福收尾。总共三到四句、120 字以内，口语、温暖、不说教，不要标题、不要条列、不要引号、不要再抄一次经文。结尾只用「阿们」收束，不要写「奉主耶稣的名祷告」「奉耶稣的名求」这类句子。", "twSys": "你是「小智」，国度321空中团契的属灵同伴。请照使用者的要求，修改他给你的这段祝福。只回传改好的内文本身——不要解释、不要标题、不要条列、不要引号、不要再抄一次经文。保持温暖、口语、不说教。结尾只用「阿们」收束，不要写「奉主耶稣的名祷告」「奉耶稣的名求」这类句子。", "twCur": "\n\n目前的内文：\n", "twHow": "\n\n要怎么改：", "twBtn": "✨ 改一改", "twTitle": "要怎么改？", "twPh": "或者自己说，例如：加一句为他的服事祷告", "twGo": "改好给我", "twBusy": "小智修改中…", "twDone": "改好了", "twNeed": "卡片内文还是空的——先自己写一段，或请小智写一段再来改。", "twPicks": "短一点|长一点|更温暖|口语一点|更有力|换个说法", "close": "关闭", "loading": "载入中…", "all": "全部", "hyBtn": "🎵 从诗歌库选", "hyTitle": "诗歌库", "hyPh": "找歌名…", "hyNone": "找不到这首，换个字试试", "hyPicked": "已选好这首诗歌", "hyGetting": "载入诗歌中…", "hyNoList": "诗歌库暂时载入不到，请稍后再试，或改用「从档案选音乐」。", "hyBad": "这首载入失败，换一首试试", "hyCredit": "诗歌：", "hy404a": "找不到 ", "hy404b": "（根目录也找过了）　这个音档还没上传到网站上", "hyNet": "连不到音档（网路或离线）：", "hyEmpty": "　这个档是空的，请重新上传", "hyHtml": "　抓回来的不是音档，是网页（多半是 404 页面）", "hyAgain": "找到音档了，请再按一次 ▶", "hyHint": "诗歌放在自己的网站上，录影片时混得进去。下载与使用请遵守各诗歌的授权规定。", "bgm": "背景音乐（选用）", "bgmPick": "从档案选音乐", "bgmSwap": "换一首", "bgmDel": "移除音乐", "bgmVol": "音乐音量", "bgmNote": "录制时会自动循环；按「停止并完成」后音乐淡出五秒才结束。", "bgmHint": "选一首诗歌或轻音乐；若一时找不到，按选择视窗左下角「浏览」，再到 iCloud 云碟或「我的 iPhone」里找。", "bgmBad": "这不是音乐档，请选 mp3、m4a、wav 等音档", "bgmBig": "音档太大（超过 25MB），请选短一点的", "bgmAdded": "已加入背景音乐", "bgmNeed": "请先选一首背景音乐", "volLo": "小声", "volMid": "适中", "volHi": "明显", "len15": "15 秒", "len30": "30 秒", "len60": "1 分钟", "lenAll": "整首", "recSec": "录成影片", "recVoice": "🎙 只有声音", "recCard": "🖼 卡片画面", "recSelfie": "📷 自拍画面", "recVoiceD": "只录你的声音，存成语音档", "recCardD": "卡片＋你的声音，合成一支影片", "recSelfieD": "卡片＋你的脸＋声音，合成一支影片", "recIntro": "按下开始，对着手机把这段经文与领受读出来。可以只录声音，也可以把卡片、自拍合成一支影片直接传出去。", "recIntroA": "这台装置不支援合成影片，会先录成语音；播放时可用手机「荧幕录影」录成影片。", "recReady": "按下开始，把想说的话录进去", "recStartV": "开始录影片", "recStartS": "开始自拍录影", "recStartA": "开始录音", "recStop": "停止并完成", "recing": "录影中…", "recingA": "录音中…", "recBusy": "录制中不能换，先按「停止并完成」", "recTip": "建议 30～60 秒：先读经文，再说这段话对你的意思。", "recDoneV": "影片做好了！可以分享出去", "recDoneA": "录好了！可以播放或分享", "rvTitleV": "录好了，先看一下", "rvTitleA": "录好了，先听一下", "rvHint": "满意就存起来；不满意可以重录一次，或直接删掉不留。", "rvSave": "储存到我的作品", "rvShare": "分享出去", "rvAgain": "重录一次", "rvDrop": "删掉不留", "rvDropAsk": "这一段就不留了？", "rvDropped": "已删掉，没有存下来", "rvSaving": "存档中…", "rvLeaveAsk": "还没存起来，关掉就不见了，确定吗？", "saveErr": "存档失败：", "recNo": "这台装置不支援录音", "vidNo": "这台装置不支援自动合成影片", "micDeny": "无法使用麦克风，请允许权限", "camDeny": "无法使用相机，请允许权限", "selfieHint": "你的脸会以圆形贴在卡片右下角，录影时同步合成。", "mcLen": "音乐卡片长度", "mcStart": "不录音，只配音乐", "mcing": "音乐卡片制作中…", "mcHint": "卡片配上背景音乐做成影片，不必开口，结尾音乐淡出五秒。选 15 或 30 秒很快就好，选「整首」要等音乐播完。", "works": "我的作品", "noWorks": "还没有作品。录一段话或配一首音乐，就会出现在这里。", "delAsk": "删除这个作品？", "deleted": "已删除", "saveIOSv": "请在选单里选「储存影片」，就会存进相簿", "fadingOut": "音乐淡出中…（再按一次立即停止）"}};
const M = k => { const d = MI[L()] || MI.zh; return d[k] != null ? d[k] : (MI.zh[k] != null ? MI.zh[k] : k); };
const MUSIC_JSON = 'music.json', MUSIC_DIR = 'music/';
const CHAT_RETRY = [900, 1800];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const toast2 = (m, ms) => { toast(m); if (ms) { clearTimeout(toast.h); toast.h = setTimeout(() => { const t = $('#toast'); if (t) t.className = 'toast'; }, ms); } };

(function css() {
  if ($('#mxcss')) return;
  const s = document.createElement('style'); s.id = 'mxcss';
  s.textContent = '.recdot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#D23B3B;margin-right:6px;vertical-align:middle;animation:mxblink 1s infinite}@keyframes mxblink{50%{opacity:.25}}' +
    '.mxtm{font-family:var(--serif);font-size:30px;margin:6px 0;text-align:center}' +
    '.mxst{text-align:center;font-size:.9em;color:var(--mute)}' +
    '.btn.danger{background:#C0392B;border-color:#C0392B;color:#fff}.btn.block{display:flex;width:100%;margin-top:8px}' +
    '.hymnrow{display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid var(--line);cursor:pointer}.hymnrow:last-child{border-bottom:0}' +
    '.hymnplay{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--soft);flex:none;cursor:pointer;font-size:14px}' +
    '.hymnrow .meta{flex:1;min-width:0}.hymnrow .t{font-weight:600}.hymnrow .s{font-size:.8em;color:var(--mute)}.hymnrow .chev{color:var(--mute)}' +
    '.mxwork{padding:10px 0;border-bottom:1px solid var(--line)}.mxwork:last-child{border-bottom:0}.mxwork .q{font-family:var(--serif);line-height:1.6}' +
    '.mxwork .m{display:flex;justify-content:space-between;align-items:center;font-size:.82em;color:var(--mute);margin-top:4px}' +
    '.mxwork .m button{border:1px solid var(--line);background:var(--card);border-radius:10px;min-width:38px;height:32px;margin-left:6px;cursor:pointer}' +
    '.mxself{width:150px;height:150px;border-radius:50%;object-fit:cover;transform:scaleX(-1);border:3px solid var(--gold);background:#000}' +
    '.mxnote-acts{display:flex;flex-wrap:wrap;gap:8px;margin:-4px 0 6px}';
  document.head.appendChild(s);
})();

function mx_u32(b,p){return b[p]*16777216+b[p+1]*65536+b[p+2]*256+b[p+3];}
function mx_i32(b,p){const v=mx_u32(b,p);return v>=2147483648?v-4294967296:v;}
function mx_u64(b,p){return mx_u32(b,p)*4294967296+mx_u32(b,p+4);}
function mx_typ(b,p){return String.fromCharCode(b[p],b[p+1],b[p+2],b[p+3]);}

function mx_boxes(b,start,end){
  const out=[];let p=start;
  while(p+8<=end){
    let size=mx_u32(b,p),hs=8;
    if(size===1){size=mx_u64(b,p+8);hs=16;}
    else if(size===0)size=end-p;
    if(size<8||p+size>end)break;
    out.push({type:mx_typ(b,p+4),start:p,size:size,hs:hs,body:p+hs,end:p+size});
    p+=size;
  }
  return out;
}
function mx_find(list,t){return list.filter(x=>x.type===t);}
function mx_one(list,t){const r=mx_find(list,t);return r.length?r[0]:null;}
function mx_children(b,mx_box){return mx_boxes(b,mx_box.body,mx_box.end);}

function mx_parseTrun(b,tr,tfhd,baseOffset){
  const flags=mx_u32(b,tr.body)&0xffffff;
  const cnt=mx_u32(b,tr.body+4);
  let p=tr.body+8;
  let dataOff=0;
  if(flags&0x1){dataOff=mx_i32(b,p);p+=4;}
  let firstFlags=null;
  if(flags&0x4){firstFlags=mx_u32(b,p);p+=4;}
  const samples=[];
  let off=baseOffset+dataOff;
  for(let i=0;i<cnt;i++){
    let dur=tfhd.defDur, size=tfhd.defSize, fl=tfhd.defFlags, cto=0;
    if(flags&0x100){dur=mx_u32(b,p);p+=4;}
    if(flags&0x200){size=mx_u32(b,p);p+=4;}
    if(flags&0x400){fl=mx_u32(b,p);p+=4;}
    if(flags&0x800){cto=mx_i32(b,p);p+=4;}
    if(i===0&&firstFlags!==null)fl=firstFlags;
    samples.push({off:off,size:size,dur:dur,cto:cto,sync:!(fl&0x10000)});
    off+=size;
  }
  return {samples:samples,dataOff:dataOff};
}

function mx_parseTfhd(b,mx_box){
  const flags=mx_u32(b,mx_box.body)&0xffffff;
  const trackId=mx_u32(b,mx_box.body+4);
  let p=mx_box.body+8;
  let base=null;
  if(flags&0x1){base=mx_u64(b,p);p+=8;}
  if(flags&0x2){p+=4;}
  let defDur=0,defSize=0,defFlags=0;
  if(flags&0x8){defDur=mx_u32(b,p);p+=4;}
  if(flags&0x10){defSize=mx_u32(b,p);p+=4;}
  if(flags&0x20){defFlags=mx_u32(b,p);p+=4;}
  return {trackId:trackId,base:base,defDur:defDur,defSize:defSize,defFlags:defFlags,
          defaultBaseIsMoof:!!(flags&0x020000),hasBase:!!(flags&0x1)};
}

/* ---- 產生 mx_box ---- */
function mx_box(type,...parts){
  let len=8;parts.forEach(p=>len+=p.length);
  const head=new Uint8Array(8);
  head[0]=(len>>>24)&255;head[1]=(len>>>16)&255;head[2]=(len>>>8)&255;head[3]=len&255;
  for(let i=0;i<4;i++)head[4+i]=type.charCodeAt(i);
  const out=new Uint8Array(len);out.set(head,0);
  let p=8;parts.forEach(x=>{out.set(x,p);p+=x.length;});
  return out;
}
function mx_b32(v){return new Uint8Array([(v>>>24)&255,(v>>>16)&255,(v>>>8)&255,v&255]);}
function mx_b64(v){const hi=Math.floor(v/4294967296),lo=v>>>0;
  return new Uint8Array([(hi>>>24)&255,(hi>>>16)&255,(hi>>>8)&255,hi&255,
                         (lo>>>24)&255,(lo>>>16)&255,(lo>>>8)&255,lo&255]);}
function mx_cat(arr){let n=0;arr.forEach(a=>n+=a.length);const o=new Uint8Array(n);let p=0;
  arr.forEach(a=>{o.set(a,p);p+=a.length;});return o;}

function mx_remux(bytes){
  const b=bytes;
  const top=mx_boxes(b,0,b.length);
  const ftyp=mx_one(top,"ftyp");
  const moov=mx_one(top,"moov");
  if(!moov)throw new Error("no moov");
  const moofs=mx_find(top,"moof");
  if(!moofs.length)return null;              /* 不是分段 MP4，不用處理 */

  const mvBoxes=mx_children(b,moov);
  const mvhd=mx_one(mvBoxes,"mvhd");
  const mvTimescale=mx_u32(b,mvhd.body+(b[mvhd.body]===1?20:12));
  const traks=mx_find(mvBoxes,"trak");

  /* 收集每個 track 的所有 sample */
  const tracks={};
  traks.forEach(tk=>{
    const tkhd=mx_one(mx_children(b,tk),"tkhd");
    const v=b[tkhd.body];
    const id=mx_u32(b,tkhd.body+(v===1?20:12));
    tracks[id]={trak:tk,samples:[]};
  });

  moofs.forEach(mf=>{
    const trafs=mx_find(mx_children(b,mf),"traf");
    trafs.forEach(tf=>{
      const tfc=mx_children(b,tf);
      const tfhdBox=mx_one(tfc,"tfhd");
      if(!tfhdBox)return;
      const tfhd=mx_parseTfhd(b,tfhdBox);
      const t=tracks[tfhd.trackId];
      if(!t)return;
      /* 基準位移：預設是 moof 起點（default-base-is-moof） */
      const base=tfhd.hasBase?tfhd.base:mf.start;
      let running=null;
      mx_find(tfc,"trun").forEach(tr=>{
        const flags=mx_u32(b,tr.body)&0xffffff;
        const hasOff=!!(flags&0x1);
        const r=mx_parseTrun(b,tr,tfhd,hasOff?base:(running===null?base:running));
        r.samples.forEach(s=>t.samples.push(s));
        if(r.samples.length){
          const last=r.samples[r.samples.length-1];
          running=last.off+last.size;
        }
      });
    });
  });

  /* 依序把 sample 資料集中成一個 mdat */
  const order=[];
  Object.keys(tracks).forEach(id=>{
    tracks[id].samples.forEach((s,i)=>order.push({id:+id,i:i,off:s.off,size:s.size}));
  });
  order.sort((a,b2)=>a.off-b2.off);
  let mdatSize=0;order.forEach(o=>mdatSize+=o.size);

  const newOff={};
  let cur=0;
  order.forEach(o=>{
    if(!newOff[o.id])newOff[o.id]=[];
    newOff[o.id][o.i]=cur;cur+=o.size;
  });

  /* ---- 為每個 track 重建 stbl ---- */
  function buildStbl(id,stblOld,mediaTimescale){
    const ss=tracks[id].samples;
    const offs=newOff[id]||[];
    const old=mx_children(b,stblOld);
    const keep=[];
    ["stsd"].forEach(t=>{const x=mx_one(old,t);if(x)keep.push(b.slice(x.start,x.end));});

    /* stts */
    const stts=[];
    let runDur=-1,runCnt=0;
    ss.forEach(s=>{
      if(s.dur===runDur){runCnt++;}
      else{if(runCnt)stts.push([runCnt,runDur]);runDur=s.dur;runCnt=1;}
    });
    if(runCnt)stts.push([runCnt,runDur]);
    const sttsBody=[mx_b32(0),mx_b32(stts.length)];
    stts.forEach(e=>{sttsBody.push(mx_b32(e[0]));sttsBody.push(mx_b32(e[1]));});
    keep.push(mx_box("stts",mx_cat(sttsBody)));

    /* ctts（若有 composition offset） */
    if(ss.some(s=>s.cto!==0)){
      const ctts=[];let rv=null,rc=0;
      ss.forEach(s=>{if(s.cto===rv){rc++;}else{if(rc)ctts.push([rc,rv]);rv=s.cto;rc=1;}});
      if(rc)ctts.push([rc,rv]);
      const body=[new Uint8Array([1,0,0,0]),mx_b32(ctts.length)];
      ctts.forEach(e=>{body.push(mx_b32(e[0]));body.push(mx_b32(e[1]>>>0));});
      keep.push(mx_box("ctts",mx_cat(body)));
    }

    /* stss（關鍵影格）*/
    const syncs=[];
    ss.forEach((s,i)=>{if(s.sync)syncs.push(i+1);});
    if(syncs.length&&syncs.length!==ss.length){
      const body=[mx_b32(0),mx_b32(syncs.length)];
      syncs.forEach(v=>body.push(mx_b32(v)));
      keep.push(mx_box("stss",mx_cat(body)));
    }

    /* stsc：每個 sample 自成一個 chunk，最單純也最不會出錯 */
    keep.push(mx_box("stsc",mx_cat([mx_b32(0),mx_b32(1),mx_b32(1),mx_b32(1),mx_b32(1)])));

    /* stsz */
    const szBody=[mx_b32(0),mx_b32(0),mx_b32(ss.length)];
    ss.forEach(s=>szBody.push(mx_b32(s.size)));
    keep.push(mx_box("stsz",mx_cat(szBody)));

    /* co64：用 64 位元，長度固定，才好兩段式計算位移 */
    const coBody=[mx_b32(0),mx_b32(ss.length)];
    ss.forEach((s,i)=>coBody.push(mx_b64(offs[i]||0)));
    keep.push({__co:true,data:mx_cat(coBody),count:ss.length});

    return keep;
  }

  /* 兩段式：先算出 moov 長度，再填入真正的 chunk 位移 */
  function assemble(mdatStart){
    const newTraks=[];
    traks.forEach(tk=>{
      const tkc=mx_children(b,tk);
      const tkhd=mx_one(tkc,"tkhd");
      const v=b[tkhd.body];
      const id=mx_u32(b,tkhd.body+(v===1?20:12));
      const mdia=mx_one(tkc,"mdia");
      const mdc=mx_children(b,mdia);
      const mdhd=mx_one(mdc,"mdhd");
      const mv=b[mdhd.body];
      const mts=mx_u32(b,mdhd.body+(mv===1?20:12));
      const ss=tracks[id].samples;
      let dur=0;ss.forEach(s=>dur+=s.dur);

      /* tkhd：填入 movie timescale 的時長 */
      const tkhdBuf=b.slice(tkhd.start,tkhd.end);
      const mvDur=Math.round(dur/mts*mvTimescale);
      if(v===1)writeU64(tkhdBuf,tkhd.body-tkhd.start+28,mvDur);
      else writeU32(tkhdBuf,tkhd.body-tkhd.start+20,mvDur);

      /* mdhd：填入 media timescale 的時長 */
      const mdhdBuf=b.slice(mdhd.start,mdhd.end);
      if(mv===1)writeU64(mdhdBuf,mdhd.body-mdhd.start+24,dur);
      else writeU32(mdhdBuf,mdhd.body-mdhd.start+16,dur);

      const minf=mx_one(mdc,"minf");
      const mic=mx_children(b,minf);
      const stbl=mx_one(mic,"stbl");
      const parts=buildStbl(id,stbl,mts);
      const stblParts=parts.map(x=>x.__co?mx_box("co64",x.data):x);
      const newStbl=mx_box("stbl",...stblParts);
      const minfParts=mic.map(x=>x.type==="stbl"?newStbl:b.slice(x.start,x.end));
      const newMinf=mx_box("minf",...minfParts);
      const mdiaParts=mdc.map(x=>x.type==="minf"?newMinf:(x.type==="mdhd"?mdhdBuf:b.slice(x.start,x.end)));
      const newMdia=mx_box("mdia",...mdiaParts);
      const trakParts=tkc.filter(x=>x.type!=="edts").map(x=>
        x.type==="mdia"?newMdia:(x.type==="tkhd"?tkhdBuf:b.slice(x.start,x.end)));
      newTraks.push(mx_box("trak",...trakParts));
    });

    /* mvhd：填入整體時長 */
    let maxDur=0;
    Object.keys(tracks).forEach(id=>{
      const tk=tracks[id];const trak=tk.trak;
      const mdhd=mx_one(mx_children(b,mx_one(mx_children(b,trak),"mdia")),"mdhd");
      const mv=b[mdhd.body];
      const mts=mx_u32(b,mdhd.body+(mv===1?20:12));
      let d=0;tk.samples.forEach(s=>d+=s.dur);
      maxDur=Math.max(maxDur,Math.round(d/mts*mvTimescale));
    });
    const mvhdBuf=b.slice(mvhd.start,mvhd.end);
    if(b[mvhd.body]===1)writeU64(mvhdBuf,mvhd.body-mvhd.start+24,maxDur);
    else writeU32(mvhdBuf,mvhd.body-mvhd.start+16,maxDur);

    return mx_box("moov",mvhdBuf,...newTraks);
  }

  function writeU32(buf,p,v){buf[p]=(v>>>24)&255;buf[p+1]=(v>>>16)&255;buf[p+2]=(v>>>8)&255;buf[p+3]=v&255;}
  function writeU64(buf,p,v){const hi=Math.floor(v/4294967296),lo=v>>>0;
    writeU32(buf,p,hi);writeU32(buf,p+4,lo);}

  const ftypBuf=ftyp?b.slice(ftyp.start,ftyp.end)
                    :mx_box("ftyp",mx_strBytes("isom"),mx_b32(512),mx_strBytes("isomiso2avc1mp41"));
  const pass1=assemble(0);
  const mdatStart=ftypBuf.length+pass1.length+16;   /* 16 = mdat 的 64 位元表頭 */
  Object.keys(newOff).forEach(id=>{
    newOff[id]=newOff[id].map(v=>v+mdatStart);
  });
  const moovNew=assemble(mdatStart);

  /* 組出 mdat（64 位元長度） */
  const mdatHead=new Uint8Array(16);
  mdatHead[3]=1;
  "mdat".split("").forEach((c,i)=>mdatHead[4+i]=c.charCodeAt(0));
  const total=mdatSize+16;
  const hi=Math.floor(total/4294967296),lo=total>>>0;
  writeU32(mdatHead,8,hi);writeU32(mdatHead,12,lo);

  const out=new Uint8Array(ftypBuf.length+moovNew.length+16+mdatSize);
  let p=0;
  out.set(ftypBuf,p);p+=ftypBuf.length;
  out.set(moovNew,p);p+=moovNew.length;
  out.set(mdatHead,p);p+=16;
  order.forEach(o=>{out.set(b.subarray(o.off,o.off+o.size),p);p+=o.size;});
  return out;
}
function mx_strBytes(s){const a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a;}

/* 只處理分段 MP4；其他格式或失敗時原封不動回傳，不影響既有流程 */
async function fixVideoBlob(blob, mime){
  try{
    if (!blob || !/mp4/i.test(mime || blob.type || '')) return blob;
    const buf = new Uint8Array(await blob.arrayBuffer());
    const out = mx_remux(buf);
    if (!out || !out.length) return blob;
    return new Blob([out], { type:'video/mp4' });
  }catch(e){ return blob; }
}


/* ================= 小智寫祝福／改一改 ================= */
let blessBusy = false;
function cardRef() { return (X.studio && X.studio.ref) || ''; }
function whoLine() {
  const who = trim(S.card && S.card.to);
  if (!who) return '';
  return isEN() ? '\nThis is written for "' + who + '" — speak directly to them, but do not repeat the greeting.'
       : isZS() ? '\n这段话是写给“' + who + '”的，请直接对他说话，但不要再写一次称呼。'
       : '\n這段話是寫給「' + who + '」的，請直接對他說話，但不要再寫一次稱呼。';
}
// 祝福結尾只留「阿們」：拿掉「奉主耶穌（基督）的名禱告／祈求／求」等字句（繁簡英）
function amenOnly(t) {
  return t.replace(/[，,。\s]*(?:我們|我们)?(?:奉|靠著|靠着)(?:主)?耶(?:穌|稣)(?:基督)?(?:的)?(?:聖名|圣名|名)(?:禱告|祷告|祈求|求|祝福)?(?:[，,。、！!\s]*)(?=(?:阿們|阿们)|$)/g, '。')
    .replace(/[,.\s]*(?:we pray )?in (?:(?:the )?(?:holy )?name of (?:the Lord )?Jesus(?: Christ)?|Jesus['’]?s? name)(?:,? we pray)?[,.\s]*(?=Amen|$)/gi, '. ')
    .replace(/。+\s*(阿們|阿们)/g, '。$1').replace(/^。/, '').replace(/\.\s+Amen/g, '. Amen').trim();
}
async function aiOnce(sys, ask) {
  let out = '', why = '';
  for (let a = 0; a <= CHAT_RETRY.length; a++) {
    try {
      const r = await fetch(SVC.xz, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: SVC.model, max_tokens: 600, system: sys, messages: [{ role: 'user', content: ask }] }) });
      if (!r.ok) throw new Error('http ' + r.status);
      out = extractReply(await r.json().catch(() => null));
      if (!out) why = M('emptyReply');
      break;
    } catch (e) {
      why = (e && e.message) ? String(e.message) : 'network';
      if (a === CHAT_RETRY.length) break;
      await sleep(CHAT_RETRY[a]);
    }
  }
  return { out: out ? amenOnly(out.replace(/[*#>`]/g, '').replace(/^「|」$/g, '').trim()) : '', why };
}
function setNote(txt) {
  X.studio.n = txt;
  const ta = $('#studioOv [data-c="n"]'); if (ta) ta.value = txt;
  renderCard();
}
function verseAsk() { return M('verseL') + X.studio.t + '（' + cardRef() + '）' + whoLine(); }
async function blessWrite() {
  if (blessBusy || !X.studio) return;
  blessBusy = true;
  const btn = $('#mxBless'); if (btn) { btn.disabled = true; btn.textContent = M('blessing'); }
  const r = await aiOnce((M('blessSys') + X.AUD_WRITE()), verseAsk());
  blessBusy = false;
  if (btn) { btn.disabled = false; btn.textContent = '✍️ ' + M('bless'); }
  if (r.out) { setNote(r.out); toast(M('blessDone')); }
  else toast2(M('chatErr') + (r.why ? '（' + r.why + '）' : ''), 4000);
}
async function noteRewrite(instr) {
  if (blessBusy || !X.studio) return;
  const cur = trim(X.studio.n);
  if (!cur) { toast2(M('twNeed'), 4200); return; }
  blessBusy = true;
  const go = $('#twGo'); if (go) { go.disabled = true; go.textContent = M('twBusy'); }
  const ask = verseAsk() + M('twCur') + cur + M('twHow') + instr;
  const r = await aiOnce((M('twSys') + X.AUD_WRITE()), ask);
  blessBusy = false;
  if (r.out) { closeHSheet(); setNote(r.out); toast(M('twDone')); }
  else { if (go) { go.disabled = false; go.textContent = M('twGo'); } toast2(M('chatErr') + (r.why ? '（' + r.why + '）' : ''), 4000); }
}
function openTweak() {
  if (!X.studio) return;
  if (!trim(X.studio.n)) { toast2(M('twNeed'), 4200); return; }
  const picks = M('twPicks').split('|');
  const m = openHSheet('<div class="sheet-title">' + esc(M('twTitle')) + '</div>' +
    '<div class="chips" style="flex-wrap:wrap" id="twPick">' + picks.map(p => '<button class="chip" data-q="' + esc(p) + '">' + esc(p) + '</button>').join('') + '</div>' +
    '<input type="text" id="twOwn" placeholder="' + esc(M('twPh')) + '" style="margin-top:10px">' +
    '<div class="sheet-acts" style="margin-top:12px"><button class="btn pri" id="twGo">' + esc(M('twGo')) + '</button><button class="btn" id="twClose">' + esc(M('close')) + '</button></div>');
  m.onclick = e => { if (e.target === m && !blessBusy) closeHSheet(); };
  $('#twClose').onclick = () => { if (!blessBusy) closeHSheet(); };
  const own = $('#twOwn');
  $$('#twPick button').forEach(b => b.onclick = () => { $$('#twPick button').forEach(x => x.classList.toggle('on', x === b)); own.value = ''; });
  $('#twGo').onclick = () => { const p = $('#twPick button.on'); noteRewrite(trim(own.value) || (p ? p.getAttribute('data-q') : picks[0])); };
}

/* ================= 背景音樂與詩歌庫 ================= */
let bgmBlob = null, bgmName = '', bgmCredit = '', bgmVol = 0.22, mcLen = 30;
const BGM_VOLS = [[0.12, 'volLo'], [0.22, 'volMid'], [0.38, 'volHi']];
const MC_LENS = [[15, 'len15'], [30, 'len30'], [60, 'len60'], [0, 'lenAll']];
const AUD_EXT = /\.(mp3|m4a|aac|wav|aif|aiff|caf|flac|ogg|opus|mp4|mov|webm|wma)$/i;
const songName = s => (isEN() ? (s.ne || s.n) : (isZS() ? (s.ns || s.n) : s.n)) || s.f || '';
let hymnList = null, hymnPrev = null, hymnEl = null, musicBase = null;
function hymnAudio() {
  if (hymnEl) return hymnEl;
  hymnEl = document.createElement('audio'); hymnEl.preload = 'auto'; hymnEl.playsInline = true;
  ['playsinline', 'webkit-playsinline'].forEach(a => hymnEl.setAttribute(a, ''));
  hymnEl.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.appendChild(hymnEl); return hymnEl;
}
async function musicProbe(list) {
  if (musicBase !== null || !list || !list.length) return;
  const max = Math.min(list.length, 12);
  for (let i = 0; i < max; i++) {
    const name = encodeURIComponent(list[i].f);
    for (const b of [MROOT + MUSIC_DIR, MROOT]) {
      try { const r = await fetch(b + name + '?v=' + APPVER, { method: 'HEAD' }); if (r.ok) { musicBase = b; return; } } catch (e) { }
    }
  }
}
async function hymnLoadList() {
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
function hymnStopPrev() { if (hymnEl) { try { hymnEl.pause(); } catch (e) { } } hymnPrev = null; $$('.hymnplay').forEach(b => b.textContent = '▶'); }
async function hymnFetch(s) {
  const name = encodeURIComponent(s.f), tries = musicBase !== null ? [musicBase] : [MROOT + MUSIC_DIR, MROOT];
  let why = '';
  for (const b of tries) {
    const path = b + name; let r;
    try { r = await fetch(path + '?v=' + APPVER); } catch (e) { why = M('hyNet') + path; continue; }
    if (r.status === 404) { why = why || (M('hy404a') + MUSIC_DIR + s.f + M('hy404b')); continue; }
    if (!r.ok) { why = path + '：HTTP ' + r.status; continue; }
    const blob = await r.blob();
    if (!blob.size) { why = path + M('hyEmpty'); continue; }
    if (/(^|,)text\/html/.test(blob.type || '')) { why = path + M('hyHtml'); continue; }
    musicBase = b; return blob;
  }
  throw new Error(why || M('hyBad'));
}
function openHymns() {
  const m = openHSheet('<div class="sheet-title">' + esc(M('hyTitle')) + '</div>' +
    '<input type="text" id="hyQ" placeholder="' + esc(M('hyPh')) + '" style="margin-bottom:8px"><div class="chips" style="flex-wrap:wrap" id="hyTags"></div><div id="hyList"></div>' +
    '<div class="sheet-acts" style="margin-top:12px"><button class="btn" id="hyClose">' + esc(M('close')) + '</button></div><div class="xs muted">' + esc(M('hyHint')) + '</div>');
  const shut = () => { hymnStopPrev(); closeHSheet(); };
  m.onclick = e => { if (e.target === m) shut(); };
  $('#hyClose').onclick = shut;
  const box = $('#hyList'), tagBox = $('#hyTags'), inp = $('#hyQ');
  let tag = '';
  box.innerHTML = '<div class="empty">' + esc(M('loading')) + '</div>';
  const paint = () => {
    const q = trim(inp.value).toLowerCase();
    const list = (hymnList || []).filter(s => {
      if (tag && (s.tag || '') !== tag) return false;
      return !q || (songName(s) + ' ' + (s.n || '') + ' ' + (s.ne || '') + ' ' + (s.by || '')).toLowerCase().indexOf(q) >= 0;
    });
    if (!list.length) { box.innerHTML = '<div class="empty">' + esc(M('hyNone')) + '</div>'; return; }
    box.innerHTML = list.map(s => { const i = hymnList.indexOf(s);
      return '<div class="hymnrow" data-i="' + i + '"><button class="hymnplay" data-p="' + i + '">▶</button><div class="meta"><div class="t">' + esc(songName(s)) + '</div><div class="s">' + esc([s.by, s.tag].filter(Boolean).join('　·　')) + '</div></div><div class="chev">›</div></div>'; }).join('');
    $$('.hymnrow', box).forEach(row => {
      row.onclick = async e => {
        if (e.target.closest('.hymnplay')) return;
        const s = hymnList[+row.getAttribute('data-i')]; if (!s) return;
        hymnStopPrev(); toast2(M('hyGetting'), 8000);
        try { bgmBlob = await hymnFetch(s); bgmName = songName(s); bgmCredit = M('hyCredit') + songName(s) + (s.by ? '／' + s.by : ''); shut(); toast(M('hyPicked')); paintBox(); }
        catch (err) { toast2((err && err.message) || M('hyBad'), 7000); }
      };
    });
    $$('.hymnplay', box).forEach(b => {
      b.onclick = () => {
        const s = hymnList[+b.getAttribute('data-p')]; if (!s) return;
        const playing = hymnPrev === b; hymnStopPrev(); if (playing) return;
        const a = hymnAudio();
        a.onended = hymnStopPrev; a.src = (musicBase !== null ? musicBase : MROOT + MUSIC_DIR) + encodeURIComponent(s.f);
        hymnPrev = b; b.textContent = '⏸';
        const q = a.play(); /* 必須在點擊當下同步呼叫，iPhone 才放得出聲音 */
        if (q && q.catch) q.catch(() => { hymnStopPrev(); hymnFetch(s).then(() => toast2(M('hyAgain'), 5000)).catch(err => toast2((err && err.message) || M('hyBad'), 7000)); });
      };
    });
  };
  inp.oninput = paint;
  hymnLoadList().then(async list => {
    if (!list.length) { box.innerHTML = '<div class="empty">' + esc(M('hyNoList')) + '</div>'; return; }
    await musicProbe(list);
    const tags = []; list.forEach(s => { if (s.tag && tags.indexOf(s.tag) < 0) tags.push(s.tag); });
    if (tags.length > 1) {
      tagBox.innerHTML = '<button class="chip on" data-t="">' + esc(M('all')) + '</button>' + tags.map(x => '<button class="chip" data-t="' + esc(x) + '">' + esc(x) + '</button>').join('');
      $$('button', tagBox).forEach(b => b.onclick = () => { tag = b.getAttribute('data-t'); $$('button', tagBox).forEach(x => x.classList.toggle('on', x === b)); paint(); });
    }
    paint();
  }).catch(() => { box.innerHTML = '<div class="empty">' + esc(M('hyNoList')) + '</div>'; });
}
function pickBgm(inp) {
  const f = inp && inp.files && inp.files[0]; if (!f) return;
  const ok = (f.type && (f.type.indexOf('audio') === 0 || f.type.indexOf('video') === 0)) || AUD_EXT.test(f.name || '');
  if (!ok) { toast(M('bgmBad')); return; }
  if (f.size > 25 * 1024 * 1024) { toast(M('bgmBig')); return; }
  bgmBlob = f; bgmName = f.name || M('bgm'); bgmCredit = ''; paintBox(); toast(M('bgmAdded'));
}

/* ================= 作品庫（IndexedDB） ================= */
let wdb = null;
function openWDB() {
  return new Promise(r => {
    try {
      const q = indexedDB.open('k321_works', 1);
      q.onupgradeneeded = e => { e.target.result.createObjectStore('rec', { keyPath: 'id' }); };
      q.onsuccess = e => { wdb = e.target.result; r(wdb); };
      q.onerror = () => r(null);
    } catch (e) { r(null); }
  });
}
const wtx = mode => wdb.transaction('rec', mode).objectStore('rec');
const putRec = o => new Promise(r => { const q = wtx('readwrite').put(o); q.onsuccess = () => r(1); q.onerror = () => r(0); });
const allRec = () => new Promise(r => { if (!wdb) return r([]); const q = wtx('readonly').getAll(); q.onsuccess = () => r(q.result || []); q.onerror = () => r([]); });
const delRec = id => new Promise(r => { const q = wtx('readwrite').delete(id); q.onsuccess = () => r(1); q.onerror = () => r(0); });

/* ================= 錄製 ================= */
let selfEl = null, mr = null, chunks = [], recTimer = null, recSec = 0, recAnim = 0, recMode = 'c', selfieStream = null, liveEl = null, recBtnId = '';
const isSelfie = () => recMode === 's';
const recording = () => !!(mr && mr.state === 'recording');
const sup = m => { try { return window.MediaRecorder && MediaRecorder.isTypeSupported(m); } catch (e) { return false; } };
const vidMime = () => ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(sup) || '';
const audMime = () => ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(sup) || '';
const canVideo = () => !!(vidMime() && HTMLCanvasElement.prototype.captureStream);
const extOf = m => (m || '').indexOf('mp4') >= 0 ? (m.indexOf('video') === 0 ? '.mp4' : '.m4a') : '.webm';
const fmtT = s => pad(Math.floor(s / 60)) + ':' + pad(s % 60);

function attachSelfie() {
  const el = $('#selfiePrev'); if (!el || !selfieStream) return;
  el.muted = true; el.defaultMuted = true; el.playsInline = true;
  ['playsinline', 'webkit-playsinline', 'muted', 'autoplay'].forEach(a => el.setAttribute(a, ''));
  if (el.srcObject !== selfieStream) el.srcObject = selfieStream;
  const go2 = () => { const q = el.play(); if (q && q.catch) q.catch(() => { }); };
  el.onloadedmetadata = go2; go2();
  [80, 300, 800, 1600].forEach(ms => setTimeout(go2, ms));
}
function stopSelfie() {
  try { if (selfieStream) selfieStream.getTracks().forEach(t => t.stop()); } catch (e) { }
  const el = $('#selfiePrev'); if (el) { try { el.pause(); } catch (e) { } el.srcObject = null; }
  selfieStream = null;
}
async function setRecMode(m) {
  if (recording()) { toast2(M('recBusy'), 2400); return; }
  recMode = m;
  if (m !== 's') { stopSelfie(); paintBox(); toast(M(m === 'a' ? 'recVoiceD' : 'recCardD')); return; }
  try { selfieStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }); }
  catch (e) { recMode = 'c'; toast(M('camDeny')); }
  paintBox();
  if (recMode === 's') { setTimeout(attachSelfie, 60); toast(M('recSelfieD')); }
}
function drawSelfieCircle(cx, vid, W, H, F) {
  if (!vid || !vid.videoWidth) return;
  const pd = Math.round(W * .085), R = Math.round(Math.min(W, H) * 0.115);
  const cxx = W - pd - R + 4 * F, cyy = H - pd - R - Math.round(60 * F);
  cx.save(); cx.shadowColor = 'rgba(0,0,0,.28)'; cx.shadowBlur = Math.round(22 * F); cx.shadowOffsetY = Math.round(8 * F);
  cx.beginPath(); cx.arc(cxx, cyy, R, 0, 7); cx.fillStyle = '#000'; cx.fill(); cx.restore();
  cx.save(); cx.beginPath(); cx.arc(cxx, cyy, R, 0, 7); cx.clip();
  const vw = vid.videoWidth, vh = vid.videoHeight, side = Math.min(vw, vh);
  cx.translate(cxx, cyy); cx.scale(-1, 1);
  cx.drawImage(vid, (vw - side) / 2, (vh - side) / 2, side, side, -R, -R, R * 2, R * 2);
  cx.restore();
  cx.beginPath(); cx.arc(cxx, cyy, R, 0, 7); cx.lineWidth = Math.max(3, W * .006); cx.strokeStyle = '#F4EFE3'; cx.stroke();
  cx.beginPath(); cx.arc(cxx, cyy, R + 4 * F, 0, 7); cx.lineWidth = Math.max(2, W * .003); cx.strokeStyle = 'rgba(212,166,91,.85)'; cx.stroke();
}
/* 卡片＋緩慢掃過的光暈；錄影就是把這張動態畫面錄下來 */
function liveCanvas(W, H, withSelfie) {
  const base = document.createElement('canvas'); drawCard(base, X.studio, W, H);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const cx = cv.getContext('2d'), t0 = performance.now(), F = W / 1080;
  const loop = () => {
    const el = (performance.now() - t0) / 1000, ph = (el / 16) % 2;
    cx.drawImage(base, 0, 0);
    const gx = W * (0.12 + 0.76 * (ph > 1 ? 2 - ph : ph));
    const rg = cx.createRadialGradient(gx, H * .12, 10, gx, H * .12, W * .55);
    rg.addColorStop(0, 'rgba(255,255,255,.10)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = rg; cx.fillRect(0, 0, W, H);
    if (withSelfie) drawSelfieCircle(cx, selfEl, W, H, F);
    if (bgmCredit) {
      cx.textAlign = 'center'; cx.font = Math.round(19 * F) + 'px ' + cardSans();
      cx.fillStyle = 'rgba(255,255,255,.62)'; cx.shadowColor = 'rgba(0,0,0,.55)'; cx.shadowBlur = Math.round(6 * F);
      cx.fillText(bgmCredit, W / 2, H - Math.round(22 * F)); cx.shadowColor = 'transparent';
    }
    recAnim = requestAnimationFrame(loop);
  };
  loop();
  cv.style.cssText = 'width:100%;max-width:300px;border-radius:14px;display:block;margin:0 auto;box-shadow:0 6px 20px rgba(0,0,0,.14)';
  liveEl = cv; placeLive();
  return cv;
}
/* 自拍時 <video> 不能 display:none —— iPhone 一藏起來就停止送畫面，臉會凍住 */
function placeLive() {
  const lb = $('#liveBox'); if (lb && liveEl) { lb.innerHTML = ''; lb.appendChild(liveEl); lb.hidden = false; }
  const sw = $('#selfieWrap');
  if (sw) { if (isSelfie()) sw.style.cssText = 'position:absolute;width:2px;height:2px;opacity:.01;overflow:hidden;pointer-events:none;z-index:-1'; else sw.style.display = 'none'; }
}
function recTick(label) {
  const st = $('#recSt'); if (st) st.innerHTML = '<span class="recdot"></span>' + esc(label);
  recTick.label = label;
  recTimer = setInterval(() => { recSec++; const e = $('#recTm'); if (e) e.textContent = fmtT(recSec); }, 1000);
}
function recEnd() { clearInterval(recTimer); cancelAnimationFrame(recAnim); liveEl = null; recBtnId = ''; X.BUSY = false; setTimeout(function () { if (window.updIdle && !recording()) updIdle(); }, 60000); }
async function finishRec(blob, type, kind) {
  mr = null; const dur = recSec;
  try { if (kind === 'video') blob = await fixVideoBlob(blob, type); } catch (e) { }
  paintBox();
  openReview(blob, blob.type || type, kind, dur);
}
async function saveWork(blob, type, kind, dur) {
  try {
    if (!wdb) await openWDB();
    if (!wdb) throw new Error('IndexedDB');
    await putRec({ id: uid(), ts: now(), blob, mime: blob.type || type, kind, dur: dur || 0, v: X.studio.t, r: cardRef(), n: X.studio.n || '' });
    paintBox(); toast2(kind === 'video' ? M('recDoneV') : M('recDoneA'), 3600); return true;
  } catch (e) { toast2(M('saveErr') + (e && e.message || e), 4000); return false; }
}
function fileName(kind, mime) { return '321church-' + (kind === 'video' ? 'video' : 'voice') + '-' + now() + extOf(mime); }
async function shareBlob(blob, mime, kind, dlOnly) {
  const name = fileName(kind, mime);
  let f = null; try { f = new File([blob], name, { type: mime }); } catch (e) { }
  if (f && navigator.canShare && navigator.canShare({ files: [f] }) && (!dlOnly || isIOS())) {
    if (isIOS()) toast2(M('saveIOSv'), 5000);
    try { await navigator.share({ files: [f], title: T('appName') }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(u), 6000); toast2(T('savedFile'), 3200);
}
let rvURL = null;
function openReview(blob, mime, kind, dur) {
  if (rvURL) { try { URL.revokeObjectURL(rvURL); } catch (e) { } }
  rvURL = URL.createObjectURL(blob);
  let kept = false;
  const m = openHSheet('<div class="sheet-title">' + esc(kind === 'video' ? M('rvTitleV') : M('rvTitleA')) + '</div><div>' +
    (kind === 'video' ? '<video id="rvMedia" src="' + rvURL + '" controls playsinline webkit-playsinline autoplay style="width:100%;max-height:52vh;border-radius:14px;display:block;background:#000"></video>'
      : '<audio id="rvMedia" src="' + rvURL + '" controls autoplay style="width:100%"></audio>') +
    '</div><div class="xs muted" style="margin:10px 0 4px">' + esc(M('rvHint')) + '</div>' +
    '<button class="btn pri block" id="rvSave">' + esc(M('rvSave')) + '</button><button class="btn gold block" id="rvShare">↗ ' + esc(M('rvShare')) + '</button>' +
    '<button class="btn block" id="rvAgain">' + esc(M('rvAgain')) + '</button><button class="btn danger block" id="rvDrop">' + esc(M('rvDrop')) + '</button>');
  const shut = () => { const v = $('#rvMedia'); try { if (v) { v.pause(); v.removeAttribute('src'); } } catch (e) { } closeHSheet(); if (rvURL) { try { URL.revokeObjectURL(rvURL); } catch (e) { } rvURL = null; } };
  m.onclick = e => { if (e.target === m && (kept || confirm(M('rvLeaveAsk')))) shut(); };
  $('#rvSave').onclick = async () => { const b = $('#rvSave'); b.disabled = true; b.textContent = M('rvSaving'); const ok = await saveWork(blob, mime, kind, dur); if (ok) { kept = true; shut(); } else { b.disabled = false; b.textContent = M('rvSave'); } };
  $('#rvShare').onclick = () => shareBlob(blob, mime, kind);
  $('#rvAgain').onclick = async () => { shut(); if (recMode === 's') { await setRecMode('s'); await sleep(450); } toggleRec(); };
  $('#rvDrop').onclick = () => { if (!confirm(M('rvDropAsk'))) return; shut(); toast(M('rvDropped')); };
}
const REC_WARMUP = 380, REC_FADEIN = 0.28, BGM_FADEIN = 0.9;
const BGM_FADEOUT = 5;  /* 音樂結束時淡出五秒 */
let fading = false;
/* 音樂在 sec 秒內淡出，淡完才停錄；淡出中再按一次「停止」就立即停 */
function fadeOutStop(g, ac, sec) {
  if (!recording()) return;
  if (fading || !g || !ac) { mr.stop(); return; }
  fading = true;
  try { const t0 = ac.currentTime, v = Math.max(0.0001, g.gain.value); g.gain.cancelScheduledValues(t0); g.gain.setValueAtTime(v, t0); g.gain.linearRampToValueAtTime(0.0001, t0 + sec); } catch (e) { }
  const st = $('#recSt'); if (st) st.innerHTML = '<span class="recdot"></span>' + esc(M('fadingOut'));
  recTick.label = M('fadingOut');
  const me = mr; setTimeout(() => { if (mr === me && recording()) mr.stop(); }, sec * 1000 + 150);
}
function fadeIn(g, ac, to, sec) {
  if (!g || !ac) return;
  try { const t0 = ac.currentTime; g.gain.cancelScheduledValues(t0); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(to, t0 + sec); }
  catch (e) { try { g.gain.value = to; } catch (_) { } }
}
let curFade = null;
async function toggleRec() {
  if (recording()) { if (curFade) curFade(); else mr.stop(); return; }
  if (!X.studio) return;
  stopAll();
  if (recMode === 's' && (!selfieStream || !selfieStream.active)) {
    try { selfieStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }); }
    catch (e) { recMode = 'c'; toast(M('camDeny')); paintBox(); }
    if (recMode === 's') { await paintBox(); attachSelfie(); await sleep(500); }
  }
  let mic;
  try { mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
  catch (e) { try { mic = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e2) { toast(M('micDeny')); return; } }
  const svid = $('#selfiePrev'), useSelfie = isSelfie() && svid && svid.videoWidth;
  let ac = null, bgmEl = null, bgmURL = null, audioStream = mic, micGain = null, bgmGain = null;
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    try { await ac.resume(); } catch (_) { }
    const dst = ac.createMediaStreamDestination();
    micGain = ac.createGain(); micGain.gain.value = 0.0001;
    ac.createMediaStreamSource(mic).connect(micGain).connect(dst);
    if (bgmBlob) {
      bgmURL = URL.createObjectURL(bgmBlob);
      bgmEl = new Audio(); bgmEl.src = bgmURL; bgmEl.loop = true;
      bgmGain = ac.createGain(); bgmGain.gain.value = 0.0001;
      ac.createMediaElementSource(bgmEl).connect(bgmGain).connect(dst);
    }
    audioStream = dst.stream;
  } catch (e) { try { if (ac) ac.close(); } catch (_) { } ac = null; bgmEl = null; bgmGain = null; micGain = null; audioStream = mic; }
  let stream = audioStream, kind = 'audio', mime = audMime();
  if (recMode !== 'a' && canVideo()) {
    try {
      const sz = CARD_SIZES[S.card.size] || CARD_SIZES.t, cv = liveCanvas(sz[0], sz[1], useSelfie);
      stream = new MediaStream([...cv.captureStream(24).getVideoTracks(), ...audioStream.getAudioTracks()]);
      kind = 'video'; mime = vidMime();
    } catch (e) { cancelAnimationFrame(recAnim); liveEl = null; stream = audioStream; kind = 'audio'; mime = audMime(); }
  }
  try { mr = new MediaRecorder(stream, Object.assign(mime ? { mimeType: mime } : {}, kind === 'video' ? { videoBitsPerSecond: 2200000 } : {})); }
  catch (e) { cancelAnimationFrame(recAnim); liveEl = null; try { mr = new MediaRecorder(mic); kind = 'audio'; mime = ''; } catch (e2) { toast(M('recNo')); return; } }
  chunks = []; recSec = 0; X.BUSY = true; fading = false;
  curFade = bgmEl && bgmGain ? () => fadeOutStop(bgmGain, ac, BGM_FADEOUT) : null;
  mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  mr.onstop = async () => {
    recEnd(); curFade = null; fading = false; mic.getTracks().forEach(t => t.stop()); stopSelfie();
    try { if (bgmEl) { bgmEl.pause(); bgmEl.removeAttribute('src'); } } catch (_) { }
    try { if (bgmURL) URL.revokeObjectURL(bgmURL); } catch (_) { }
    try { if (ac) ac.close(); } catch (_) { }
    const type = mr.mimeType || mime || (kind === 'video' ? 'video/webm' : 'audio/webm');
    await finishRec(new Blob(chunks, { type }), type, kind);
  };
  await sleep(REC_WARMUP);
  if (!mr) return;
  mr.start(1000);
  fadeIn(micGain, ac, 1, REC_FADEIN);
  if (bgmEl) { try { await bgmEl.play(); } catch (_) { } fadeIn(bgmGain, ac, bgmVol, BGM_FADEIN); }
  recBtnId = 'recBtn'; markBtn();
  recTick((kind === 'video' ? M('recing') : M('recingA')) + (bgmBlob ? '　♪' : ''));
}
async function musicRec() {
  if (recording()) { if (curFade) curFade(); else mr.stop(); return; }
  if (!X.studio || !bgmBlob) { toast(M('bgmNeed')); return; }
  if (!canVideo()) { toast(M('vidNo')); return; }
  stopAll();
  let ac, bgmEl, bgmURL, audioStream, gain;
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    try { await ac.resume(); } catch (_) { }
    bgmURL = URL.createObjectURL(bgmBlob);
    bgmEl = new Audio(); bgmEl.src = bgmURL; bgmEl.loop = false;
    gain = ac.createGain(); gain.gain.value = 0.0001;
    const dst = ac.createMediaStreamDestination();
    ac.createMediaElementSource(bgmEl).connect(gain).connect(dst);
    audioStream = dst.stream;
  } catch (e) { toast(M('bgmBad')); return; }
  const sz = CARD_SIZES[S.card.size] || CARD_SIZES.t, cv = liveCanvas(sz[0], sz[1], false), mime = vidMime();
  const stream = new MediaStream([...cv.captureStream(24).getVideoTracks(), ...audioStream.getAudioTracks()]);
  try { mr = new MediaRecorder(stream, Object.assign(mime ? { mimeType: mime } : {}, { videoBitsPerSecond: 2200000 })); }
  catch (e) { cancelAnimationFrame(recAnim); liveEl = null; toast(M('vidNo')); return; }
  chunks = []; recSec = 0; X.BUSY = true; fading = false;
  curFade = () => fadeOutStop(gain, ac, BGM_FADEOUT);
  mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  mr.onstop = async () => {
    recEnd(); curFade = null; fading = false;
    try { bgmEl.pause(); bgmEl.removeAttribute('src'); } catch (_) { }
    try { URL.revokeObjectURL(bgmURL); } catch (_) { }
    try { ac.close(); } catch (_) { }
    const type = mr.mimeType || mime || 'video/webm';
    await finishRec(new Blob(chunks, { type }), type, 'video');
  };
  mr.start(1000);
  try { await bgmEl.play(); } catch (e) { }
  fadeIn(gain, ac, 1, 0.6);
  bgmEl.onended = () => { if (recording()) mr.stop(); };
  const me = mr;
  if (mcLen > 0) {
    /* 指定長度：最後五秒淡出，淡完剛好結束 */
    setTimeout(() => { if (mr === me && recording() && !fading) fadeOutStop(gain, ac, Math.min(BGM_FADEOUT, mcLen)); }, Math.max(0, mcLen - BGM_FADEOUT) * 1000);
  } else {
    /* 整首：播到最後五秒開始淡出；上限 8 分鐘 */
    bgmEl.ontimeupdate = () => {
      const d = bgmEl.duration;
      if (mr === me && recording() && !fading && d && isFinite(d) && d - bgmEl.currentTime <= BGM_FADEOUT) fadeOutStop(gain, ac, Math.max(0.5, d - bgmEl.currentTime));
    };
    setTimeout(() => { if (mr === me && recording() && !fading) fadeOutStop(gain, ac, BGM_FADEOUT); }, (8 * 60 - BGM_FADEOUT) * 1000);
  }
  recBtnId = 'mcBtn'; markBtn();
  recTick(M('mcing') + '　♪');
}
function markBtn() { const bt = recBtnId && $('#' + recBtnId); if (bt) { bt.textContent = M('recStop'); bt.className = 'btn danger block'; } }

/* ---- 作品：播放／分享／下載／刪除 ---- */
async function getRec(id) { if (!wdb) await openWDB(); const a = await allRec(); return a.find(x => x.id === id); }
async function readyBlob(r) {
  if (r.kind !== 'video') return r.blob;
  const fixed = await fixVideoBlob(r.blob, r.mime);
  if (fixed !== r.blob) { try { await putRec(Object.assign({}, r, { blob: fixed, mime: 'video/mp4' })); } catch (e) { } }
  return fixed;
}
async function outRec(id, dlOnly) {
  const r = await getRec(id); if (!r) return;
  const blob = await readyBlob(r), mime = (r.kind === 'video' && blob !== r.blob) ? 'video/mp4' : r.mime;
  shareBlob(blob, mime, r.kind, dlOnly);
}
async function rmRec(id) { if (!confirm(M('delAsk'))) return; await delRec(id); paintBox(); toast(M('deleted')); }
let playURL = null;
async function playRec(id) {
  const r = await getRec(id); if (!r) return;
  if (playURL) URL.revokeObjectURL(playURL);
  playURL = URL.createObjectURL(r.blob);
  const box = $('#play_' + id); if (!box) return;
  box.innerHTML = r.kind === 'video' ? '<video src="' + playURL + '" controls playsinline autoplay style="width:100%;border-radius:12px;display:block;margin-top:8px"></video>'
    : '<audio src="' + playURL + '" controls autoplay style="width:100%;margin-top:8px"></audio>';
}

/* ================= 畫面 ================= */
function chipsX(list, cur, attr) { return '<div class="chips" style="flex-wrap:wrap;justify-content:center">' + list.map(x => '<button class="chip' + (String(cur) === String(x[0]) ? ' on' : '') + '" data-' + attr + '="' + x[0] + '">' + esc(M(x[1])) + '</button>').join('') + '</div>'; }
function paintNote() {
  const box = $('#mxNote'); if (!box) return;
  box.innerHTML = '<div class="mxnote-acts"><button class="btn sm gold" id="mxBless">✍️ ' + esc(M('bless')) + '</button><button class="btn sm gold" id="mxTweak">' + esc(M('twBtn')) + '</button>' +
    '<button class="btn sm" id="mxMine">' + esc(M('useMine')) + '</button><button class="btn sm" id="mxClear">' + esc(M('clearText')) + '</button></div><div class="xs muted">' + esc(M('blessHint')) + '</div>';
  $('#mxBless').onclick = blessWrite; $('#mxTweak').onclick = openTweak;
  $('#mxMine').onclick = () => { setNote(X.studio.n0 || ''); if (!X.studio.n0) toast(M('noMine')); };
  $('#mxClear').onclick = () => setNote('');
}
async function paintBox() {
  const box = $('#mxBox'); if (!box || !X.studio) return;
  if (!wdb) await openWDB();
  const works = (await allRec()).sort((a, b) => b.ts - a.ts), vOK = canVideo(), rec = recording();
  let h = '<div class="card"><p class="eyebrow">' + esc(M('bgm')) + '</p>';
  if (bgmBlob) {
    h += '<div style="font-weight:700">♪ ' + esc(bgmName) + '</div>' + (bgmCredit ? '<div class="xs muted">' + esc(bgmCredit) + '</div>' : '') +
      '<div class="xs muted" style="margin:4px 0 10px">' + esc(M('bgmNote')) + '</div><div class="xs muted" style="margin-bottom:6px">' + esc(M('bgmVol')) + '</div>' + chipsX(BGM_VOLS, bgmVol, 'vol') +
      '<div class="sheet-acts2" style="margin-top:10px"><button class="btn sm gold" id="bLib">' + esc(M('hyBtn')) + '</button><label class="btn sm" style="cursor:pointer">' + esc(M('bgmSwap')) + '<input type="file" hidden id="bFile"></label><button class="btn sm" style="color:var(--bad)" id="bDel">' + esc(M('bgmDel')) + '</button></div>';
  } else {
    h += '<button class="btn gold block" id="bLib">' + esc(M('hyBtn')) + '</button><label class="btn block" style="cursor:pointer">' + esc(M('bgmPick')) + '<input type="file" hidden id="bFile"></label><div class="xs muted" style="margin-top:8px">' + esc(M('bgmHint')) + '</div>';
  }
  h += '</div><div class="card"><p class="eyebrow">' + esc(M('recSec')) + '</p><div class="xs muted" style="margin-bottom:10px">' + esc(vOK ? M('recIntro') : M('recIntroA')) + '</div>';
  if (vOK) h += chipsX([['a', 'recVoice'], ['c', 'recCard'], ['s', 'recSelfie']], recMode, 'md') + '<div class="xs muted" style="text-align:center;margin:4px 0 10px">' + esc(M(recMode === 'a' ? 'recVoiceD' : recMode === 's' ? 'recSelfieD' : 'recCardD')) + '</div>';
  h += '<div id="recSt" class="mxst">' + (rec ? '<span class="recdot"></span>' + esc(recTick.label || '') : esc(M('recReady'))) + '</div><div id="recTm" class="mxtm">' + fmtT(rec ? recSec : 0) + '</div>' +
    '<button class="btn pri block" id="recBtn">' + esc(!vOK || recMode === 'a' ? M('recStartA') : recMode === 's' ? '📷 ' + M('recStartS') : M('recStartV')) + '</button><div class="xs muted" style="margin-top:8px">' + esc(M('recTip')) + '</div>';
  if (vOK && bgmBlob) h += '<div class="xs muted" style="margin:14px 0 6px;text-align:center">' + esc(M('mcLen')) + '</div>' + chipsX(MC_LENS, mcLen, 'len') + '<button class="btn gold block" id="mcBtn">🎵 ' + esc(M('mcStart')) + '</button><div class="xs muted" style="margin-top:8px">' + esc(M('mcHint')) + '</div>';
  h += '<div id="selfieWrap" style="' + (isSelfie() ? '' : 'display:none;') + 'margin-top:14px;text-align:center"><video id="selfiePrev" class="mxself" playsinline webkit-playsinline muted autoplay></video><div class="xs muted" style="margin-top:6px">' + esc(M('selfieHint')) + '</div></div>' +
    '<div id="liveBox" hidden style="margin-top:14px"></div></div>';
  h += '<div class="card"><p class="eyebrow">' + esc(M('works')) + '（' + works.length + '）</p>' + (works.length ? works.map(w => '<div class="mxwork"><div class="q">' + esc(String(w.v || '').slice(0, 80)) + '</div><div class="m"><span>' + esc(w.r || '') + '　' + (w.kind === 'video' ? '🎬' : '🎙') + ' ' + (w.dur || 0) + 's　' + fmtDate(w.ts) + '</span><span style="white-space:nowrap"><button data-play="' + w.id + '" aria-label="play">▶</button><button data-sh="' + w.id + '" aria-label="share">↗</button><button data-dl="' + w.id + '" aria-label="save">⬇</button><button data-del="' + w.id + '" aria-label="delete">✕</button></span></div><div id="play_' + w.id + '"></div></div>').join('') : '<div class="empty">' + esc(M('noWorks')) + '</div>') + '</div>';
  /* 錄影中重畫時，把同一支自拍 <video> 搬回來，畫面才不會凍住 */
  const oldSelf = rec ? selfEl : null;
  box.innerHTML = h;
  if (oldSelf) { const nv = $('#selfiePrev'); nv.parentNode.replaceChild(oldSelf, nv); }
  selfEl = $('#selfiePrev');
  if (rec) { placeLive(); markBtn(); }
  else if (isSelfie()) setTimeout(attachSelfie, 60);
  $$('[data-vol]', box).forEach(b => b.onclick = () => { bgmVol = +b.getAttribute('data-vol'); paintBox(); });
  $$('[data-len]', box).forEach(b => b.onclick = () => { if (recording()) return; mcLen = +b.getAttribute('data-len'); paintBox(); });
  $$('[data-md]', box).forEach(b => b.onclick = () => setRecMode(b.getAttribute('data-md')));
  $$('[data-play]', box).forEach(b => b.onclick = () => playRec(b.getAttribute('data-play')));
  $$('[data-sh]', box).forEach(b => b.onclick = () => outRec(b.getAttribute('data-sh')));
  $$('[data-dl]', box).forEach(b => b.onclick = () => outRec(b.getAttribute('data-dl'), true));
  $$('[data-del]', box).forEach(b => b.onclick = () => rmRec(b.getAttribute('data-del')));
  $('#bLib').onclick = openHymns;
  $('#bFile').onchange = function () { pickBgm(this); };
  const bd = $('#bDel'); if (bd) bd.onclick = () => { if (recording()) return; bgmBlob = null; bgmName = ''; bgmCredit = ''; paintBox(); };
  $('#recBtn').onclick = () => { if (recording() && recBtnId !== 'recBtn') return; toggleRec(); };
  const mb = $('#mcBtn'); if (mb) mb.onclick = () => { if (recording() && recBtnId !== 'mcBtn') return; musicRec(); };
}
/* 離開工作室就收掉相機 */
window.addEventListener('hashchange', () => { if (!recording() && !$('#mxBox')) stopSelfie(); });
window.MX = {
  paint() { paintNote(); paintBox(); },
  leave() { if (!recording()) stopSelfie(); hymnStopPrev(); },
  busy: recording
};
})();
