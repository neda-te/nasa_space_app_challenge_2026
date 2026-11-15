/**
 * The ingestion gateway: single entry point through which external data enters HEALium.
 *
 *   source adapter --fetch--> raw measurements --normalise + validate--> readings --> sink
 *
 * The gateway owns no source-specific logic. Sources are plugged in as adapters
 * (`DataSourceAdapter`), storage as a sink (`ReadingSink`).
 */

import { SourceNotConnectedError, UnknownSourceError } from './errors'
import type {
  DataSourceAdapter,
  FetchRequest,
  IngestionReport,
  SourceDescriptor,
} from './types'
import { normaliseMeasurement } from './validation'
import type { ReadingSink } from '../sinks/reading-sink'

export interface GatewayOptions {
  sources: DataSourceAdapter[]
  sink: ReadingSink
  /** Clock; defaults to the system time. Injected in tests. */
  now?: () => Date
}

export class IngestionGateway {
  private readonly sources = new Map<string, DataSourceAdapter>()
  private readonly sink: ReadingSink
  private readonly now: () => Date

  constructor(options: GatewayOptions) {
    for (const source of options.sources) {
      if (this.sources.has(source.descriptor.id)) {
        throw new Error(`Duplicate data source id "${source.descriptor.id}".`)
      }
      this.sources.set(source.descriptor.id, source)
    }
    this.sink = options.sink
    this.now = options.now ?? (() => new Date())
  }

  /** Describes every registered source, connected or not. */
  listSources(): SourceDescriptor[] {
    return [...this.sources.values()].map((source) => source.descriptor)
  }

  /**
   * Pulls data from one source, validates it and writes the accepted readings to the sink.
   *
   * @throws UnknownSourceError      when `sourceId` is not registered.
   * @throws SourceNotConnectedError when the source is not connected.
   */
  async ingest(sourceId: string, request?: FetchRequest): Promise<IngestionReport> {
    const source = this.sources.get(sourceId)
    if (!source) throw new UnknownSourceError(sourceId)
    if (source.descriptor.status !== 'connected') throw new SourceNotConnectedError(sourceId)

    const measurements = await source.fetch(request)
    const now = this.now()
    const report: IngestionReport = { sourceId, fetched: measurements.length, accepted: [], rejected: [] }
    for (const measurement of measurements) {
      const result = normaliseMeasurement(measurement, source.descriptor, now)
      if (result.ok) report.accepted.push(result.reading)
      else report.rejected.push({ measurement, issues: result.issues })
    }
    await this.sink.write(report.accepted)
    return report
  }

  /** Runs `ingest` for every connected source. Sources that are not connected are skipped. */
  async ingestAllConnected(request?: FetchRequest): Promise<IngestionReport[]> {
    const reports: IngestionReport[] = []
    for (const descriptor of this.listSources()) {
      if (descriptor.status === 'connected') reports.push(await this.ingest(descriptor.id, request))
    }
    return reports
  }
}
