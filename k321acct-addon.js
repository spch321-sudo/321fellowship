/* 國度321空中團契 × 321 共用帳號（ES5 外掛；需要 ../321steward/k321acct.js）
 * ‧ 授權碼畫面加一顆「已有 321 帳號？登入後自動開通」——在其他 321 App 開通過，這裡登入就直接進來
 * ‧ 設定頁加一張「321 共用帳號」卡片：登入、立即同步、帳號碼與登出
 * ‧ 登入後自動加密備份團契 App 的個人資料（畫線、收藏、筆記、字級等 k321_ 開頭），換手機找回
 * ‧ 開通狀態（k321_auth）放在共用設定，用同一組帳號的 321 App 都通用 */
(function(){
 var A=window.K321ACCT;if(!A)return;
 var SKIP={k321_auth:1,k321_news_cache:1,k321_news_tr:1,k321_acct:1,k321_acct_at:1,k321_staff:1};
 function L(){var l='';try{l=localStorage.getItem('k321_lang')||'';}catch(e){}return l==='zh-Hans'?'zs':(l==='en'?'en':'zh');}
 var TX={
  zh:{gate:'已有 321 帳號？登入後自動開通',noauth:'這個帳號還沒有開通紀錄，請輸入一次授權碼；之後用這組帳號的 App 都會自動開通。',t:'321 共用帳號',intro:'一組帳號碼，所有 321 App 共用：自動加密備份你的畫線、收藏與筆記，換手機找回；開通一次，其他 321 App 也通用。',open:'建立或登入 321 帳號',on:'✓ 已登入',last:'上次同步：',never:'尚未同步',sync:'立即同步',acct:'帳號碼與登出',synced:'已同步到 321 帳號',fail:'同步失敗：',ask:'321 帳號裡有你的團契 App 備份（{n} 項），要下載到這支手機嗎？會取代這支手機上的同名資料。'},
  zs:{gate:'已有 321 账号？登录后自动开通',noauth:'这个账号还没有开通记录，请输入一次授权码；之后用这组账号的 App 都会自动开通。',t:'321 共用账号',intro:'一组账号码，所有 321 App 共用：自动加密备份你的画线、收藏与笔记，换手机找回；开通一次，其他 321 App 也通用。',open:'建立或登录 321 账号',on:'✓ 已登录',last:'上次同步：',never:'尚未同步',sync:'立即同步',acct:'账号码与登出',synced:'已同步到 321 账号',fail:'同步失败：',ask:'321 账号里有你的团契 App 备份（{n} 项），要下载到这部手机吗？会取代这部手机上的同名数据。'},
  en:{gate:'Have a 321 Account? Sign in to unlock',noauth:'This account has no unlock record yet. Enter the access code once; after that every app using this account unlocks automatically.',t:'321 Account',intro:'One code for every 321 app: encrypted backup of your highlights, favourites and notes, restored on a new phone; unlock once and other 321 apps share it.',open:'Create or sign in to a 321 Account',on:'✓ Signed in',last:'Last sync: ',never:'Not synced yet',sync:'Sync now',acct:'Account code / sign out',synced:'Synced to your 321 Account',fail:'Sync failed: ',ask:'Your 321 Account has a Fellowship backup ({n} items). Download it to this phone? It replaces data with the same names.'}
 };
 function X(){return TX[L()];}
 /* 授權碼畫面會把其他元素藏起來，帳號視窗要例外 */
 (function(){var st=document.createElement('style');st.textContent='html.k321-locked body>.k3a:not(#k3x1):not(#k3x2){visibility:visible!important;pointer-events:auto!important}';document.head.appendChild(st);})();
 function note(m){try{if(typeof window.toast==='function'){window.toast(m);return;}}catch(e){}var d=document.createElement('div');d.textContent=m;d.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#14213D;color:#fff;padding:10px 16px;border-radius:99px;z-index:2147483001;font-size:15px;max-width:86vw;text-align:center';document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},2600);}
 function store(){var s={},i,k;for(i=0;i<localStorage.length;i++){k=localStorage.key(i);if(k&&k.indexOf('k321_')===0&&!SKIP[k])s[k]=localStorage.getItem(k);}return s;}
 var busy=false;
 function sync(cb){if(!A.get()||busy){if(cb)cb('busy');return;}busy=true;A.put('fellowship',{v:1,at:Date.now(),store:store()},function(e){busy=false;paint();if(cb)cb(e);});}
 function restore(after){
  A.fetch('fellowship',function(err,o){
   if(err||!o||!o.store){sync(null);if(after)after(false);return;}
   var n=0,k;for(k in o.store)n++;
   if(n&&confirm(X().ask.replace('{n}',n))){for(k in o.store){try{localStorage.setItem(k,o.store[k]);}catch(e){}}if(after)after(true);}
   else{sync(null);if(after)after(false);}
  });
 }
 function changed(kind){
  if(kind==='login'){
   A.syncProfile(function(){
    restore(function(){
     var G=window.K321_GATE;
     if(G&&G.ok&&!G.ok()){note(X().noauth);paint();return;}
     location.reload();
    });
   });
  }else if(kind==='create'){A.syncProfile();sync(function(e){note(e?X().fail+e:X().synced);});}
  paint();
 }
 function open(){A.open({lang:L(),onChange:changed});}
 /* 授權碼畫面的按鈕（語言切換會重畫畫面，所以每次都檢查） */
 function gateBtn(){
  var g=document.getElementById('k321gate');if(!g||document.getElementById('k321gacct'))return;
  var card=document.getElementById('k321form');if(!card)return;
  var b=document.createElement('button');b.type='button';b.id='k321gacct';b.textContent=X().gate;
  b.style.cssText='display:block;margin:14px auto 0;padding:12px 18px;border-radius:14px;border:1.5px solid rgba(229,184,94,.8);background:rgba(255,255,255,.08);color:#F3D48A;font-size:16px;font-weight:700;cursor:pointer;max-width:92%';
  b.onclick=open;card.parentNode.insertBefore(b,card.nextSibling);
 }
 /* 設定頁卡片 */
 function paint(){
  var panel=document.querySelector('#setSheet .panel');if(!panel)return;
  var box=document.getElementById('k321acctbox');
  if(!box){box=document.createElement('div');box.id='k321acctbox';box.style.cssText='margin-top:16px;padding:14px;border-radius:16px;border:1.5px solid rgba(29,58,110,.35)';
   var auth=document.getElementById('k321auth'),foot=document.getElementById('setFooter'),ref=auth||(foot&&foot.previousElementSibling&&foot.previousElementSibling.tagName==='HR'?foot.previousElementSibling:foot);
   if(ref)panel.insertBefore(box,ref);else panel.appendChild(box);}
  var a=A.get(),at=A.lastAt('fellowship'),t=X(),btn='padding:10px 14px;border-radius:12px;font-weight:700;cursor:pointer;font-size:calc(15px * var(--fs,1));';
  box.innerHTML='<div style="font-weight:800;font-size:calc(17px * var(--fs,1));margin-bottom:6px">🔑 '+t.t+'</div>'+
   (a?'<div style="color:#2A8550;font-weight:700">'+t.on+'</div><div class="note" style="margin:4px 0 10px">'+(at?t.last+new Date(at).toLocaleString():t.never)+'</div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" id="k321async" style="'+btn+'background:#1D3A6E;color:#fff;border:0">'+t.sync+'</button><button type="button" id="k321aopen" style="'+btn+'background:transparent;color:inherit;border:1.5px solid rgba(128,128,128,.4)">'+t.acct+'</button></div>'
   :'<div class="note" style="margin-bottom:10px">'+t.intro+'</div><button type="button" id="k321aopen" style="'+btn+'width:100%;background:linear-gradient(135deg,#1D3A6E,#11264B);color:#E5B85E;border:0">'+t.open+'</button>');
  var o=document.getElementById('k321aopen');if(o)o.onclick=open;
  var s=document.getElementById('k321async');if(s)s.onclick=function(){A.syncProfile();sync(function(e){note(e&&e!=='busy'?t.fail+e:t.synced);});};
 }
 window.K321F={sync:sync,open:open};
 setInterval(gateBtn,500);gateBtn();
 document.addEventListener('click',function(){setTimeout(function(){var sh=document.getElementById('setSheet');if(sh&&(sh.className.indexOf('open')>=0||sh.className.indexOf('show')>=0))paint();},60);},true);
 paint();
 setTimeout(function(){var G=window.K321_GATE;if(!A.get())return;A.syncProfile(function(e,n){if(n&&G&&G.ok&&G.ok()&&document.getElementById('k321gate'))location.reload();});if(G&&G.ok&&G.ok()&&Date.now()-A.lastAt('fellowship')>10*60000)sync(null);},3000);
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&A.get()&&Date.now()-A.lastAt('fellowship')>5*60000)sync(null);});
})();
