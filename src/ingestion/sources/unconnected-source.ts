/**
 * Helper for sources that are defined but not connected yet.
 *
 * Such a source is fully described (what it is, how it would deliver data, which metrics
 * it provides) and registered in the gateway, but `fetch` refuses to return data. Nothing
 * is invented for a source that is not connected.
 */

import { SourceNotConnectedError } from '../core/errors'
import type { DataSourceAdapter, SourceDescriptor } from '../core/types'

export function defineUnconnectedSource(
  descriptor: Omit<SourceDescriptor, 'status'>,
): DataSourceAdapter {
  return {
    descriptor: { ...descriptor, status: 'not-connected' },
    async fetch() {
      throw new SourceNotConnectedError(descriptor.id)
    },
  }
}
