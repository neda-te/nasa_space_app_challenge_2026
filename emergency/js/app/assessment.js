/* Screen 3: rule-based assessment per flow (ranking of likely causes, recommended procedures, red flags) and its rendering.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   SCREEN 3 — assessment per flow
   returns {tags, records, midTitle, midTip, mid[], banner, rec[[id,why]], tx[], flags[], vit{}}
   ========================================================= */
const lvl = s => s>=5?3:s>=3?2:1;
function rank(keys,dict,mods,max=4){
  const seen=new Set();
  return keys.filter(k=>!seen.has(k)&&seen.add(k)).map(k=>{ const c=dict[k]; let s=c.b; mods.forEach(m=>{ s+=(c.m&&c.m[m])||0; }); return {...c,s,l:lvl(s)}; }).sort((a,b)=>b.s-a.s).slice(0,max);
}
const optLabel=(flow,k,v)=>{ const g=FLOWS[flow].groups.find(g=>g.k===k); const o=g&&g.o.find(o=>o.v===v); return o?o.b:v; };
const regionTags=()=>{ const r=S.regions.map(x=>REGIONS[x].label); return r.length>2 ? r.slice(0,2).concat('+'+(r.length-2)) : r; };
const uniq=a=>[...new Set(a)];
const mergeRec=(lists,max=6)=>{ const seen=new Set(), out=[]; lists.forEach(l=>l.forEach(r=>{ if(r[0]!=='temp'&&!seen.has(r[0])){ seen.add(r[0]); out.push(r); } })); return out.slice(0,max); };

const PAIN_REC = {
  kidney:[['urine','Blood → stone · leukocytes / nitrite → infection'],['us','Urine backing up in the kidney; stone visible?'],['temp','Stone plus fever = emergency'],['blood','Kidney function, infection markers'],['pain','Colic comes in waves — track the trend'],['fluids']],
  abdomen:[['vitals'],['temp','Fever → inflammation'],['us','Gallbladder, appendix, free fluid'],['blood','Inflammation, liver and pancreas values'],['urine','Rules urinary causes in or out'],['pain']],
  pelvis:[['urine','Leukocytes / nitrite → infection · blood → stone'],['us','How full is the bladder?'],['temp'],['blood'],['cath','Only if the bladder is full and cannot be emptied']],
  chest:[['ecg','Heart attack or rhythm problem'],['vitals'],['sound','Both lungs ventilated?'],['us','Collapsed lung, heart pumping'],['blood','Heart-muscle marker'],['o2','If SpO₂ is under 94 %']],
  head:[['neuro','Rule out stroke and pressure signs'],['air','CO₂ is a frequent headache trigger'],['vitals'],['temp'],['fluids']],
  eye:[['eye','Particle, redness, vision'],['eyewash','Particle or irritant'],['pain']],
  ear:[['ent','Ear canal and eardrum'],['temp'],['pain']],
  mouth:[['ent','Teeth, gums, mucosa'],['dental'],['temp','Fever + swelling = abscess']],
  neck:[['us','Neck veins: clot?'],['neuro'],['temp'],['ent','Throat']],
  limb:[['bodycheck','Swelling, warmth, colour — compare both sides'],['us','Veins (clot), muscle, tendon'],['splint','If movement hurts'],['temp'],['pain']],
};
const PAIN_TX = {
  kidney:{tx:['Pain relief from the medical kit as confirmed','Drink more fluids','Antibiotics only if there are signs of infection'],flags:['Fever of 38 °C or more, or chills','Little or no urine','Repeated vomiting','Pain not controlled by medication']},
  abdomen:{tx:['Rest; small sips of fluid','Pain relief as confirmed by the flight surgeon','Nothing to eat until the cause is clearer'],flags:['Pain moves to the lower right, with fever','Hard, rigid belly','Vomiting blood or black stool','Fever of 38 °C or more']},
  pelvis:{tx:['Drink more fluids','Pain relief as confirmed by the flight surgeon','Catheter only if the flight surgeon orders it'],flags:['Unable to urinate','Fever of 38 °C or more, or chills','Blood in the urine with fever']},
  chest:{tx:['Stop all exercise; rest','Keep the wrist device on (continuous heart rate)','Medication only as ordered by the flight surgeon'],flags:['Pressure with sweating or breathlessness','Pain spreading to arm, jaw or back','Sudden shortness of breath','Irregular or very fast pulse']},
  head:{tx:['Eye: do not rub; rinse','Pain relief as confirmed by the flight surgeon','Drink; rest in a quiet, well-ventilated place'],flags:['Sudden, very severe headache','Vision change or loss','Vomiting or drowsiness after a head bump','One-sided swelling of neck or face']},
  limb:{tx:['Rest and immobilise','Cold pack / compression, if on board','Pain relief as confirmed by the flight surgeon'],flags:['One-sided swelling with pain (clot)','Numb, pale or cold limb','Visible deformity','Can’t move or load the limb']},
};
const VIT0={hr:112,spo2:97,sys:138,dia:88,rr:20,temp:36.9};

