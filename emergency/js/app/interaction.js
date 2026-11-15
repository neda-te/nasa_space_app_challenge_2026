/* Tooltips, reset and the single delegated click handler that dispatches every data-action.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   CLICK DELEGATION + TOOLTIP
   ========================================================= */
const tip=$('#tip'); let pinned=null;
function tipHtml(el){ if(el.dataset.tipHtml) return decodeURIComponent(el.dataset.tipHtml); return el.dataset.tip==='anat' ? anatTip() : TIPS[el.dataset.tip]; }
function showTip(el){
  tip.innerHTML=tipHtml(el); tip.classList.add('on');
  const a=app.getBoundingClientRect(), r=el.getBoundingClientRect(), t=tip.getBoundingClientRect();
  let x=r.left-a.left+r.width/2-t.width/2, y=r.bottom-a.top+8;
  x=Math.max(8,Math.min(x,a.width-t.width-8));
  if(y+t.height>a.height-8) y=r.top-a.top-t.height-8;
  tip.style.left=x+'px'; tip.style.top=Math.max(8,y)+'px';
}
function hideTip(){ tip.classList.remove('on'); if(pinned) pinned.classList.remove('pin'); pinned=null; }
document.addEventListener('mouseover',e=>{ const el=e.target.closest('.info'); if(el&&!pinned) showTip(el); });
document.addEventListener('mouseout',e=>{ const el=e.target.closest('.info'); if(el&&!pinned&&!el.contains(e.relatedTarget)) tip.classList.remove('on'); });

function resetAll(){
  Object.assign(S,{type:null,uncon:false,flow:null,sig:null,route:['emergency','assess'],regions:[],sel:{},items:{}});
  $$('.tile').forEach(b=>b.classList.remove('sel')); setUncon(false);
  if(typeof setView==='function'){ setView('front'); setZoom('body'); }
  go(0);
}
function setUncon(v){
  S.uncon=v; const b=$('#uncon'); b.classList.toggle('on',v); b.setAttribute('aria-pressed',v);
  $('#unconSt').innerHTML = v ? 'CHECKED<br>also choose a category, or continue' : 'TAP TO CHECK';
  renderStepper(); updateFooter();
}
document.addEventListener('click',e=>{
  const info=e.target.closest('.info');
  if(info){ e.stopPropagation(); if(pinned===info){hideTip();return;} hideTip(); pinned=info; info.classList.add('pin'); showTip(info); return; }
  if(pinned && !e.target.closest('#tip')) hideTip();
  if(e.target.id==='guide'){ closeGuide(); return; }
  const el=e.target.closest('[data-action]'); if(!el) return;
  const v=el.dataset.v;
  switch(el.dataset.action){
    case 'uncon': setUncon(!S.uncon); break;
    case 'type': S.type=v; $$('.tile').forEach(t=>t.classList.toggle('sel',t===el)); updateFooter(); setTimeout(()=>{ startRoute(); go(1); },220); break;
    case 'grp': S.sel[el.dataset.g]=v; $$(`[data-action=grp][data-g=${el.dataset.g}]`).forEach(b=>b.classList.toggle('sel',b===el)); updateFooter(); break;
    case 'item': S.items[S.flow]=v; $$('[data-action=item]').forEach(b=>b.classList.toggle('sel',b===el)); updateFooter(); break;
    case 'rm': toggleRegion(v); break;
    case 'view': setView(v); break;
    case 'zoom': setZoom(v); break;
    case 'guide': openGuide(v, el.dataset.i!=null ? +el.dataset.i : null); break;
    case 'closeguide': closeGuide(); break;
    case 'gstep': setGStep(+v); break;
    case 'gprev': setGStep(G.k-1); break;
    case 'gnext': setGStep(G.k+1); break;
    case 'next': if(S.idx===0) startRoute(); go(S.idx+1); break;
    case 'back': go(S.idx-1); break;
    case 'restart': resetAll(); break;
  }
});
