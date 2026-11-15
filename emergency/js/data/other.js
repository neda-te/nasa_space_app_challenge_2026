/* Knowledge base for the "Other" emergency type.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   OTHER — top three
   ========================================================= */
const OT = {
  constip:{n:'Constipation',w:'No bowel movement for days, bloating, cramps',b:2,m:{days:2,onoff:1}},
  gastro:{n:'Stomach / bowel infection or food-related',w:'Nausea, vomiting, diarrhoea; others affected?',b:2,m:{now:1,today:2}},
  reflux:{n:'Reflux',w:'Burning behind the breastbone, worse after meals',b:2,m:{onoff:2},t:'Without gravity, stomach contents are not held down.'},
  sms:{n:'Space motion sickness',w:'Typical in the first days of flight — unlikely on mission day 143',b:0,m:{},t:'Affects many crew members in the first days in microgravity and again after returning to gravity.'},
  medfx:{n:'Medication side effect',w:'New drug in the last days?',b:1,m:{days:1}},
  dehyd:{n:'Dehydration / low blood pressure',w:'Dark urine, dry mouth, fast pulse',b:3,m:{today:1,days:1},t:'Records show fluid intake below target for 3 days.'},
  badair:{n:'High CO₂ / low oxygen',w:'Headache, tired; others affected too',b:3,m:{today:1,days:1},t:'Records show elevated cabin CO₂ in the last 24 hours.'},
  sugar:{n:'Low blood sugar',w:'Shaky, sweaty, hungry; better after eating',b:1,m:{now:1,onoff:1}},
  vestib:{n:'Inner ear / balance',w:'Spinning, worse with head movement',b:1,m:{onoff:1}},
  rhythmO:{n:'Heart rhythm problem',w:'Racing or irregular pulse, near-fainting',b:1,m:{now:1,onoff:1,severe:2}},
  sleep:{n:'Sleep loss / shifted body clock',w:'Short nights, shifted schedule',b:3,m:{days:2},t:'Records show 5.2 hours of sleep on average over the last 3 nights.'},
  intake:{n:'Too little food or fluid',w:'Missed meals, weight loss',b:2,m:{days:1}},
  infectO:{n:'Infection starting',w:'Fever, aching, sore throat',b:1,m:{today:1,severe:1}},
  mood:{n:'Stress / low mood',w:'Isolation and workload over months',b:2,m:{days:1,onoff:1},t:'Isolation and confinement are one of the five hazards of human spaceflight.'},
};
const OSCEN = {
  digest:{k:['constip','gastro','reflux','medfx','sms'],rec:[['vitals'],['temp','Fever → infection'],['urine','How concentrated? → dehydration'],['pain','Where exactly, and how strong'],['fluids','Small sips'],['us','If the pain is severe or localised']],tx:['Small sips of fluid with rehydration salts','Light food when the nausea settles','Medication from the kit as confirmed by the flight surgeon'],flags:['Severe, constant belly pain or a hard belly','Blood in vomit or stool','No urine for 8 hours','Fever of 38 °C or more']},
  dizzy:{k:['dehyd','badair','sugar','vestib','rhythmO'],rec:[['vitals','Pulse and blood pressure'],['air','CO₂ and oxygen'],['blood','Blood sugar, electrolytes'],['ecg','Rhythm'],['neuro','Rule out stroke signs'],['fluids']],tx:['Restrain and rest; no hazardous tasks','Drink and eat something sweet','Move to a well-ventilated module'],flags:['Fainting or near-fainting','Chest pain or irregular pulse','New weakness, slurred speech, double vision','Not better after 30 minutes of rest']},
  fatigue:{k:['sleep','badair','intake','mood','infectO'],rec:[['vitals'],['temp','Infection starting?'],['air','CO₂ over the last days'],['urine','Hydration'],['blood','Blood count, blood sugar']],tx:['Protected sleep period; adjust the work schedule','Regular meals and fluid target','Talk with the flight surgeon — also about mood'],flags:['Confusion or can’t stay awake','Breathless at rest','Fever of 38 °C or more','Thoughts of hopelessness']},
};
