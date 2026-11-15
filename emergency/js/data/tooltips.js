/* Texts of the info tooltips.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   TOOLTIPS
   ========================================================= */
const TIPS = {
  s1:`<h4>How it works</h4>Choose the category that fits best. One tap — no typing needed.<br><span class="m">If the person does not react, tick the red box first.</span>`,
  pos:`<h4>Position</h4><b>Inside</b> = deep pain you can't press on directly (organs).<br><b>Outside</b> = skin, muscle or bone — usually worse when you press or move.`,
  kind:`<h4>Kind of pain</h4><ul><li><b>Sharp</b> – stabbing; stones, injuries, foreign bodies</li><li><b>Dull</b> – aching, pressure; inflammation, muscles, heart</li><li><b>Pulsating</b> – in waves (colic) or throbbing (tooth, ear)</li><li><b>Other</b> – burning, cramping</li></ul>`,
  btype:`<h4>Bleeding type</h4><b>Spurting or flowing without pause</b> = life-threatening. Act within seconds.<br><b>Oozing</b> usually stops with a few minutes of pressure.<br><span class="m">Rule of thumb: about half a drinks can of blood is already dangerous.</span>`,
  obj:`<h4>Object in the wound</h4>Never pull it out — it may be plugging a vessel. Press on both sides and pad around it.`,
  itype:`<h4>Type of injury</h4>Sets which injuries are likely and what to check first.`,
  func:`<h4>Movement & feeling</h4>Lost movement points to fracture or tear. Numbness or tingling points to nerve or vessel damage — more urgent.`,
  look:`<h4>Breathing</h4><b>Can't speak</b> = airway blocked.<br><b>Noisy</b> = airways narrowed.<br><b>Slow / gasping</b> = about to stop: prepare CPR.`,
  onset:`<h4>Onset</h4>Sudden: blockage, collapsed lung, clot, allergy. Gradual: infection, cabin air.`,
  dur:`<h4>Duration</h4>Separates acute causes from slow ones such as sleep loss or dehydration.`,
  sev:`<h4>Severity</h4>“Severe” moves heart, infection and other serious causes up the list.`,
  ubleed:`<h4>Severe bleeding</h4>Life-threatening bleeding is stopped at once, in parallel to airway and breathing.`,
  trig:`<h4>What happened</h4>Changes the likely cause — and your own safety: with bad air, put on your mask first.`,
  records:`<h4>Why records matter</h4>The crew member's records shift the priors — e.g. bone loss in microgravity raises both kidney-stone and fracture risk.<br><span class="m">Values shown are demo data.</span>`,
  causes:`<h4>How this list is built</h4>Rule-based: typical causes for the selection, ranked by your answers. Uses general medical knowledge and known spaceflight risks.<br><span class="m">Supports — never replaces — the flight surgeon.</span>`,
  danger:`<h4>What lies here</h4>Structures under the selected area that make a bleed dangerous, and what that means for stopping it.`,
  do:`<h4>Do now</h4>The most useful steps for this case, in order. Tap a row for the step-by-step guide.`,
  cat:`<h4>What to grab</h4>Only the procedures suggested for this case, with the equipment each needs. Tap one for its step-by-step guide.`,
  tx:`<h4>Treatment</h4>Drugs and doses are always confirmed by the flight surgeon, who receives this report live.`,
};
