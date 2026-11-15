/* Knowledge base for an unconscious crew member.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   UNCONSCIOUS — causes
   ========================================================= */
const U = {
  arrest:{n:'Cardiac arrest',w:'Not breathing normally = treat as cardiac arrest',b:2,m:{br_no:4,br_unsure:3,tr_sudden:1,ty_pain:1},t:'Unresponsive and not breathing normally is treated as cardiac arrest until proven otherwise. Gasping is not normal breathing.'},
  hypoxia:{n:'Lack of oxygen / bad cabin air',w:'Smoke, toxic gas, CO₂ build-up or pressure loss',b:1,m:{tr_air:4,ty_breathing:2,br_no:1},t:'Protect yourself first: your own mask, then move the patient to clean air.'},
  chokeU:{n:'Blocked airway',w:'Collapsed while choking; object may be visible in the mouth',b:0,m:{tr_choke:4,ty_breathing:1,br_no:1}},
  syncope:{n:'Fainting (brief drop in blood pressure)',w:'Wakes up within 1–2 minutes',b:2,m:{br_yes:2,tr_sudden:1}},
  headinj:{n:'Head injury',w:'After impact; look for wounds, check pupils',b:0,m:{tr_injury:4,ty_injury:2},t:'Assume the neck is injured too: keep head and neck still.'},
  bloodloss:{n:'Severe blood loss / shock',w:'Pale, cold, fast weak pulse',b:0,m:{bl_yes:5,ty_bleeding:2},t:'Stop the bleeding with direct pressure in parallel to everything else.'},
  postict:{n:'After a seizure',w:'Slowly waking, confused, may have bitten the tongue',b:0,m:{tr_seizure:5,br_yes:1},t:'A short seizure-like jerking can also be the first sign of cardiac arrest — check breathing as soon as it stops.'},
  sugarU:{n:'Low blood sugar',w:'Sweaty, pale; blood test shows it in a minute',b:1,m:{br_yes:1}},
  medsU:{n:'Medication effect',w:'Records: sleep aid taken in the last 24 hours',b:1,m:{br_yes:1}},
  stroke:{n:'Stroke',w:'Face droops on one side, unequal pupils',b:1,m:{br_yes:1}},
};
