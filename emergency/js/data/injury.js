/* Injury knowledge base: likely injuries by mechanism and body zone.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   INJURY — likely injuries by type and zone
   ========================================================= */
const I = {
  bruise:{n:'Bruise (contusion)',w:'Swelling, tender, skin discoloured',b:3,m:{ok:1,pain:1,lost:-1}},
  fracture:{n:'Fracture',w:'Deformity, can’t bear load, grinding feeling',b:1,m:{lost:3,pain:1,numb:1},t:'Bone density falls in microgravity, so bones break more easily after an impact.'},
  jointinj:{n:'Dislocation / joint injury',w:'Joint out of shape or locked',b:1,m:{lost:2}},
  sprain:{n:'Sprain (overstretched ligament)',w:'Swelling around a joint; painful but usable',b:3,m:{pain:1,ok:1}},
  tear:{n:'Ligament or tendon tear',w:'Felt a pop; joint unstable or movement lost',b:1,m:{lost:3}},
  nerve:{n:'Nerve or vessel damage',w:'Numb, tingling, pale or cold beyond the injury',b:0,m:{numb:5}},
  cutS:{n:'Superficial cut',w:'Skin only; edges lie together',b:3,m:{ok:1}},
  cutD:{n:'Deep cut (tendon, nerve, vessel)',w:'Gaping, heavy bleeding, lost movement or feeling',b:1,m:{lost:3,numb:3,pain:1}},
  fb:{n:'Foreign body in the wound',w:'Metal or glass splinter — do not probe blindly',b:1,m:{}},
  burn1:{n:'Superficial burn',w:'Red, dry, painful — like sunburn',b:3,m:{ok:1,pain:1}},
  burn2:{n:'Partial-thickness burn',w:'Blisters, wet, very painful',b:2,m:{pain:1}},
  burn3:{n:'Full-thickness burn',w:'White, leathery or charred; hardly any pain',b:0,m:{numb:4}},
  airburn:{n:'Airway burn / smoke inhalation',w:'Burn on face or neck, hoarse voice, soot in the mouth',b:2,m:{}},
  concuss:{n:'Concussion',w:'Headache, nausea, dazed, memory gap',b:3,m:{pain:1}},
  scalp:{n:'Scalp bruise or wound',w:'Local swelling; scalp wounds bleed heavily',b:3,m:{ok:1}},
  skull:{n:'Skull fracture / bleeding inside the head',w:'Worsening headache, vomiting, drowsy, unequal pupils',b:1,m:{numb:2,lost:2}},
  eyeAbr:{n:'Scratch or particle on the eye',w:'Sharp pain, tearing, gritty feeling',b:3,m:{}},
  eyeChem:{n:'Chemical or heat injury to the eye',w:'Burning, redness, blurred vision — rinse at once',b:3,m:{}},
  eyePen:{n:'Penetrating eye injury',w:'Misshapen pupil, fluid leaking, vision loss',b:1,m:{lost:3,numb:1}},
  eardrum:{n:'Eardrum / ear injury',w:'Pain, muffled hearing, ringing',b:3,m:{}},
  tooth:{n:'Broken or knocked-out tooth',w:'Keep the tooth moist; do not touch the root',b:3,m:{}},
  jaw:{n:'Jaw fracture',w:'Teeth no longer fit together; can’t open the mouth',b:1,m:{lost:3}},
  whiplash:{n:'Neck strain',w:'Stiff, painful to turn',b:3,m:{pain:1,ok:1}},
  cspineI:{n:'Neck spine injury',w:'Pain in the midline; tingling or weakness in arms or legs',b:1,m:{numb:4,lost:3}},
  ribs:{n:'Rib bruise / fracture',w:'Sharp pain when breathing in or pressing',b:3,m:{pain:1}},
  pneumoI:{n:'Collapsed lung',w:'Breathless, sharp pain on one side',b:1,m:{lost:1}},
  penchest:{n:'Penetrating chest wound',w:'Air or bubbling at the wound, breathless',b:1,m:{}},
  abdwall:{n:'Abdominal wall bruise',w:'Hurts when tensing the belly muscles',b:3,m:{ok:1}},
  organ:{n:'Internal organ injury (spleen, liver, bladder)',w:'Increasing pain, hard belly, pale, fast pulse',b:1,m:{lost:2,pain:1}},
  penabd:{n:'Penetrating abdominal wound',w:'Cover moist and sterile; push nothing back',b:1,m:{}},
  backm:{n:'Back muscle bruise / strain',w:'Local pain, worse with movement',b:3,m:{ok:1,pain:1}},
  spineI:{n:'Spinal injury',w:'Midline pain; numbness or weakness in the legs',b:1,m:{numb:4,lost:3}},
  kidneyI:{n:'Kidney injury',w:'Flank pain, blood in the urine',b:1,m:{}},
  strain:{n:'Muscle strain',w:'Pain on use, tender to touch',b:3,m:{}},
};
const ICLASS = r => { const k=VKEY(r); return k==='arm'||k==='leg'?'limb':['head','eye','ear','mouth','neck'].includes(k)?k:['chestL','chestR','upperBack'].includes(k)?'chest':['upperAbd','lowerAbd','pelvis'].includes(k)?'abdomen':'back'; };
const IKEYS = {
  blunt:{head:['scalp','concuss','skull'],eye:['eyeAbr','eyePen'],ear:['eardrum','concuss'],mouth:['tooth','jaw'],neck:['whiplash','cspineI'],chest:['ribs','pneumoI','bruise'],abdomen:['abdwall','organ'],back:['backm','spineI','kidneyI'],limb:['bruise','fracture','jointinj','nerve']},
  cut:{_:['cutS','cutD','fb'],eye:['eyePen','eyeAbr'],chest:['cutS','cutD','penchest'],abdomen:['cutS','cutD','penabd']},
  twist:{_:['strain'],limb:['sprain','tear','fracture','jointinj'],neck:['whiplash','cspineI'],back:['backm','spineI']},
  burn:{_:['burn1','burn2','burn3'],head:['burn1','burn2','burn3','airburn'],mouth:['airburn','burn2','burn1'],neck:['burn1','burn2','burn3','airburn'],eye:['eyeChem','burn1']},
};
const IREC = {
  blunt:{head:[['neuro','Concussion or bleeding inside the head?'],['cspine','A blow to the head can also injure the neck'],['vitals'],['pain']],eye:[['eye','Vision, pupil shape, particle'],['neuro']],ear:[['ent','Blood or fluid in the ear canal?'],['neuro']],mouth:[['ent','Teeth, jaw, bleeding'],['dental'],['airway','Loose tooth or blood can block the airway']],neck:[['cspine','Keep the head still until cleared'],['neuro','Feeling and strength in arms and legs'],['vitals']],chest:[['vitals','SpO₂ and breathing rate'],['sound','Both lungs ventilated?'],['us','Collapsed lung, blood in the chest'],['o2','If SpO₂ is under 94 %'],['pain']],abdomen:[['vitals','Pulse up, pressure down = internal bleeding'],['us','Free fluid in the belly'],['urine','Blood → kidney or bladder injured'],['pain']],back:[['cspine','Keep the spine still until cleared'],['neuro','Feeling and strength in the legs'],['urine','Blood → kidney injured'],['us']],limb:[['splint','Check feeling and warmth first, then immobilise'],['us','Fracture line, tendon, joint fluid'],['pain'],['vitals']]},
  cut:{_:[['press','Stop the bleeding first'],['wound','Clean, close, cover'],['bodycheck','Feeling and movement beyond the cut'],['vitals']],eye:[['eye','No pressure, no rinsing — rigid shield'],['neuro']],chest:[['press','On the outer wound only'],['vitals','SpO₂ and breathing rate'],['sound','Both lungs ventilated?'],['us','Collapsed lung, blood in the chest'],['o2']],abdomen:[['press','Cover; push nothing back'],['vitals','Pulse up, pressure down = internal bleeding'],['us','Free fluid in the belly']]},
  twist:{_:[['pain'],['vitals']],limb:[['splint','Check feeling and warmth first, then immobilise'],['us','Tendon, ligament, joint fluid'],['pain']],neck:[['cspine','Keep the head still until cleared'],['neuro','Feeling and strength in arms and legs'],['pain']],back:[['neuro','Feeling and strength in the legs'],['pain'],['urine']]},
  burn:{_:[['burn','Cool for 20 minutes, cover loosely'],['pain'],['vitals'],['fluids','Burns lose fluid']],head:[['burn','Cool for 20 minutes, cover loosely'],['airway','Hoarse voice or soot = airway at risk'],['o2'],['sound'],['vitals']],mouth:[['airway','Swelling can close the airway'],['o2'],['ent'],['vitals']],neck:[['burn','Cool for 20 minutes, cover loosely'],['airway','Hoarse voice or soot = airway at risk'],['o2'],['vitals']],eye:[['eyewash','At once — at least 15 minutes for chemicals'],['eye','After rinsing'],['pain']]},
};
const ITX = {
  blunt:['Rest and protect the area','Cold pack over cloth, 15–20 minutes, if on board','Pain relief as confirmed by the flight surgeon'],
  cut:['Keep the dressing clean and dry','Check daily: redness, warmth, pus','Antibiotics only if the flight surgeon orders them'],
  twist:['Rest, elastic bandage, immobilise','Cold pack over cloth, 15–20 minutes, if on board','No load until the flight surgeon clears it'],
  burn:['Loose sterile dressing; do not open blisters','Drink more','Pain relief as confirmed by the flight surgeon'],
};
const IFLAGS = {
  head:['Vomiting or worsening headache','Drowsy, confused, memory gap','Unequal pupils or a seizure','Blood or clear fluid from ear or nose'],
  eye:['Vision loss or double vision','Misshapen pupil','Chemical in the eye'],
  ear:['Blood or clear fluid from the ear','Sudden hearing loss or spinning'],
  mouth:['Swelling of tongue or throat','Teeth no longer fit together','Bleeding that does not stop'],
  neck:['Numbness or weakness in arms or legs','Severe pain in the midline','Trouble swallowing or breathing'],
  chest:['Shortness of breath','SpO₂ under 94 %','Coughing blood'],
  abdomen:['Hard, rigid belly','Pale, fast pulse, falling blood pressure','Blood in the urine'],
  back:['Numbness or weakness in the legs','Loss of bladder control','Blood in the urine'],
  limb:['Numb, pale or cold beyond the injury','Visible deformity or bone in the wound','Pain out of proportion, tight swollen muscle'],
  burn:['Blistered area larger than the patient’s palm','Burn on face, hands, groin or all around a limb','Hoarse voice or breathing trouble','White or charred skin'],
};
