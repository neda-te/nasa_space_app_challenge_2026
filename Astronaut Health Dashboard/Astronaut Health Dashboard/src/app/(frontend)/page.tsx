import DashboardApp, { type EmergencySnapshotView } from './DashboardApp'
import { getPayloadClient } from '@/lib/payload'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'emergency-snapshots',
    overrideAccess: false,
    where: {
      simulated: { equals: true },
    },
    sort: '-recordedAt',
    limit: 12,
    depth: 0,
  })

  const emergencySnapshots: EmergencySnapshotView[] = result.docs.map((doc) => ({
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

  return <DashboardApp emergencySnapshots={emergencySnapshots} />
}
