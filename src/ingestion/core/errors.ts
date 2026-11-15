/**
 * Errors of the ingestion gateway.
 */

/** Thrown by an adapter whose data source is not connected yet. */
export class SourceNotConnectedError extends Error {
  constructor(public readonly sourceId: string) {
    super(`Data source "${sourceId}" is not connected.`)
    this.name = 'SourceNotConnectedError'
  }
}

/** Thrown when the gateway is asked for a source that is not registered. */
export class UnknownSourceError extends Error {
  constructor(public readonly sourceId: string) {
    super(`No data source registered with id "${sourceId}".`)
    this.name = 'UnknownSourceError'
  }
}