function assessFlow(f){
  const sel=S.sel, r0=S.regions[0], ITEM=S.items[f];
  if(f==='pain'){
    const g=REGIONS[r0].g, sub=PAIN_REC[VKEY(r0)]?VKEY(r0):g;
    const keys=[]; S.regions.forEach(r=>keys.push(...CAUSES_BY_REGION[r]));
    return {tags:[...regionTags(),optLabel(f,'pos',sel.pos),optLabel(f,'kind',sel.kind)], anat:true,
      records:REC[g], midTitle:'Possible causes', midTip:'causes', mid:rank(keys,C,[sel.pos,sel.kind]),
      rec:mergeRec(uniq(S.regions.map(r=>PAIN_REC[VKEY(r)]?VKEY(r):REGIONS[r].g)).map(k=>PAIN_REC[k])), tx:PAIN_TX[g].tx, flags:PAIN_TX[g].flags, vit:VIT0};
  }
  if(f==='bleeding'){
    const cls=BCLASS(r0), severe=sel.btype==='spurt'||sel.btype==='flow', hidden=sel.btype==='none';
    const mid=[]; const seen=new Set(); S.regions.forEach(r=>VESSELS[VKEY(r)].forEach(v=>{ if(!seen.has(v.n)){ seen.add(v.n); mid.push({...v,t:`<h4>${v.n}</h4>${v.w}`}); } }));
    mid.sort((a,b)=>b.l-a.l);
    const objWhy = sel.obj==='yes' ? 'Object stays in! Press on both sides, pad around it' : null;
    let rec;
    if(hidden) rec=[['vitals','Pulse up, pressure down = internal bleeding'],['us','Free fluid, blood in chest or belly'],['restrain','Keep still — movement increases bleeding'],['o2','If SpO₂ is under 94 %'],['iv','When the flight surgeon orders it']];
    else if(cls==='limb') rec=severe?[['press',objWhy||'Now — hard, with both hands'],['tq','If pressure does not stop it within a minute'],['pack','If no tourniquet, or the wound is in the armpit / groin'],['vitals','Watch for shock'],['iv','When the flight surgeon orders it'],['wound','Only after the bleeding is controlled']]:[['press',objWhy||'10 minutes without lifting'],['wound','Clean, close, cover'],['vitals']];
    else if(cls==='junction') rec=[['press',objWhy||(VKEY(r0)==='neck'?'On the wound, one side only — never on the windpipe':'Hard, with your full strength')],['pack','A tourniquet cannot be used here'],['vitals','Watch for shock'],['o2'],['iv','When the flight surgeon orders it']];
    else if(cls==='torso') rec=[['press',objWhy||'On the outer wound; internal bleeding cannot be pressed'],['vitals','Pulse up, pressure down = internal bleeding'],['us','Free fluid, collapsed lung'],['o2','If SpO₂ is under 94 %'],['iv','When the flight surgeon orders it'],['wound','Only after the bleeding is controlled']];
    else if(cls==='eye') rec=[['eye','No pressure, no rinsing — rigid shield'],['neuro','After a blow: check the other eye and pupils'],['vitals']];
    else if(cls==='ear') rec=[['neuro','Fluid from the ear after an impact = skull fracture?'],['ent','Where does it come from?'],['cspine','If there was a blow to the head'],['vitals']];
    else if(cls==='mouth') rec=[['press','Gauze on the spot; bite on it for 10 minutes'],['airway','Suction — blood does not drain by itself'],['ent','Find the source'],['vitals']];
    else rec=[['press',objWhy||'Firm; around the edges if the skull feels soft or dented'],['neuro','Blow to the head?'],['vitals'],['wound','Scalp: after the bleeding is controlled']];
    const noTq = cls!=='limb' && !hidden;
    return {tags:[...regionTags(),optLabel(f,'btype',sel.btype)].concat(sel.obj==='yes'?['Object in wound']:[]), anat:true,
      records:[['Blood group','A+',0],['Blood-thinning medication','none',0],['Haemoglobin (MD 120)','normal',0],['Tetanus vaccination','up to date',0]],
      midTitle:'What lies here · danger zones', midTip:'danger', mid:mid.slice(0,4),
      banner: hidden?['Suspected internal bleeding — keep still, monitor','calm']:severe?['LIFE-THREATENING BLEEDING — press now','']:null,
      rec, tx:['Keep the patient restrained, warm and calm','Contain the blood: floating drops endanger eyes and equipment','Fluids into the vein and medication only as ordered'].concat(noTq?['Tourniquet is not an option at this site']:[]),
      flags:['Blood soaks through despite pressure','Pale, cold, sweaty skin','Fast weak pulse, falling blood pressure','Confused or drowsy'],
      vit: severe||hidden?{hr:126,spo2:96,sys:96,dia:60,rr:24,temp:36.4}:{hr:98,spo2:98,sys:128,dia:82,rr:17,temp:36.8}};
  }
  if(f==='injury'){
    const t=sel.itype, classes=uniq(S.regions.map(ICLASS)), cls=classes[0];
    const keys=[]; classes.forEach(c=>keys.push(...(IKEYS[t][c]||IKEYS[t]._||['bruise'])));
    const mid=rank(keys,I,[sel.func]).map(c=>({...c,t:`<h4>${c.n}</h4>${c.w}${c.t?'<br><span class="m">'+c.t+'</span>':''}`}));
    const flags = t==='burn' ? IFLAGS.burn : uniq([].concat(...classes.map(c=>IFLAGS[c]))).slice(0,5);
    return {tags:[...regionTags(),optLabel(f,'itype',t),optLabel(f,'func',sel.func)], anat:true,
      records:[['Bone density trend','decreasing',1],['Exercise, last 24 h','2 h',0],['Previous injuries','none',0],['Tetanus vaccination','up to date',0]],
      midTitle:'Likely injuries', midTip:'causes', mid,
      banner: sel.func==='numb'?['Numbness beyond the injury — nerve or vessel may be affected','']:null,
      rec:mergeRec(classes.map(c=>IREC[t][c]||IREC[t]._)), tx:ITX[t], flags,
      vit:{hr:108,spo2:97,sys:134,dia:86,rr:18,temp:36.8}};
  }
  if(f==='breathing'){
    const sc=BSCEN[ITEM], gasp=sel.look==='gasp', silent=sel.look==='silent';
    let rec=sc.rec.slice();
    if(gasp) rec=mergeRec([[['airway','Slow or gasping breathing can stop any second'],['cpr','Be ready — start if breathing stops'],['o2']],rec]);
    else if(silent && ITEM!=='choke') rec=mergeRec([[['airway','No voice = airway blocked or swollen shut'],['choke','If an object could be the cause']],rec]);
    return {tags:[optLabel2('breathing',ITEM),optLabel(f,'look',sel.look),optLabel(f,'onset',sel.onset)],
      records:[['Asthma / lung disease','none',0],['Known allergies','none recorded',0],['Cabin CO₂, last 24 h','elevated ↑',1],['Last spacewalk','2 days ago',0]],
      midTitle:'Possible causes', midTip:'causes', mid:rank(sc.k,B,[sel.look,sel.onset]).map(c=>({...c,t:`<h4>${c.n}</h4>${c.w}${c.t?'<br><span class="m">'+c.t+'</span>':''}`})),
      banner: gasp?['BREATHING IS FAILING — open the airway, prepare CPR','']:silent?['AIRWAY BLOCKED — act now','']:null,
      rec, tx:sc.tx, flags:BFLAGS,
      vit: gasp?{hr:132,spo2:82,sys:104,dia:66,rr:7,temp:36.9}:{hr:118,spo2:silent?86:91,sys:136,dia:86,rr:28,temp:ITEM==='infect'?38.4:37.0}};
  }
  if(f==='other'){
    const sc=OSCEN[ITEM], sev=sel.sev==='severe';
    return {tags:[optLabel2('other',ITEM),optLabel(f,'dur',sel.dur),optLabel(f,'sev',sel.sev)],
      records:[['Sleep, last 3 nights','5.2 h ↓',1],['Cabin CO₂, last 24 h','elevated ↑',1],['Fluid intake, last 3 days','below target ↓',1],['Last bowel movement','2 days ago',ITEM==='digest'?1:0]],
      midTitle:'Possible causes', midTip:'causes', mid:rank(sc.k,OT,[sel.dur,sel.sev]).map(c=>({...c,t:`<h4>${c.n}</h4>${c.w}${c.t?'<br><span class="m">'+c.t+'</span>':''}`})),
      banner: sev?['Severe symptoms — the flight surgeon is reviewing live','calm']:null,
      rec:sc.rec, tx:sc.tx, flags:sc.flags,
      vit: ITEM==='dizzy'?{hr:104,spo2:96,sys:96,dia:58,rr:18,temp:36.7}:ITEM==='digest'?{hr:98,spo2:97,sys:118,dia:76,rr:17,temp:sev?38.1:37.2}:{hr:74,spo2:96,sys:122,dia:80,rr:15,temp:36.8}};
  }
  // unconscious
  const br=ITEM, noBr=br!=='yes', bleed=sel.ubleed==='yes', tr=sel.trig;
  let rec;
  if(noBr){
    rec=[['help','You need a second rescuer and the defibrillator'],['cpr',tr==='choke'?'Start now. Look into the mouth for the object before each breath':'Start now — do not wait for anything'],['aed','As soon as it arrives'],['restrain','When the second rescuer is there: handstand method'],['airway','Before each pair of rescue breaths']];
    if(bleed) rec.splice(2,0,['press','Second rescuer presses on the bleed']);
    if(tr==='air') rec.unshift(['o2','Your own mask first — then move the patient to clean air']);
  } else {
    rec=[['help','Second rescuer and medical kit']];
    if(tr==='air') rec.unshift(['o2','Your own mask first — then move the patient to clean air']);
    if(bleed) rec.push(['press','Stop the bleeding now']);
    rec.push(['recovery','Keep the airway open; re-check breathing every minute']);
    if(tr==='injury') rec.push(['cspine','Blow to the head: keep the neck still']);
    rec.push(['vitals','Pulse oximeter and blood pressure'],['neuro','Pupils, reaction to voice and touch'],['blood','Blood sugar in one minute']);
  }
  return {tags:[noBr?'Not breathing normally':'Breathing normally',optLabel(f,'trig',tr)].concat(bleed?['Severe bleeding']:[]).concat(S.type?['Reported: '+FLOWS[S.type].label]:[]),
    records:[['Resting ECG (MD 120)','normal',0],['Medication, last 24 h','sleep aid',1],['Cabin CO₂, last 24 h','elevated ↑',1],['Diabetes','no',0]],
    midTitle:'Possible causes', midTip:'causes', mid:rank(Object.keys(U),U,['br_'+br,'tr_'+tr,'bl_'+sel.ubleed,'ty_'+S.type]).map(c=>({...c,t:`<h4>${c.n}</h4>${c.w}${c.t?'<br><span class="m">'+c.t+'</span>':''}`})),
    banner: noBr?['NOT BREATHING NORMALLY — START CPR NOW','']:['Breathing — keep the airway open and stay with the person','calm'],
    rec:rec.slice(0,6),
    tx:['Never leave the person alone','Nothing by mouth','Keep warm','Note the time of collapse and every change'],
    flags: noBr?['No sign of life after the first shock','Defibrillator repeats “no shock advised”','Rescuers are getting exhausted','Breathing or movement returns']:['Breathing stops or turns into gasping → CPR','Not awake after 2 minutes','Seizure lasting more than 5 minutes','Unequal pupils'],
    vit: noBr?{hr:0,spo2:71,sys:0,dia:0,rr:0,temp:36.5}:{hr:56,spo2:93,sys:92,dia:56,rr:10,temp:36.5}};
}
const optLabel2=(flow,v)=>{ const o=FLOWS[flow].list.find(o=>o.v===v); return o?o.b:v; };
function assess(){
  if(!S.uncon) return assessFlow(S.type);
  const U=assessFlow('unconscious'); if(!S.type) return U;
  const Cc=assessFlow(S.type), noBr=S.items.unconscious!=='yes';
  U.tags=[U.tags[0]].concat(Cc.tags);
  U.anat=Cc.anat;
  const cr=Cc.rec.filter(r=>!['vitals','pain','help','temp'].includes(r[0]));
  if(S.type==='bleeding'){
    const ur=U.rec.filter(r=>r[0]!=='press');
    let k=ur.findIndex(r=>r[0]==='cpr'); if(k<0) k=ur.findIndex(r=>r[0]==='help');
    U.rec=mergeRec([ur.slice(0,k+1),cr.slice(0,2),ur.slice(k+1)]);
    U.mid=Cc.mid; U.midTitle=Cc.midTitle; U.midTip=Cc.midTip;
  } else U.rec=mergeRec([U.rec.slice(0,4),cr.slice(0,2),U.rec.slice(4)]);
  if(!noBr) U.flags=uniq(U.flags.concat(Cc.flags.slice(0,1)));
  return U;
}

