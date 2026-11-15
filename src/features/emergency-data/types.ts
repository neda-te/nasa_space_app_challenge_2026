/**
 * Types of the Emergency Data feature.
 */

/**
 * Emergency snapshot as displayed in the UI.
 *
 * Mirrors the `emergency-snapshots` backend collection
 * (`backend/src/collections/EmergencySnapshots.ts`).
 */
export type EmergencySnapshotView = {
  id: string
  externalEventId: string
  astronautCode: string
  recordedAt: string
  eventType: string
  status: string
  bodyRegion: string
  summary: string
  sourceSystem: string
  vitals: {
    heartRate: number | null
    oxygenSaturation: number | null
    systolicPressure: number | null
    diastolicPressure: number | null
  } | null
}
