/**
 * Connection point: wearable biosensors (chest strap / wrist device / smart garment).
 *
 * STATUS: NOT CONNECTED – no device is attached to the prototype.
 *
 * To connect: replace `defineUnconnectedSource` with an adapter whose `fetch` reads the
 * device (or its base station) and returns one `RawMeasurement` per sample, e.g.
 *
 *   { metric: 'heart-rate', value: 62, unit: 'bpm', recordedAt: '2026-11-15T10:00:00Z', subject: 'MC-01' }
 *
 * Continuous signals should be down-sampled on the device side (e.g. 1 value per minute);
 * the gateway stores what it receives.
 */

import { defineUnconnectedSource } from './unconnected-source'

export const wearableBiosensorSource = defineUnconnectedSource({
  id: 'wearable-biosensor',
  name: 'Wearable biosensors',
  kind: 'wearable',
  description:
    'Body-worn sensors of each crew member: heart rate, SpO₂, respiratory rate, skin temperature, sleep and activity.',
  transport: 'Bluetooth LE to the habitat base station, or the vendor SDK / REST API of the device',
  provides: [
    'heart-rate',
    'oxygen-saturation',
    'respiratory-rate',
    'body-temperature',
    'sleep-duration',
    'sleep-quality',
    'activity-steps',
  ],
  quality: 'measured',
})
