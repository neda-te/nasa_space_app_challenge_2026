/**
 * Destination of validated readings.
 *
 * The gateway does not know where readings end up; it only calls `write`. That makes the
 * storage exchangeable:
 *
 * - `InMemoryReadingSink` (below): used by the tests and the local preview.
 * - A database sink for the backend (e.g. a Payload `health-readings` collection) is the
 *   planned production target and NOT implemented yet (see ../README.md).
 */

import type { MetricId } from '../core/metrics'
import type { Reading } from '../core/types'

export interface ReadingSink {
  /** Stores the readings. Writing the same reading (same `id`) twice must not create a duplicate. */
  write(readings: Reading[]): Promise<void>
}

/** Keeps readings in memory. Data is lost on reload; no private data is persisted. */
export class InMemoryReadingSink implements ReadingSink {
  private readonly readings = new Map<string, Reading>()

  async write(readings: Reading[]): Promise<void> {
    for (const reading of readings) this.readings.set(reading.id, reading)
  }

  /** All stored readings, oldest first. */
  all(): Reading[] {
    return [...this.readings.values()].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
  }

  /** The most recent reading of a metric, optionally for one crew member. */
  latest(metric: MetricId, subject?: string): Reading | undefined {
    return this.all()
      .filter((reading) => reading.metric === metric && (!subject || reading.subject === subject))
      .at(-1)
  }
}
