/** The same five-minute fixture used by dashboard and emergency playback. */
import demo from '../../../data/demo-telemetry.json'
import type { DataSourceAdapter, FetchRequest, RawMeasurement } from '../core/types'
const fields = [
  ['heartRate', 'heart-rate', 'bpm'], ['spo2', 'oxygen-saturation', '%'],
  ['systolic', 'blood-pressure-systolic', 'mmHg'], ['diastolic', 'blood-pressure-diastolic', 'mmHg'],
  ['temperature', 'skin-temperature', '°C'], ['co2', 'cabin-co2', 'mmHg'],
  ['respiratoryRate', 'respiratory-rate', '/min'],
] as const
export function createSimulatedSource(now: () => Date = () => new Date()): DataSourceAdapter {
  // Stable origin: repeated fetches do not re-date identical samples.
  const start = now().getTime() - demo.samples[demo.samples.length - 1].elapsedSeconds * 1000
  return {
    descriptor: {
      id: 'simulated', name: 'Five-minute simulated telemetry', kind: 'simulated',
      description: 'Shared data/demo-telemetry.json fixture. No real crew measurements.',
      transport: 'Bundled JSON fixture', provides: fields.map(([, metric]) => metric),
      status: 'connected', quality: 'simulated',
    },
    async fetch(request?: FetchRequest): Promise<RawMeasurement[]> {
      return demo.samples.flatMap(sample => fields.map(([field, metric, unit]) => ({
        metric, value: sample[field], unit,
        recordedAt: new Date(start + sample.elapsedSeconds * 1000).toISOString(),
        subject: field === 'co2' ? undefined : 'MC-01',
        location: field === 'co2' ? 'Habitat module' : undefined,
        sensorId: field === 'co2' ? 'demo-cabin' : 'demo-wearable',
      }))).filter(measurement =>
        (!request?.since || Date.parse(measurement.recordedAt) >= Date.parse(request.since)) &&
        (!request?.subject || measurement.subject === request.subject),
      )
    },
  }
}
