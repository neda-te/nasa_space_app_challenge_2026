/**
 * Simulated data source – the only source that currently delivers data.
 *
 * SIMULATED DATA: every value comes from the hand-written demo datasets in
 * `src/data/simulated`. Nothing is measured. Each reading is labelled
 * `quality: 'simulated'` so it can never be mistaken for a real measurement.
 *
 * The source exists so that the complete pipeline (fetch -> normalise -> validate -> sink)
 * can be run and tested before a real source is connected. It also shows how an adapter
 * maps source-specific data to `RawMeasurement`.
 */

import { environmental } from '../../data/simulated/environment'
import { simulatedRadiationExposure } from '../../data/simulated/radiation'
import { trendMetricData } from '../../data/simulated/trends'
import type { MetricId } from '../core/metrics'
import type { DataSourceAdapter, FetchRequest, RawMeasurement } from '../core/types'

/** The single demo crew member of the prototype. */
const demoSubject = 'MC-01'
const dayMs = 24 * 60 * 60 * 1000

/** Demo trend series -> metric and the unit the series is written in. */
const trendMapping: { key: keyof typeof trendMetricData; metric: MetricId; unit: string }[] = [
  { key: 'sleep', metric: 'sleep-duration', unit: 'h' },
  { key: 'heart', metric: 'heart-rate', unit: 'bpm' },
  { key: 'fatigue', metric: 'fatigue-score', unit: 'score' },
  { key: 'reaction', metric: 'reaction-time', unit: 'ms' },
  { key: 'activity', metric: 'activity-steps', unit: 'steps' },
]

/** Demo environment cards with a single numeric value -> metric. */
const environmentMapping: Record<string, MetricId> = {
  'Carbon Dioxide': 'cabin-co2',
  Noise: 'cabin-noise',
  Lighting: 'cabin-light',
}

/** Splits a display value such as `2.1 mmHg` into number and unit. */
function parseDisplayValue(display: string): { value: number; unit: string } | null {
  const match = /^(-?\d+(?:\.\d+)?)\s*(\S+)$/.exec(display.trim())
  return match ? { value: Number(match[1]), unit: match[2] } : null
}

/**
 * Creates the simulated source.
 *
 * @param now Clock used to date the demo values (the newest value is "now"). Injected in tests.
 */
export function createSimulatedSource(now: () => Date = () => new Date()): DataSourceAdapter {
  return {
    descriptor: {
      id: 'simulated',
      name: 'Simulated demo data',
      kind: 'simulated',
      description:
        'Hand-written demo datasets of the prototype (src/data/simulated). Not real crew measurements.',
      transport: 'In-process (bundled with the app)',
      provides: [
        ...trendMapping.map((entry) => entry.metric),
        'radiation-dose-daily',
        ...Object.values(environmentMapping),
      ],
      status: 'connected',
      quality: 'simulated',
    },

    async fetch(request?: FetchRequest): Promise<RawMeasurement[]> {
      const end = now().getTime()
      const measurements: RawMeasurement[] = []
      const daysAgo = (days: number) => new Date(end - days * dayMs).toISOString()

      // Personal trends: one value per day, newest last.
      for (const { key, metric, unit } of trendMapping) {
        const series = trendMetricData[key].series['7 Days']
        series.forEach((value, index) => {
          measurements.push({
            metric,
            value,
            unit,
            recordedAt: daysAgo(series.length - 1 - index),
            subject: demoSubject,
          })
        })
      }

      // Radiation: daily dose, newest last.
      simulatedRadiationExposure.forEach((value, index) => {
        measurements.push({
          metric: 'radiation-dose-daily',
          value,
          unit: 'mSv',
          recordedAt: daysAgo(simulatedRadiationExposure.length - 1 - index),
          subject: demoSubject,
        })
      })

      // Habitat: current value of the cards that hold exactly one number.
      for (const card of environmental) {
        const metric = environmentMapping[card.name]
        const parsed = metric ? parseDisplayValue(card.value) : null
        if (metric && parsed) {
          measurements.push({
            metric,
            value: parsed.value,
            unit: parsed.unit,
            recordedAt: daysAgo(0),
            location: 'Habitat module',
          })
        }
      }

      return measurements.filter(
        (measurement) =>
          (!request?.since || measurement.recordedAt >= request.since) &&
          (!request?.subject || measurement.subject === request.subject),
      )
    },
  }
}
