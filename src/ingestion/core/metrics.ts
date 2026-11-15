/**
 * Catalogue of the metrics HEALium understands.
 *
 * Every metric has ONE canonical unit. Sources may report other units; the gateway
 * converts them (see `units.ts`).
 *
 * `min` / `max` are plausibility limits used to reject sensor glitches and broken
 * imports. They are deliberately wide and are NOT clinical reference ranges.
 */

export type MetricCategory = 'vital' | 'sleep-activity' | 'performance' | 'self-report' | 'lab' | 'radiation' | 'environment'

export interface MetricDefinition {
  label: string
  category: MetricCategory
  /** Canonical unit. */
  unit: string
  min: number
  max: number
}

export const metricCatalogue = {
  'heart-rate': { label: 'Heart rate', category: 'vital', unit: 'bpm', min: 20, max: 250 },
  'oxygen-saturation': { label: 'Oxygen saturation (SpO₂)', category: 'vital', unit: '%', min: 50, max: 100 },
  'blood-pressure-systolic': { label: 'Systolic blood pressure', category: 'vital', unit: 'mmHg', min: 40, max: 300 },
  'blood-pressure-diastolic': { label: 'Diastolic blood pressure', category: 'vital', unit: 'mmHg', min: 20, max: 200 },
  'respiratory-rate': { label: 'Respiratory rate', category: 'vital', unit: '/min', min: 2, max: 80 },
  'body-temperature': { label: 'Body temperature', category: 'vital', unit: '°C', min: 30, max: 45 },

  'sleep-duration': { label: 'Sleep duration', category: 'sleep-activity', unit: 'h', min: 0, max: 24 },
  'sleep-quality': { label: 'Sleep quality', category: 'sleep-activity', unit: '%', min: 0, max: 100 },
  'activity-steps': { label: 'Physical activity', category: 'sleep-activity', unit: 'steps', min: 0, max: 100000 },

  'reaction-time': { label: 'Reaction time', category: 'performance', unit: 'ms', min: 100, max: 2000 },
  'fatigue-score': { label: 'Subjective fatigue', category: 'self-report', unit: 'score', min: 0, max: 10 },

  'lab-hemoglobin': { label: 'Hemoglobin', category: 'lab', unit: 'g/dL', min: 3, max: 25 },
  'lab-fasting-glucose': { label: 'Fasting glucose', category: 'lab', unit: 'mg/dL', min: 20, max: 600 },
  'lab-c-reactive-protein': { label: 'C-reactive protein', category: 'lab', unit: 'mg/L', min: 0, max: 500 },
  'lab-urine-specific-gravity': { label: 'Urine specific gravity', category: 'lab', unit: 'ratio', min: 1, max: 1.06 },

  'radiation-dose-daily': { label: 'Daily radiation dose', category: 'radiation', unit: 'mSv', min: 0, max: 1000 },

  'cabin-co2': { label: 'Cabin CO₂ partial pressure', category: 'environment', unit: 'mmHg', min: 0, max: 40 },
  'cabin-pressure': { label: 'Cabin pressure', category: 'environment', unit: 'kPa', min: 0, max: 150 },
  'cabin-temperature': { label: 'Cabin temperature', category: 'environment', unit: '°C', min: -20, max: 60 },
  'cabin-humidity': { label: 'Cabin humidity', category: 'environment', unit: '%', min: 0, max: 100 },
  'cabin-noise': { label: 'Cabin noise level', category: 'environment', unit: 'dBA', min: 0, max: 140 },
  'cabin-light': { label: 'Cabin illuminance', category: 'environment', unit: 'lux', min: 0, max: 100000 },
} as const satisfies Record<string, MetricDefinition>

/** Identifier of a known metric. */
export type MetricId = keyof typeof metricCatalogue

/** Type guard for metric names coming from outside. */
export function isMetricId(value: string): value is MetricId {
  return Object.prototype.hasOwnProperty.call(metricCatalogue, value)
}

/** Returns the definition of a metric. */
export function getMetric(id: MetricId): MetricDefinition {
  return metricCatalogue[id]
}
