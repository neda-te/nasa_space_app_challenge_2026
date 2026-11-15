/**
 * Interactive chart of daily and cumulative radiation dose (7 or 30 days).
 */

import { useState } from 'react'
import { simulatedRadiationExposure } from '../../data/simulated/radiation'

/** Bar (daily) and line (cumulative) chart with a selectable day. */
export function RadiationExposureChart() {
  const [range, setRange] = useState<7 | 30>(30)
  const [selectedIndex, setSelectedIndex] = useState(simulatedRadiationExposure.length - 1)
  const cumulative = simulatedRadiationExposure.reduce<number[]>((values, value, index) => {
    values.push(value + (values[index - 1] ?? 0))
    return values
  }, [])
  const start = simulatedRadiationExposure.length - range
  const daily = simulatedRadiationExposure.slice(start)
  const cumulativeVisible = cumulative.slice(start)
  const dates = daily.map((_, index) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - (daily.length - 1 - index))
    return date
  })
  const chartWidth = 760
  const chartHeight = 210
  const left = 46
  const right = 728
  const top = 20
  const bottom = 175
  const dailyMax = Math.max(...daily) * 1.2
  const cumulativeMin = Math.min(...cumulativeVisible)
  const cumulativeMax = Math.max(...cumulativeVisible)
  const x = (index: number) => left + (index / Math.max(1, daily.length - 1)) * (right - left)
  const yDaily = (value: number) => bottom - (value / dailyMax) * (bottom - top)
  const yCumulative = (value: number) =>
    bottom -
    ((value - cumulativeMin) / Math.max(0.01, cumulativeMax - cumulativeMin)) * (bottom - top)
  const cumulativePoints = cumulativeVisible
    .map((value, index) => `${x(index)},${yCumulative(value)}`)
    .join(' ')
  const localSelected = Math.max(0, selectedIndex - start)
  const selectedDate = dates[localSelected] ?? dates[dates.length - 1]
  const selectedDaily = daily[localSelected] ?? daily[daily.length - 1]
  const selectedCumulative =
    cumulativeVisible[localSelected] ?? cumulativeVisible[cumulativeVisible.length - 1]

  return (
    <section className="radiation-chart-card" aria-labelledby="radiation-chart-title">
      <div className="radiation-chart-head">
        <div>
          <span className="eyebrow">SIMULATED DOSIMETER MEASUREMENTS</span>
          <h3 id="radiation-chart-title">Radiation exposure</h3>
          <p>Daily exposure and accumulated mission dose. Values are prototype data in mSv.</p>
        </div>
        <div className="range-tabs" aria-label="Radiation chart range">
          {[7, 30].map((days) => (
            <button
              className={range === days ? 'active' : ''}
              onClick={() => {
                setRange(days as 7 | 30)
                setSelectedIndex(simulatedRadiationExposure.length - 1)
              }}
              key={days}
            >
              {days}-day
            </button>
          ))}
        </div>
      </div>
      <div className="radiation-legend">
        <span>
          <i className="daily" /> Daily exposure (mSv)
        </span>
        <span>
          <i className="cumulative" /> Cumulative dose (mSv)
        </span>
        <span>
          <i className="unusual" /> Unusual relative change
        </span>
      </div>
      <div className="radiation-chart-wrap">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={`${range}-day simulated radiation exposure chart`}
        >
          <path
            className="radiation-grid"
            d={`M${left} 20H${right}M${left} 72H${right}M${left} 124H${right}M${left} 175H${right}`}
          />
          {daily.map((value, index) => {
            const average =
              daily.slice(Math.max(0, index - 4), index).reduce((sum, item) => sum + item, 0) /
              Math.max(1, Math.min(4, index))
            const unusual = index > 0 && value > average * 1.65
            const barWidth = range === 7 ? 42 : 12
            return (
              <g key={`${dates[index].toISOString()}-${value}`}>
                <rect
                  className={unusual ? 'radiation-bar unusual' : 'radiation-bar'}
                  x={x(index) - barWidth / 2}
                  y={yDaily(value)}
                  width={barWidth}
                  height={bottom - yDaily(value)}
                  rx="3"
                />
                <circle
                  className="radiation-hit"
                  cx={x(index)}
                  cy={yDaily(value)}
                  r={range === 7 ? 10 : 7}
                  tabIndex={0}
                  onMouseEnter={() => setSelectedIndex(start + index)}
                  onFocus={() => setSelectedIndex(start + index)}
                  aria-label={`${dates[index].toLocaleDateString()}: ${value.toFixed(2)} mSv daily exposure`}
                />
              </g>
            )
          })}
          <polyline className="radiation-cumulative-line" points={cumulativePoints} />
          <circle
            className="radiation-selected-point"
            cx={x(localSelected)}
            cy={yCumulative(selectedCumulative)}
            r="4"
          />
          <text x="3" y="24">
            mSv/day
          </text>
          <text x="730" y="24">
            mSv
          </text>
          <text x={left} y="201">
            {dates[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
          <text x={right - 40} y="201">
            {dates[dates.length - 1]?.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </text>
        </svg>
        <div className="radiation-tooltip" aria-live="polite">
          <span>
            {selectedDate?.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <strong>{selectedDaily.toFixed(2)} mSv daily</strong>
          <b>{selectedCumulative.toFixed(2)} mSv cumulative</b>
        </div>
      </div>
      <p className="radiation-note">
        Orange markers identify changes that are unusual relative to this simulated recent pattern;
        they are not medical safety thresholds.
      </p>
    </section>
  )
}
