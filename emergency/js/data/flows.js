/* Question flows: what screen 2 asks for each emergency type.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   FLOWS — what screen 2 asks
   ========================================================= */
const O=(v,b,s)=>({v,b,s});
const FLOWS = {
  pain:{label:'Pain',step:'Location & pain',mode:'body',main:'Location',vp:'Where is the pain?',groups:[
    {k:'pos',label:'Position',tip:'pos',o:[O('inside','Inside','Deep, within the body'),O('outside','Outside','Skin, muscle, surface')]},
    {k:'kind',label:'Kind of pain',tip:'kind',o:[O('sharp','Sharp','Stabbing, cutting'),O('dull','Dull','Aching, pressure'),O('pulsating','Pulsating','Throbbing, in waves'),O('other','Other','Burning, cramping …')]}]},
  bleeding:{label:'Bleeding',step:'Location & bleeding',mode:'body',main:'Location',vp:'Where is the bleeding?',groups:[
    {k:'btype',label:'How is it bleeding?',tip:'btype',o:[O('spurt','Spurting','Bright red, pulsing'),O('flow','Flowing','Steady stream, soaks dressings'),O('ooze','Oozing','Slow, small amount'),O('none','No open wound','Swelling / bruise — internal bleeding?')]},
    {k:'obj',label:'Object stuck in the wound?',tip:'obj',def:'no',o:[O('no','No','Wound is free'),O('yes','Yes','Splinter, metal, glass …')]}]},
  injury:{label:'Injury',step:'Location & injury',mode:'body',main:'Location',vp:'Where is the injury?',groups:[
    {k:'itype',label:'Type of injury',tip:'itype',o:[O('blunt','Impact / blow','Hit against hardware, crushed'),O('cut','Cut / open wound','Skin is open'),O('twist','Twist / sprain','Joint or muscle overstretched'),O('burn','Burn','Heat, chemical, electrical')]},
    {k:'func',label:'Movement & feeling',tip:'func',o:[O('ok','Works normally','Hurts, but full function'),O('pain','Painful to move','Limited by pain'),O('lost','Can’t move / use it','No load possible'),O('numb','Numb or tingling','Changed feeling beyond the injury')]}]},
  breathing:{label:'Breathing trouble',step:'Situation',mode:'list',main:'Situation',q:'What fits best?',hint:'Pick the closest situation — it sets the first actions.',list:[
    O('choke','Choking','While eating or drinking; object in the mouth'),
    O('smoke','Smoke or chemical smell','Fire, burnt smell, leak, burning eyes'),
    O('stale','Stale air / CO₂ alarm','Headache, tired; others feel it too'),
    O('allergy','Allergic reaction','After food or medication; swelling, rash'),
    O('pressure','After a pressure change','Spacewalk, airlock, cabin pressure drop'),
    O('trauma','After a blow to the chest','Impact, fall against hardware'),
    O('chest','With chest pain or pressure','Tightness, sweating, racing heart'),
    O('exert','During / after exercise','On the exercise device'),
    O('infect','With cough or fever','Developed over hours to days'),
    O('panic','Fear / panic','Fast breathing, tingling hands'),
    O('unknown','None of these / don’t know','Came on by itself')],
    groups:[
    {k:'look',label:'Breathing looks like',tip:'look',o:[O('silent','Can’t speak','Silent, hands at the throat'),O('wheeze','Noisy','Wheeze, whistling, cough'),O('fast','Fast & shallow','Short of breath, can still talk'),O('gasp','Slow / gasping','Irregular, long pauses')]},
    {k:'onset',label:'Started',tip:'onset',o:[O('sudden','Suddenly','Seconds to minutes'),O('gradual','Gradually','Hours to days')]}]},
  other:{label:'Other',step:'Symptom',mode:'list',main:'Symptom',q:'What is the main problem?',hint:'Most frequent problems first.',one:true,list:[
    O('digest','Digestive issue','Nausea, vomiting, diarrhoea, constipation, belly cramps'),
    O('dizzy','Dizziness / feeling faint','Light-headed, spinning, unsteady, blacking out'),
    O('fatigue','Fatigue / weakness','Exhausted, can’t concentrate, no strength')],
    soon:['Fever / infection','Vision change','Rash / allergic reaction','Mood / sleep problem','Urinary problem','Seizure'],
    groups:[
    {k:'dur',label:'Since when?',tip:'dur',o:[O('now','Just now','Minutes'),O('today','Today','Hours'),O('days','Several days','Getting worse or constant'),O('onoff','Comes and goes','Repeated episodes')]},
    {k:'sev',label:'How bad?',tip:'sev',cols:3,o:[O('mild','Mild','Can work'),O('mod','Moderate','Work limited'),O('severe','Severe','Can’t work')]}]},
  unconscious:{label:'Unconscious',step:'Quick check',mode:'list',main:'Breathing',kick:'Unresponsive person · 10-second check',q:'Is the person breathing normally?',hint:'Open the airway (head back, chin up). Look at the chest, listen and feel at the mouth — no longer than 10 seconds.',one:true,list:[
    O('yes','Yes — breathing normally','Chest rises regularly, air flow at the mouth'),
    O('no','No — not breathing or only gasping','No movement, or single noisy gasps'),
    O('unsure','Not sure','Treated as “not breathing” — when in doubt, start CPR')],
    groups:[
    {k:'ubleed',label:'Severe bleeding visible?',tip:'ubleed',o:[O('no','No',''),O('yes','Yes','Blood spurting or pooling')]},
    {k:'trig',label:'What happened?',tip:'trig',o:[O('sudden','Sudden collapse','No warning'),O('injury','After injury / impact','Hit, fall, crush'),O('choke','Choking / breathing problem','Before collapsing'),O('air','Bad air suspected','Smoke, smell, CO₂ alarm'),O('seizure','Seizure seen','Jerking, stiff'),O('unknown','Unknown','Found like this')]}]},
};
