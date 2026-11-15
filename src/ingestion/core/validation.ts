/**
 * Normalisation and validation of incoming measurements.
 *
 * A measurement becomes a `Reading` only if
 *   1. its metric is in the catalogue,
 *   2. its value is a finite number,
 *   3. its unit can be converted to the canonical unit,
 *   4. the converted value is physically plausible, and
 *   5. its timestamp is valid and not in the future.
 * Everything else is rejected with the reasons, never silently "repaired".
 */

import { getMetric, isMetricId } from './metrics'
import type { RawMeasurement, Reading, SourceDescriptor, ValidationIssue } from './types'
import { toCanonicalUnit } from './units'

/** Clock differences between a source and the gateway that are tolerated. */
const futureToleranceMs = 5 * 60 * 1000

export type NormalisationResult =
  | { ok: true; reading: Reading }
  | { ok: false; issues: ValidationIssue[] }

/**
 * Converts one raw measurement of `source` into a validated reading.
 *
 * @param now Current time; injected so that the function stays deterministic in tests.
 */
export function normaliseMeasurement(
  measurement: RawMeasurement,
  source: SourceDescriptor,
  now: Date,
): NormalisationResult {
  const issues: ValidationIssue[] = []

  const recordedAt = new Date(measurement.recordedAt)
  if (Number.isNaN(recordedAt.getTime())) {
    issues.push({ code: 'invalid-timestamp', message: `"${measurement.recordedAt}" is not a valid ISO 8601 time.` })
  } else if (recordedAt.getTime() > now.getTime() + futureToleranceMs) {
    issues.push({ code: 'timestamp-in-future', message: 'The measurement time lies in the future.' })
  }

  if (!isMetricId(measurement.metric)) {
    issues.push({ code: 'unknown-metric', message: `Unknown metric "${measurement.metric}".` })
    return { ok: false, issues }
  }
  const metric = getMetric(measurement.metric)

  if (typeof measurement.value !== 'number' || !Number.isFinite(measurement.value)) {
    issues.push({ code: 'invalid-value', message: 'The value is not a finite number.' })
    return { ok: false, issues }
  }

  const value = toCanonicalUnit(measurement.value, measurement.unit, metric.unit)
  if (value === null) {
    issues.push({
      code: 'unsupported-unit',
      message: `Unit "${measurement.unit}" cannot be converted to "${metric.unit}".`,
    })
    return { ok: false, issues }
  }
  if (value < metric.min || value > metric.max) {
    issues.push({
      code: 'out-of-range',
      message: `${value} ${metric.unit} is outside the plausible range ${metric.min}–${metric.max} ${metric.unit}.`,
    })
  }
  if (issues.length > 0) return { ok: false, issues }

  const subject = measurement.subject?.trim() || null
  const location = measurement.location?.trim() || null
  const sensorId = measurement.sensorId?.trim() || null
  const recordedAtIso = recordedAt.toISOString()
  return {
    ok: true,
    reading: {
      id: JSON.stringify([source.id, measurement.metric, subject, location, sensorId, recordedAtIso]),
      metric: measurement.metric,
      value,
      unit: metric.unit,
      recordedAt: recordedAtIso,
      receivedAt: now.toISOString(),
      subject,
      location,
      sensorId,
      source: { id: source.id, kind: source.kind },
      quality: source.quality,
    },
  }
}
