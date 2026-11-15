/* Step route (emergency -> questions -> assessment), stepper and footer buttons.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   NAVIGATION
   ========================================================= */
function planRoute(){ return ['emergency'].concat(S.uncon?['unconscious']:[], S.type?[S.type]:[], ['assess']); }
const stepLabel = k => k==='emergency'?'Emergency':k==='assess'?'Assessment':FLOWS[k].step;
function renderStepper(){
  const r = S.idx===0 ? planRoute() : S.route, labels=r.map(stepLabel);
  if(S.idx===0 && !S.type && !S.uncon) labels.splice(1,0,'Details');
  $('#stepper').innerHTML = labels.map((l,k)=>`<div class="step ${k===S.idx?'active':''} ${k<S.idx?'done':''}"><i>${k<S.idx?'✓':k+1}</i>${l}</div>`).join('<div class="sep"></div>');
  $('#s1kick').textContent = `Triggered via wrist device · step 1 of ${labels.length}`;
}
function startRoute(){
  S.route=planRoute();
  const sig=S.uncon+'|'+S.type;
  if(sig!==S.sig){
    S.sig=sig; S.regions=[]; S.sel={}; S.items={};
    S.route.forEach(k=>{ if(FLOWS[k]) FLOWS[k].groups.forEach(g=>{ if(g.def) S.sel[g.k]=g.def; }); });
    if(S.uncon){ S.sel.ubleed = S.type==='bleeding'?'yes':'no'; S.sel.trig = {injury:'injury',breathing:'choke'}[S.type]||'unknown'; }
  }
}
const curKey = () => S.route[S.idx]||'emergency';
function go(n){
  S.idx=n; const key=curKey(), scr = key==='emergency'?1:key==='assess'?3:2;
  $$('.screen').forEach((s,i)=>s.classList.toggle('on', i+1===scr));
  if(scr===2){ renderS2(key); setTimeout(()=>{ if(typeof resize3D==='function') resize3D(); },50); }
  if(scr===3) renderAssessment(); else stopVitals();
  renderStepper(); closeGuide(); hideTip(); updateFooter();
}
function s2state(){
  const F=FLOWS[S.flow];
  return [[F.main, F.mode==='body' ? S.regions.length>0 : !!S.items[S.flow]]].concat(F.groups.map(g=>[g.label.replace('?',''), !!S.sel[g.k]]));
}
function updateFooter(){
  const next=$('#next'), key=curKey();
  $('#back').classList.toggle('hide', key==='emergency');
  $('#restart').classList.toggle('hide', key==='emergency');
  $('#need').classList.toggle('hide', !FLOWS[key]);
  next.classList.toggle('hide', key==='assess');
  next.classList.toggle('red', S.uncon);
  if(key==='emergency'){ next.textContent = S.uncon ? 'Unresponsive protocol →' : 'Continue →'; next.disabled = !(S.type||S.uncon); }
  else if(FLOWS[key]){
    const st=s2state();
    $('#need').innerHTML = st.map(([l,ok])=>`<span class="${ok?'ok':''}">${l}</span>`).join('');
    next.textContent = S.idx===S.route.length-2 ? 'Get suggestions →' : 'Next: '+stepLabel(S.route[S.idx+1])+' →';
    next.disabled=!st.every(x=>x[1]);
  }
}
