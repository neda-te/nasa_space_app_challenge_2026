/**
 * Connection point: habitat environmental control and life support (ECLSS) telemetry.
 *
 * STATUS: NOT CONNECTED – environment cards show simulated values.
 *
 * To connect: subscribe to the habitat telemetry and report each sensor value with its
 * `location` (module name) instead of a `subject`. Cabin pressure is often reported in psi
 * and temperature in °F; report the native unit, the gateway converts to kPa and °C.
 */

import { defineUnconnectedSource } from './unconnected-source'

export const habitatEnvironmentSource = defineUnconnectedSource({
  id: 'habitat-environment',
  name: 'Habitat environment sensors',
  kind: 'habitat-sensor',
  description:
    'Cabin sensors of the life-support system: CO₂ partial pressure, cabin pressure, temperature, humidity, noise and lighting.',
  transport: 'Habitat telemetry stream (vehicle data bus / message queue)',
  provides: [
    'cabin-co2',
    'cabin-pressure',
    'cabin-temperature',
    'cabin-humidity',
    'cabin-noise',
    'cabin-light',
  ],
  quality: 'measured',
})
