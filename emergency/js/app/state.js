/* Application state (S), DOM helpers, 16:9 layout scaling, mission clock and toast messages.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   STATE + LAYOUT
   ========================================================= */
const S = {route:['emergency','assess'], idx:0, sig:null, type:null, uncon:false, flow:null, regions:[], sel:{}, items:{}};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const app = $('#app');
const enc = s => encodeURIComponent(s);

function fit(){
  const w = Math.min(innerWidth, innerHeight*16/9), h = w*9/16;
  app.style.width = w+'px'; app.style.height = h+'px';
  document.documentElement.style.fontSize = (w/80)+'px';
}
addEventListener('resize', fit); fit();

const t0 = Date.now(), met0 = ((143*24+6)*60+12)*60+40;
const p2 = n => String(n).padStart(2,'0');
setInterval(()=>{
  const s = Math.floor((Date.now()-t0)/1000), m = met0+s;
  $('#elapsed').textContent = p2(Math.floor(s/60))+':'+p2(s%60);
  $('#met').textContent = `MET ${Math.floor(m/86400)}d ${p2(Math.floor(m%86400/3600))}:${p2(Math.floor(m%3600/60))}:${p2(m%60)}`;
},1000);
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(toast.h); toast.h=setTimeout(()=>t.classList.remove('on'),2200); }
