/* Breathing-trouble knowledge base: causes per situation and red flags.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   BREATHING — causes per situation
   ========================================================= */
const B = {
  obstruct:{n:'Airway blocked by food or an object',w:'Sudden; can’t speak or cough, hands at the throat',b:3,m:{silent:3,sudden:1},t:'Food and small parts float in microgravity and can be breathed in while eating or working.'},
  aspir:{n:'Something inhaled into the lung',w:'Coughing fit, wheeze on one side',b:2,m:{wheeze:2}},
  smoke:{n:'Smoke / combustion gases',w:'After fire or overheated equipment; cough, headache',b:3,m:{wheeze:1},t:'Fire is one of the three classic spacecraft emergencies. Smoke contains carbon monoxide, which blocks oxygen transport in the blood.'},
  toxic:{n:'Toxic chemical in the air',w:'Burning eyes, nose and throat; sharp smell (e.g. ammonia coolant)',b:3,m:{wheeze:1,sudden:1},t:'A toxic release is one of the three classic spacecraft emergencies. On the ISS the reference case is ammonia from the cooling loops.'},
  co2:{n:'High CO₂ / low oxygen in the cabin',w:'Headache, tiredness, fast breathing; others affected too',b:3,m:{fast:1,gradual:2},t:'CO₂ is removed by machines. If they fail, or air does not circulate, CO₂ builds up — in microgravity even as a local pocket.'},
  anaph:{n:'Severe allergic reaction (anaphylaxis)',w:'Swelling of lips or throat, rash, wheeze, feeling faint',b:3,m:{wheeze:1,silent:2,sudden:1}},
  asthma:{n:'Airway spasm (asthma-like)',w:'Wheeze, tight chest, long breath out',b:2,m:{wheeze:3}},
  dcs:{n:'Decompression sickness',w:'After a pressure drop: chest pain, cough, joint pain, tingling',b:3,m:{},t:'When pressure falls quickly, dissolved nitrogen forms bubbles in blood and tissue — the same mechanism as in divers.'},
  baro:{n:'Lung overpressure injury / collapsed lung',w:'Sharp one-sided chest pain after the pressure change',b:2,m:{fast:1,sudden:1}},
  hypox:{n:'Too little oxygen (pressure loss)',w:'Light-headed, tingling, poor judgement',b:2,m:{fast:1}},
  pneumo:{n:'Collapsed lung (pneumothorax)',w:'Sharp pain on one side, worse when breathing in',b:3,m:{fast:1,sudden:1},t:'Air between lung and chest wall. Ultrasound can show it; one side sounds silent with the stethoscope.'},
  rib:{n:'Rib injury',w:'Pain stops deep breaths; one tender spot',b:3,m:{fast:1}},
  hemo:{n:'Bleeding into the chest',w:'Breathless and pale with a fast pulse after a hard impact',b:1,m:{}},
  mi:{n:'Heart attack / heart failure',w:'Pressure in the chest, sweating, spreads to arm or jaw',b:3,m:{sudden:1},t:'Cardiovascular events are a recognised spaceflight risk. ECG and heart-muscle marker in the blood help to confirm.'},
  pe:{n:'Clot in the lung (pulmonary embolism)',w:'Sudden breathlessness, sharp pain, fast pulse',b:2,m:{sudden:2,fast:1},t:'A clot travels from a vein into the lung. A clot in a neck vein has been found in an ISS crew member.'},
  rhythm:{n:'Heart rhythm problem',w:'Racing or irregular pulse, dizziness',b:2,m:{}},
  exertion:{n:'Overexertion',w:'Settles within minutes of rest',b:2,m:{fast:2}},
  pneum:{n:'Lung infection (pneumonia / bronchitis)',w:'Cough, fever, coloured sputum',b:3,m:{gradual:2}},
  uri:{n:'Upper airway infection',w:'Blocked nose, sore throat',b:2,m:{gradual:1},t:'The fluid shift toward the head in microgravity makes nasal congestion worse.'},
  panic:{n:'Panic / hyperventilation',w:'Fast breathing, tingling hands and lips, fear',b:3,m:{fast:2},t:'Only assume this after physical causes are ruled out: SpO₂ normal, air readouts normal.'},
};
const BSCEN = {
  choke:{k:['obstruct','aspir','anaph'],rec:[['choke','Only if they cannot speak or cough'],['airway','Look for the object'],['o2','After the airway is clear'],['vitals'],['sound','Wheeze on one side = something went deeper']],tx:['Let the person cough in a position they choose','Keep watching for 24 hours: cough, fever → flight surgeon','Nothing to eat or drink until the flight surgeon clears it']},
  smoke:{k:['smoke','toxic','co2'],rec:[['o2','Your own mask first, then leave the module'],['air','Find and isolate the source'],['vitals','SpO₂ may read falsely normal after smoke'],['eyewash','If the eyes burn'],['sound','Wheeze = airways irritated']],tx:['Stay in the clean module until the air readouts are normal','Remove contaminated clothing','Symptoms can worsen hours later — watch for 24 hours']},
  stale:{k:['co2','hypox'],rec:[['air','CO₂, oxygen, pressure in this module'],['o2','Move to good air first'],['vitals'],['neuro','Confusion = urgent']],tx:['Increase ventilation; do not sleep in dead-air corners','Symptoms should clear within an hour in good air','Report CO₂ scrubber status to the ground']},
  allergy:{k:['anaph','asthma'],rec:[['epi','If throat swelling, wheeze or faintness'],['o2'],['vitals','Falling blood pressure = shock'],['airway','Swelling can close the throat'],['meds','Antihistamine as confirmed']],tx:['Stop the suspected food or drug','Symptoms can return after hours — monitor for at least 6 hours','Note the trigger in the records']},
  pressure:{k:['dcs','baro','hypox'],rec:[['o2','100 % oxygen at once'],['vitals'],['neuro','Tingling, weakness, confusion'],['us','Collapsed lung'],['sound']],tx:['Restore full cabin pressure','Keep the patient at rest and on oxygen','Further treatment is decided by the flight surgeon']},
  trauma:{k:['pneumo','rib','hemo'],rec:[['vitals','SpO₂ and breathing rate'],['sound','One side silent?'],['us','Collapsed lung, blood in the chest'],['o2','If SpO₂ is under 94 %'],['pain','Pain relief allows deep breaths']],tx:['Position that makes breathing easiest','Pain relief as confirmed, so deep breaths are possible','No exercise until cleared']},
  chest:{k:['mi','pe','rhythm','pneumo'],rec:[['ecg','Heart attack or rhythm problem'],['vitals'],['o2','If SpO₂ is under 94 %'],['blood','Heart-muscle marker'],['us','Heart pumping, lung']],tx:['Absolute rest','Medication only as ordered by the flight surgeon','Keep the defibrillator next to the patient']},
  exert:{k:['asthma','exertion','co2','rhythm'],rec:[['vitals','Recovering within 5–10 minutes?'],['sound','Wheeze'],['air','CO₂ near the exercise device'],['ecg','If pulse is irregular or chest hurts']],tx:['Stop exercising; rest upright','Resume only when free of symptoms','Wheeze: inhaler from the kit as confirmed']},
  infect:{k:['pneum','uri','asthma'],rec:[['temp'],['vitals','SpO₂'],['sound','Crackling over one area'],['blood','White blood cells'],['us','Lung']],tx:['Rest, drink more','Antibiotics only if the flight surgeon orders them','Hygiene: mask, wipe surfaces — protect the crew']},
  panic:{k:['panic','co2','pe'],rec:[['vitals','SpO₂ must be normal'],['air','Rule out bad air'],['calm','Only after the two checks above'],['ecg','If the pulse stays high']],tx:['Quiet place, one calm person stays','Talk with the flight surgeon about triggers','Sleep and workload review']},
  unknown:{k:['co2','pe','mi','anaph'],rec:[['vitals'],['air','Others affected?'],['sound'],['ecg'],['us','Lung and heart']],tx:['Rest upright','Oxygen if SpO₂ is under 94 %','Flight surgeon decides on medication']},
};
const BFLAGS=['SpO₂ under 90 % despite oxygen','Blue lips; can’t finish a sentence','Breathing slows or turns into gasping','Drowsy or confused','Several crew affected → cabin air emergency'];
