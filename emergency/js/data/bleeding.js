/* Bleeding knowledge base: vessels and structures under each body zone.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   BLEEDING — what lies under each zone
   ========================================================= */
const D=(n,w,l)=>({n,w,l});
const VESSELS = {
  head:[D('Scalp arteries','Very rich blood supply — scalp wounds bleed heavily but stop with pressure',2),D('Skull and brain beneath','After an impact: no pressure on a soft or dented spot — press around it',2),D('Nose','Nosebleed: pinch the soft part of the nose for 10–15 minutes',1)],
  eye:[D('Eyeball','Never press on the eye. Cover with a rigid shield',3),D('Eyelid and brow','Bleed freely; gentle pressure on the bone edge only',1)],
  ear:[D('Skull base','Blood or clear fluid from the ear after a head impact = possible skull fracture. Do not plug',3),D('Ear canal and eardrum','Small bleed after pressure change or scratch',1)],
  mouth:[D('Airway','Blood does not drain in microgravity — it can be inhaled. Suction, spit into gauze',3),D('Tongue, lips, gums','Bleed heavily; press with gauze or bite on it for 10 minutes',2),D('Tooth socket','Bite firmly on rolled gauze',1)],
  neck:[D('Carotid artery','Main supply to the brain. Press on the wound, one side only',3),D('Jugular vein','Large vein; air can be sucked in — cover and press at once',3),D('Windpipe','Never press on the front of the throat. No tourniquet, no circular bandage',3)],
  chestL:[D('Heart and great vessels','Behind and left of the breastbone. Bleeding here is internal and cannot be pressed',3),D('Lung','Air can enter the chest → collapsed lung. Watch breathing',3),D('Armpit artery','High in the armpit: tourniquet impossible — pack and press',2)],
  chestR:[D('Lung','Air can enter the chest → collapsed lung. Watch breathing',3),D('Great vessels','Behind the breastbone. Internal bleeding cannot be pressed',3),D('Armpit artery','High in the armpit: tourniquet impossible — pack and press',2)],
  upperBack:[D('Lungs','Deep wound can let air into the chest. Watch breathing',3),D('Aorta along the spine','Deep in front of the spine; internal',2),D('Back muscles','Bleed steadily; press firmly',1)],
  upperAbd:[D('Liver (right) and spleen (left)','Bleed heavily inside the belly — invisible from outside',3),D('Aorta','Deep in the midline; cannot be compressed',3),D('Abdominal wall','Outer vessels: stop with pressure',1)],
  lowerAbd:[D('Pelvic arteries','Large vessels deep in the pelvis; internal',3),D('Bowel and bladder','Leak into the belly; cover, do not push anything back',2),D('Abdominal wall','Outer vessels: stop with pressure',1)],
  pelvis:[D('Femoral artery in the groin','Largest leg artery. Too high for a tourniquet — pack and press hard',3),D('Pelvic vessels','A broken pelvis can bleed litres internally',3),D('Bladder','Blood in the urine after injury',1)],
  midBack:[D('Kidneys','Left and right of the spine under the lower ribs; bleed internally',3),D('Aorta and vena cava','Deep in front of the spine; cannot be compressed',3),D('Back muscles','Bleed steadily; press firmly',1)],
  lowerBack:[D('Kidney and its vessels','Flank wound: internal bleeding, blood in the urine',3),D('Aorta and vena cava','Deep in front of the spine; cannot be compressed',2),D('Back muscles','Bleed steadily; press firmly',1)],
  arm:[D('Brachial artery','Inner side of the upper arm — spurting bleed. Tourniquet works here',3),D('Wrist arteries','Thumb side and little-finger side of the wrist',2),D('Armpit artery','Too high for a tourniquet — pack and press',2)],
  leg:[D('Femoral artery','Inner thigh — can be fatal within minutes. Tourniquet high on the thigh',3),D('Artery behind the knee','Deep in the knee hollow; hard to press — tourniquet on the thigh',3),D('Lower-leg arteries','Front and back of the shin; pressure is usually enough',2)],
};
const VKEY = r => ({eyeL:'eye',eyeR:'eye',earL:'ear',earR:'ear',lowerBackL:'lowerBack',lowerBackR:'lowerBack',armL:'arm',armR:'arm',legL:'leg',legR:'leg'}[r]||r);
const BCLASS = r => { const k=VKEY(r); return k==='arm'||k==='leg'?'limb':k==='neck'||k==='pelvis'?'junction':['eye','ear','mouth','head'].includes(k)?k:'torso'; };
