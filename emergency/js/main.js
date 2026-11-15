/* Start-up. Must be the last script: everything above only declares data and functions.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

init3D(); renderStepper(); updateFooter();
