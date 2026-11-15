/**
 * Connection point: on-board laboratory analysers (blood and urine).
 *
 * STATUS: NOT CONNECTED – lab values in the dashboard are simulated.
 *
 * To connect: read the result export of the analyser and map every analyte to a metric of
 * the catalogue (`core/metrics.ts`). Analytes that are not in the catalogue yet need a new
 * catalogue entry first. Units differ between devices (e.g. glucose in mmol/L); report the
 * unit of the device, the gateway converts it.
 */

import { defineUnconnectedSource } from './unconnected-source'

export const labAnalyzerSource = defineUnconnectedSource({
  id: 'lab-analyzer',
  name: 'On-board lab analysers',
  kind: 'lab-analyzer',
  description:
    'Point-of-care blood and urine analysers used for the periodic sample schedule (chemistry, immune and hydration markers).',
  transport: 'Result export of the device (serial / USB / HL7 or FHIR Observation messages)',
  provides: [
    'lab-hemoglobin',
    'lab-fasting-glucose',
    'lab-c-reactive-protein',
    'lab-urine-specific-gravity',
  ],
  quality: 'measured',
})
