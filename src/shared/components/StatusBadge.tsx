/**
 * Coloured status pill (Normal / Monitor / Attention).
 */

import type { Status } from '../types'

/** Status pill; the CSS class `status-<status>` controls the colour. */
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  )
}
