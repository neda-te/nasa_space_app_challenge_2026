/* Procedure guide dialog: step list with image, keyboard navigation (arrow keys, Escape).

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* guide modal: step list + image, arrow keys */
let G=null;
const stp = x => typeof x==='string' ? {d:x} : x;
const PH = '<div class="ph"><div><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4 4 3 3-2 4 3"/></svg>ILLUSTRATION<br>FOLLOWS</div></div>';
function openGuide(id,i){
  const p=P[id], why = i!=null && A && A.rec[i] && A.rec[i][1], steps=p.s.map(stp);
  G={steps,k:-1};
  steps.forEach(s=>{ if(s.img){ const im=new Image(); im.src=s.img; } });
  $('#gbox').innerHTML = `<div class="gtext">
      <div class="kicker">${CATS.find(c=>c[0]===p.c)[1]} · step-by-step guide</div>
      <h2>${p.n}</h2><div class="hint">${p.d}</div>
      ${why?`<div class="why"><b>In this case:</b> ${why}</div>`:''}
      <div class="gneed"><b>You need:</b> ${p.need}</div>
      <ol class="gsteps" id="gsteps">${steps.map((s,k)=>`<li data-action="gstep" data-v="${k}"><span class="gn">${k+1}</span><div>${s.t?`<b>${s.t}</b>`:''}<span>${s.d}</span></div></li>`).join('')}</ol>
      ${p.note?`<div class="note"><b>${p.note[0]}</b>${p.note[1]}</div>`:''}
    </div>
    <div class="gimg">
      <div class="gframe" id="gframe"></div>
      <div class="gnav"><button class="garr" id="gprev" data-action="gprev" aria-label="Previous step">‹</button><div class="gcap" id="gcap"></div><button class="garr" id="gnext" data-action="gnext" aria-label="Next step">›</button></div>
      <div class="gbar" id="gbar">${steps.map((_,k)=>`<i data-action="gstep" data-v="${k}"></i>`).join('')}</div>
      <div class="gfoot"><span class="kbd"><kbd>←</kbd> <kbd>→</kbd> switch steps</span><button class="btn ghost" data-action="closeguide">Close</button></div>
    </div>`;
  $('#guide').classList.add('on'); setGStep(0,true);
}
function setGStep(k,instant){
  if(!G) return; const n=G.steps.length; k=Math.max(0,Math.min(n-1,k)); if(k===G.k) return; G.k=k;
  const s=G.steps[k];
  $$('#gsteps li').forEach((li,j)=>{ li.classList.toggle('on',j===k); li.classList.toggle('past',j<k); });
  $$('#gbar i').forEach((b,j)=>b.classList.toggle('on',j<=k));
  $('#gframe').innerHTML = s.img ? `<img src="${s.img}" alt="${s.t||'Step '+(k+1)}" onerror="this.parentNode.innerHTML=PH">` : PH;
  $('#gcap').innerHTML = `<span>STEP ${k+1} / ${n}</span><b>${s.t||G.steps[k].d.split(/[.:—]/)[0]}</b>`;
  $('#gprev').disabled = k===0; $('#gnext').disabled = k===n-1;
  const ol=$('#gsteps'), li=ol.children[k];
  ol.scrollTo({top: li.offsetTop - ol.clientHeight/2 + li.offsetHeight/2, behavior: instant?'auto':'smooth'});
}
function closeGuide(){ $('#guide').classList.remove('on'); G=null; }
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ closeGuide(); hideTip(); return; }
  if(!G) return;
  if(e.key==='ArrowRight'||e.key==='ArrowDown'){ e.preventDefault(); setGStep(G.k+1); }
  if(e.key==='ArrowLeft'||e.key==='ArrowUp'){ e.preventDefault(); setGStep(G.k-1); }
});
