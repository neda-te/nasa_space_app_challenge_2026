/**
 * Expandable trend card: summary row plus a detailed chart against the personal baseline.
 */

import { trendMetricData } from '../../data/simulated/trends'
import { Icon } from '../../shared/components/Icon'
import { SourceTag } from '../../shared/components/SourceTag'
import type { TrendMetric, TrendRange } from './types'

/** Trend card for one metric and time range. */
export function DetailedTrendWidget({
  metric,
  range,
  expanded,
  onToggle,
}: {
  metric: TrendMetric
  range: TrendRange
  expanded: boolean
  onToggle: () => void
}) {
  const data = trendMetricData[metric]
  const values = data.series[range]
  const low = Math.min(...values, data.baseline)
  const high = Math.max(...values, data.baseline)
  const spread = Math.max(high - low, 1)
  const points = values
    .map((value, index) => {
      const x = 38 + index * (542 / Math.max(values.length - 1, 1))
      const y = 168 - ((value - low) / spread) * 118
      return `${x},${y}`
    })
    .join(' ')
  const baselineY = 168 - ((data.baseline - low) / spread) * 118
  const labels =
    range === '24 Hours'
      ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00', 'Now']
      : range === '7 Days'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today']
        : ['Day 1', '5', '10', '15', '20', '25', '29', 'Today']
  return (
    <article className={`metric-trend-widget ${expanded ? 'expanded' : ''}`}>
      <button className="trend-widget-summary" onClick={onToggle} aria-expanded={expanded}>
        <div className={`trend-widget-icon ${data.tone}`}>
          <Icon name={metric === 'heart' ? 'heart' : 'trend'} size={16} />
        </div>
        <div>
          <span>{data.title}</span>
          <strong>{data.value}</strong>
        </div>
        <p>{data.baselineLabel}</p>
        <SourceTag kind={metric === 'fatigue' ? 'self' : metric === 'reaction' ? 'lab' : 'sensor'}>
          Simulated
        </SourceTag>
        <span className="trend-expand">
          <Icon name="chevron" size={16} />
        </span>
      </button>
      {expanded && (
        <div className="trend-widget-detail">
          <div className="trend-chart-meta">
            <div>
              <span className="eyebrow">{range.toUpperCase()} TREND</span>
              <h3>{data.title}</h3>
            </div>
            <div className="chart-legend">
              <span>
                <i className={data.tone} />
                Measured
              </span>
              <span>
                <i className="baseline" />
                Personal baseline
              </span>
            </div>
          </div>
          <div className="metric-chart-wrap">
            <span className="metric-y-label top">
              {high.toLocaleString()} {data.unit}
            </span>
            <span className="metric-y-label bottom">
              {low.toLocaleString()} {data.unit}
            </span>
            <svg
              viewBox="0 0 620 190"
              preserveAspectRatio="none"
              aria-label={`${data.title} ${range} simulated trend`}
            >
              <path className="metric-grid" d="M38 50H580M38 89H580M38 128H580M38 168H580" />
              <line className="metric-baseline" x1="38" x2="580" y1={baselineY} y2={baselineY} />
              <polyline className={`metric-series ${data.tone}`} points={points} />
              {values.map((value, index) => {
                const x = 38 + index * (542 / Math.max(values.length - 1, 1))
                const y = 168 - ((value - low) / spread) * 118
                return (
                  <circle className={`metric-point ${data.tone}`} cx={x} cy={y} r="4" key={index}>
                    <title>{`${labels[Math.min(index, labels.length - 1)]}: ${value.toLocaleString()} ${data.unit}`}</title>
                  </circle>
                )
              })}
            </svg>
            <div className="metric-x-axis">
              {labels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
          <div className="trend-context-row">
            <span>{data.source}</span>
            {metric === 'sleep' && <span>Sleep window today · 22:48–04:30</span>}
            {metric === 'reaction' && (
              <span className="slower-label">Current result is 18% slower than baseline</span>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
