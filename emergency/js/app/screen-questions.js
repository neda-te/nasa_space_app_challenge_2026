/* Screen 2: question groups, selected body-region chips and region selection.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   SCREEN 2
   ========================================================= */
function groupsHtml(F){
  return F.groups.map(g=>`<div class="panel"><div class="row"><span class="lbl">${g.label}</span><span class="info" data-tip="${g.tip}">i</span></div>
    <div class="opts ${g.cols===3?'three':''}">${g.o.map(o=>`<button class="opt ${S.sel[g.k]===o.v?'sel':''}" data-action="grp" data-g="${g.k}" data-v="${o.v}"><b>${o.b}</b>${o.s?`<small>${o.s}</small>`:''}</button>`).join('')}</div></div>`).join('');
}
function renderS2(flow){
  S.flow=flow; const F=FLOWS[flow];
  $('#ustrip').classList.toggle('hide', !(S.uncon && flow!=='unconscious')), body=F.mode==='body';
  $('#s2body').classList.toggle('hide',!body); $('#s2list').classList.toggle('hide',body);
  if(body){
    $('#vpTitle').textContent=F.vp; $('#bodyGroups').innerHTML=groupsHtml(F); $('#listGroups').innerHTML='';
    renderChips();
  } else {
    $('#bodyGroups').innerHTML='';
    $('#listKicker').textContent=(F.kick||F.label)+' · step '+(S.idx+1)+' of '+S.route.length; $('#listQ').textContent=F.q; $('#listHint').textContent=F.hint;
    const lo=$('#listOpts'); lo.className='opts'+(F.one?' one':'');
    lo.innerHTML=F.list.map(o=>`<button class="opt ${S.items[flow]===o.v?'sel':''}" data-action="item" data-v="${o.v}"><b>${o.b}</b><small>${o.s}</small></button>`).join('');
    const soon=$('#listSoon'); soon.classList.toggle('hide',!F.soon);
    if(F.soon) soon.innerHTML=`<span class="lbl">More conditions · from the medical database</span><div class="opts three" style="margin-top:.6rem">${F.soon.map(x=>`<div class="opt soon"><b>${x}</b><i>SOON</i></div>`).join('')}</div>`;
    $('#listGroups').innerHTML=groupsHtml(F);
  }
  updateFooter();
}
function renderChips(){
  $('#chips').innerHTML = S.regions.length
    ? S.regions.map(id=>`<span class="chip">${REGIONS[id].label}<button data-action="rm" data-v="${id}" aria-label="remove">×</button></span>`).join('')
    : '<div class="empty">Nothing selected yet — tap the body.</div>';
  $('#anatInfo').classList.toggle('hide', !S.regions.length);
  if(typeof paint3D==='function') paint3D();
  updateFooter();
}
function toggleRegion(id){
  const i=S.regions.indexOf(id);
  i>=0 ? S.regions.splice(i,1) : S.regions.push(id);
  renderChips();
}
const anatTip = () => `<h4>What's in this area</h4>` + S.regions.map(id=>`<b>${REGIONS[id].label}</b><ul>${REGIONS[id].anat.map(a=>`<li>${a}</li>`).join('')}</ul>`).join('');
