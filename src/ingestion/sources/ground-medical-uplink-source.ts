/**
 * Connection point: ground medical team (flight surgeon uplink).
 *
 * STATUS: NOT CONNECTED – there is no link to a ground segment in the prototype.
 *
 * To connect: receive the data packages the ground medical team sends up (results of
 * analyses done on the ground, corrected values) and report them as measurements. The
 * link is delayed and can drop out, so `fetch` must tolerate gaps and may deliver values
 * late; `recordedAt` is always the original measurement time, not the arrival time.
 */

import { defineUnconnectedSource } from './unconnected-source'

export const groundMedicalUplinkSource = defineUnconnectedSource({
  id: 'ground-medical-uplink',
  name: 'Ground medical uplink',
  kind: 'ground-uplink',
  description:
    'Results and corrections sent by the flight-surgeon team on the ground over the mission communication link.',
  transport: 'Mission communication link (delay-tolerant, store-and-forward)',
  provides: ['lab-hemoglobin', 'lab-fasting-glucose', 'lab-c-reactive-protein', 'radiation-dose-daily'],
  quality: 'measured',
})
