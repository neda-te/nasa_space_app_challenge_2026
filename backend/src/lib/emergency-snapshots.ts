/**
 * Read access to the emergency snapshot archive.
 */

import 'server-only'

import { getPayloadClient } from '@/lib/payload'
import type { EmergencySnapshotView } from '@dashboard/features/emergency-data/types'

/**
 * Returns the most recent emergency snapshots for the Emergency Data page.
 *
 * Only records flagged `simulated` are exposed: the prototype must never show a real
 * medical event.
 */
export async function listEmergencySnapshots(limit = 12): Promise<EmergencySnapshotView[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'emergency-snapshots',
    overrideAccess: false,
    where: {
      simulated: { equals: true },
    },
    sort: '-recordedAt',
    limit,
    depth: 0,
  })

  return result.docs.map((doc) => ({
    id: String(doc.id),
    externalEventId: doc.externalEventId,
    astronautCode: doc.astronautCode,
    recordedAt: doc.recordedAt,
    eventType: doc.eventType,
    status: doc.status,
    bodyRegion: doc.bodyRegion,
    summary: doc.summary,
    sourceSystem: doc.sourceSystem,
    vitals: doc.vitals
      ? {
          heartRate: doc.vitals.heartRate ?? null,
          oxygenSaturation: doc.vitals.oxygenSaturation ?? null,
          systolicPressure: doc.vitals.systolicPressure ?? null,
          diastolicPressure: doc.vitals.diastolicPressure ?? null,
        }
      : null,
  }))
}
