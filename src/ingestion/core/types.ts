/**
 * Core types of the data-ingestion gateway.
 *
 * Data flows through the gateway in three shapes:
 *
 *   RawMeasurement  -> what a source delivers (its own metric names and units)
 *   Reading         -> the normalised, validated form used inside HEALium
 *   IngestionReport -> what happened during one ingestion run
 */

import type { MetricId } from './metrics'

/** Technical category of a data source. */
export type SourceKind =
  | 'simulated'
  | 'wearable'
  | 'lab-analyzer'
  | 'dosimeter'
  | 'habitat-sensor'
  | 'self-report'
  | 'ground-uplink'
  | 'file-import'

/** Whether a source can currently deliver data. */
export type ConnectionStatus = 'connected' | 'not-connected'

/** How trustworthy / of what origin a value is. Shown to the crew next to every value. */
export type ReadingQuality = 'measured' | 'self-reported' | 'simulated'

/** Static description of a data source (what it is, what it delivers, whether it is connected). */
export interface SourceDescriptor {
  /** Stable identifier, e.g. `wearable-biosensor`. */
  id: string
  /** Human-readable name. */
  name: string
  kind: SourceKind
  /** What the source is and which real-world system it stands for. */
  description: string
  /** How the data would physically arrive (protocol / interface). */
  transport: string
  /** Metrics this source can deliver. */
  provides: MetricId[]
  status: ConnectionStatus
  /** Quality label assigned to every reading of this source. */
  quality: ReadingQuality
}

/** One value exactly as a source reports it, before any conversion or checking. */
export interface RawMeasurement {
  /** Metric name. Must be a `MetricId`; anything else is rejected by validation. */
  metric: string
  value: number
  /** Unit as reported by the source, e.g. `bpm`, `°F`, `psi`, `mmol/L`. */
  unit: string
  /** Time of measurement (ISO 8601). */
  recordedAt: string
  /** Crew member the value belongs to (astronaut code), or omitted for habitat values. */
  subject?: string
  /** Where in the habitat the value was measured, if relevant. */
  location?: string
  sensorId?: string
}

/** A normalised, validated value in canonical units. */
export interface Reading {
  /** Deterministic ID (source + metric + subject + location + sensor + time); used to drop duplicates. */
  id: string
  metric: MetricId
  /** Value in the canonical unit of the metric (see `metrics.ts`). */
  value: number
  unit: string
  recordedAt: string
  /** Time the gateway accepted the value (ISO 8601). */
  receivedAt: string
  subject: string | null
  location: string | null
  sensorId: string | null
  source: { id: string; kind: SourceKind }
  quality: ReadingQuality
}

/** Optional filter for a fetch. Sources may ignore fields they do not support. */
export interface FetchRequest {
  /** Only values recorded at or after this time (ISO 8601). */
  since?: string
  /** Only values of this crew member. */
  subject?: string
}

/**
 * Contract every data source implements. This is the connection point ("Anschlussstelle")
 * for new sources: implement `fetch`, add the adapter to `sources/registry.ts`, done.
 */
export interface DataSourceAdapter {
  readonly descriptor: SourceDescriptor
  /**
   * Returns the measurements currently available from the source.
   *
   * @throws SourceNotConnectedError when the source is not connected.
   */
  fetch(request?: FetchRequest): Promise<RawMeasurement[]>
}

/** A problem found while validating one measurement. */
export interface ValidationIssue {
  code:
    | 'unknown-metric'
    | 'invalid-value'
    | 'unsupported-unit'
    | 'out-of-range'
    | 'invalid-timestamp'
    | 'timestamp-in-future'
  message: string
}

/** Outcome of one ingestion run for one source. */
export interface IngestionReport {
  sourceId: string
  /** Number of measurements delivered by the source. */
  fetched: number
  /** Readings that passed validation and were written to the sink. */
  accepted: Reading[]
  /** Measurements that were dropped, with the reasons. */
  rejected: { measurement: RawMeasurement; issues: ValidationIssue[] }[]
}
