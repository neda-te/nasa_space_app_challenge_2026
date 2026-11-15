/**
 * Small label that tells the crew where a value comes from
 * (continuous sensor, lab sample, self-report or research data).
 */

import type { ReactNode } from 'react'

/** Data-origin label; `kind` controls the colour. */
export function SourceTag({
  children,
  kind = 'sensor',
}: {
  children: ReactNode
  kind?: 'sensor' | 'lab' | 'self' | 'research'
}) {
  return <span className={`source-tag source-${kind}`}>{children}</span>
}
