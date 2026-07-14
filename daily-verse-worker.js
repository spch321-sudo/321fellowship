/* =====================================================================
   國度321空中團契 — 每日經文廣播 Worker（Cloudflare Workers + Cron）
   作用：每天定時，自動讀取 App 的 data.json，取出「當天的今日金句」，
        發送到「每日經文」Telegram 群組/頻道，家人加入即每天收到經文。
   特色：與 App 同一個內容來源（data.json）——你在 data.json 改經文，
        App 與每日推播會一起更新，永遠一致。

   需要的環境變數（Cloudflare → Settings → Variables）：
     TG_TOKEN      = Telegram Bot Token（可與「真人接住」共用同一個 Bot）
     TG_VERSE_CHAT = 「每日經文」廣播群組/頻道的 chat id（家人加入的那個）
     DATA_URL      = 你的 data.json 網址，例如
                     https://spch321-sudo.github.io/你的repo/data.json
     APP_URL       = App 網址（附在訊息底部，方便家人點回 App），例如
                     https://spch321-sudo.github.io/你的repo/

   部署後，在 Worker 的 Settings → Triggers → Cron Triggers 新增排程：
     例如每天台灣時間早上 6 點 →  UTC 是前一天 22:00 →  填  0 22 * * *
   ===================================================================== */

export default {
  // 定時觸發（Cron）
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDailyVerse(env));
  },
  // 也支援手動用瀏覽器打開 Worker 網址測試（GET）
  async fetch(request, env) {
    const r = await sendDailyVerse(env);
    return new Response(r.ok ? "已發送：\n\n" + r.text : "發送失敗：" + r.error, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};

async function sendDailyVerse(env) {
  // 1) 讀取 data.json（與 App 同一來源）
  let verses = [];
  try {
    const res = await fetch(env.DATA_URL, { cf: { cacheTtl: 0 } });
    const data = await res.json();
    verses = (data && data.verses) || [];
  } catch (e) {
    return { ok: false, error: "讀取 data.json 失敗" };
  }
  if (!verses.length) return { ok: false, error: "data.json 沒有經文" };

  // 2) 用「台灣時間的日期」挑當天經文（與 App 的挑選方式一致）
  const day = taipeiDayOfMonth();
  const v = verses[day % verses.length];

  // 3) 組訊息
  let text = "🌅 今日金句\n\n";
  text += (v.text || "") + "\n";
  if (v.ref) text += "— " + v.ref + "\n";
  if (v.motto) text += "\n💛 " + v.motto + "\n";
  if (env.APP_URL) text += "\n打開 App，開始新的一天 👉 " + env.APP_URL;
  text += "\n\n國度321空中團契";

  // 4) 發到 Telegram 廣播群組/頻道
  try {
    const url = `https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TG_VERSE_CHAT,
        text: text,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) return { ok: false, error: await res.text() };
  } catch (e) {
    return { ok: false, error: "Telegram 發送失敗" };
  }
  return { ok: true, text: text };
}

// 台灣時間（UTC+8）的「日」，用來挑當天經文
function taipeiDayOfMonth() {
  const now = new Date();
  const taipei = new Date(now.getTime() + 8 * 3600 * 1000);
  return taipei.getUTCDate();
}
