/**
 * Connection point: radiation dosimeters (personal and area).
 *
 * STATUS: NOT CONNECTED – the radiation chart uses a simulated dose series.
 *
 * To connect: read the accumulated dose of each active dosimeter and report one value per
 * day and crew member (personal dosimeter) or per location (area dosimeter). Active
 * detectors of the kind flown on Artemis I (e.g. DLR M-42) deliver such dose data
 * continuously; passive detectors are read out after the mission and would arrive through
 * the file import instead.
 */

import { defineUnconnectedSource } from './unconnected-source'

export const radiationDosimeterSource = defineUnconnectedSource({
  id: 'radiation-dosimeter',
  name: 'Radiation dosimeters',
  kind: 'dosimeter',
  description: 'Active personal and area dosimeters measuring the absorbed radiation dose.',
  transport: 'Data interface of the detector (USB / serial readout or vehicle data bus)',
  provides: ['radiation-dose-daily'],
  quality: 'measured',
})
