/**
 * Public API of the data-ingestion gateway.
 *
 * STATUS: the gateway is implemented and tested, but NOT wired into the dashboard yet.
 * The UI still reads the demo datasets in `src/data/simulated` directly. See
 * `README.md` in this folder and `docs/data-ingestion.md` for the integration plan.
 *
 * @example
 * const sink = new InMemoryReadingSink()
 * const gateway = createGateway({ sink })
 * await gateway.ingestAllConnected()          // currently: the simulated source only
 * sink.latest('heart-rate', 'MC-01')          // -> Reading (quality: 'simulated')
 */

import { IngestionGateway } from './core/gateway'
import type { ReadingSink } from './sinks/reading-sink'
import { createDefaultSources } from './sources/registry'

/** Creates a gateway with all known sources registered. */
export function createGateway(options: { sink: ReadingSink; now?: () => Date }): IngestionGateway {
  return new IngestionGateway({
    sources: createDefaultSources(options.now),
    sink: options.sink,
    now: options.now,
  })
}

export { IngestionGateway } from './core/gateway'
export { SourceNotConnectedError, UnknownSourceError } from './core/errors'
export { metricCatalogue, getMetric, isMetricId } from './core/metrics'
export type { MetricDefinition, MetricId } from './core/metrics'
export type {
  ConnectionStatus,
  DataSourceAdapter,
  FetchRequest,
  IngestionReport,
  RawMeasurement,
  Reading,
  ReadingQuality,
  SourceDescriptor,
  SourceKind,
  ValidationIssue,
} from './core/types'
export { InMemoryReadingSink } from './sinks/reading-sink'
export type { ReadingSink } from './sinks/reading-sink'
export { createFileImportSource, parseImportFile, ImportFileError } from './sources/file-import-source'
export type { ImportFile } from './sources/file-import-source'
export { createDefaultSources } from './sources/registry'
