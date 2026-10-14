const fs=require('fs');const D=process.argv[2];
let src=fs.readFileSync(D+'/audience.js','utf8')+'\n'+fs.readFileSync(D+'/followups.js','utf8');
const pl=fs.readFileSync(D+'/play.js','utf8');
const m=pl.match(/const PL_STYLE[\s\S]*?\n};?\n/); 
src+='\n'+(m?m[0]:'');
const out={};
const state={lang:'zh',audience:'adult'};
function L3(a,b,c){return state.lang==='en'?c:state.lang==='zs'?b:a}
function isEN(){return state.lang==='en'} function isZS(){return state.lang==='zs'}
eval(src+`
for(const lg of ['zh','zs','en']){ state.lang=lg; out[lg]={name:AUD_NAME(),hint:AUD_HINT(),sys:{},write:SK_WRITE(),skstyle:SK_STYLE(),skres:SK_RES(),style:{}};
 for(const a of AUD_KEYS){ state.audience=a; out[lg].sys[a]=AUD_SYS(); try{out[lg].style[a]=PL_STYLE();}catch(e){out[lg].style[a]='ERR '+e.message} } }
out.qbank=QBANK_AUD; out.fu=FU_BANK; out.icon=AUD_ICON;
`);
fs.writeFileSync('/home/claude/build/aud.json',JSON.stringify(out,null,1));