let A=null;
function renderAssessment(){
  A=assess(); A.rec=A.rec.filter(r=>r[0]!=='temp').slice(0,6);
  $('#tags').innerHTML = (S.uncon?'<span class="tag r">Unconscious</span>':'')+(S.type?`<span class="tag b">${FLOWS[S.type].label}</span>`:'')
    + A.tags.slice(0,5).map(t=>`<span class="tag">${t}</span>`).join('') + (A.tags.length>5?`<span class="tag" title="${A.tags.slice(5).join(', ')}">+${A.tags.length-5}</span>`:'') + (A.anat?'<span class="info" data-tip="anat">i</span>':'');
  $('#records').innerHTML = `<span>Crew member</span><b>Bob · 41 y · MD 143</b>` + A.records.map(([k,v,up])=>`<span>${k}</span><b class="${up?'up':''}">${v}</b>`).join('');
  $('#midTitle').textContent=A.midTitle; $('#midInfo').dataset.tip=A.midTip;
  $('#causes').innerHTML = A.mid.map(c=>`<div class="cause"><div><b>${c.n}</b><small>${c.w}</small></div>
      <div class="lvl ${c.l===3?'hi':''}">${['','Low','Medium','High'][c.l]}<span class="bars l${c.l}"><i></i><i></i><i></i></span></div>
      <span class="info" data-tip-html="${enc(c.t||`<h4>${c.n}</h4>${c.w}`)}">i</span></div>`).join('');
  $('#banner').innerHTML = A.banner ? `<div class="banner ${A.banner[1]}">${A.banner[0]}</div>` : ''; $('#doLbl').classList.toggle('hide',!!A.banner);
  $('#recs').innerHTML = A.rec.map(([id,why],i)=>`<button class="rrow" data-action="guide" data-v="${id}" data-i="${i}"><span class="num">${i+1}</span><span><b>${P[id].n}</b><small>${why||P[id].d}</small></span><span class="go">GUIDE ›</span></button>`).join('');
  $('#catalog').innerHTML = '<div class="catgrid">'+A.rec.map(([k])=>`<button class="citem" data-action="guide" data-v="${k}"><span class="cl c-${P[k].c}">${CATS.find(c=>c[0]===P[k].c)[1]}</span><b>${P[k].n}</b><small>${P[k].need}</small></button>`).join('')+'</div>';
  $('#tx').innerHTML = A.tx.map(x=>`<div>${x}</div>`).join('');
  $('#flags').innerHTML = A.flags.map(x=>`<div>${x}</div>`).join('');
  startVitals(A.vit);
}
