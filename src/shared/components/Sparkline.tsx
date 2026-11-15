/**
 * Tiny inline trend chart used inside widgets and tables.
 */

import type { ChartStyle } from '../types'

/** Draws `values` (expected range roughly 0-30) as a line, area or bar chart. */
export function Sparkline({
  values,
  tone = 'teal',
  mode = 'Line',
}: {
  values: number[]
  tone?: 'teal' | 'orange' | 'blue'
  mode?: ChartStyle
}) {
  const points = values
    .map((value, index) => `${index * (94 / Math.max(values.length - 1, 1)) + 3},${30 - value}`)
    .join(' ')
  if (mode === 'Bars') {
    return (
      <div className={`spark-bars spark-${tone}`}>
        {values.map((value, index) => (
          <i style={{ height: `${Math.max(value * 2.7, 18)}%` }} key={index} />
        ))}
      </div>
    )
  }
  return (
    <svg
      className={`sparkline spark-${tone} ${mode === 'Area' ? 'area-spark' : ''}`}
      viewBox="0 0 100 34"
      preserveAspectRatio="none"
    >
      <path d="M3 29H97" />
      {mode === 'Area' && <polygon points={`${points} 97,30 3,30`} />}
      <polyline points={points} />
    </svg>
  )
}
