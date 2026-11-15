/**
 * Trends & Analysis page: per-metric trend cards for a selectable time range and a correlation view.
 */

import { useState } from 'react'
import { Icon } from '../../shared/components/Icon'
import { PageTitle } from '../../shared/components/PageTitle'
import { SourceTag } from '../../shared/components/SourceTag'
import { DetailedTrendWidget } from './DetailedTrendWidget'
import type { TrendMetric, TrendRange } from './types'

/** Trends & Analysis page. */
export function TrendsPage() {
  const [range, setRange] = useState<TrendRange>('7 Days')
  const [expandedTrend, setExpandedTrend] = useState<TrendMetric>('sleep')
  return (
    <>
      <PageTitle
        kicker="PERSONAL BASELINES · EXPLAINABLE ANALYSIS"
        title="Trends & Analysis"
        description="Compare current measurements with recent history and your rolling personal baseline."
        action={
          <div className="range-tabs">
            {(['24 Hours', '7 Days', '30 Days'] as TrendRange[]).map((item) => (
              <button
                className={range === item ? 'active' : ''}
                onClick={() => setRange(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        }
      />
      <div className="trend-summary">
        <div>
          <span>CURRENT VS. YESTERDAY</span>
          <b>
            Heart rate <i>+2 bpm</i>
          </b>
          <p>Within expected personal variation</p>
        </div>
        <div>
          <span>CURRENT VS. BASELINE</span>
          <b>
            Sleep <i className="warm">−1h 18m</i>
          </b>
          <p>Outside usual 14-day range</p>
        </div>
        <div>
          <span>COGNITIVE CHANGE</span>
          <b>
            Reaction <i className="warm">+18%</i>
          </b>
          <p>Two consecutive slower tests</p>
        </div>
      </div>
      <section className="trend-widget-section">
        <div className="trend-section-heading">
          <div>
            <span className="eyebrow">SIMULATED HISTORICAL DATA</span>
            <h3>Health & performance trends</h3>
          </div>
          <p>
            Select a metric to expand its detailed chart. Hover chart points for measured values.
          </p>
        </div>
        <div className="trend-widget-stack">
          {(['sleep', 'heart', 'fatigue', 'reaction', 'activity'] as TrendMetric[]).map(
            (metric) => (
              <DetailedTrendWidget
                metric={metric}
                range={range}
                expanded={expandedTrend === metric}
                onToggle={() => setExpandedTrend(expandedTrend === metric ? 'sleep' : metric)}
                key={metric}
              />
            ),
          )}
        </div>
      </section>
      <div className="analysis-grid">
        <article className="chart-panel large">
          <div className="chart-title">
            <div>
              <span className="eyebrow">HEALTH TREND</span>
              <h3>Sleep duration & reaction time</h3>
            </div>
            <div className="chart-legend">
              <span>
                <i className="teal" />
                Sleep
              </span>
              <span>
                <i className="orange" />
                Reaction time
              </span>
            </div>
          </div>
          <div className="line-chart">
            <span className="axis-label top">8h / 240ms</span>
            <span className="axis-label bottom">5h / 300ms</span>
            <svg viewBox="0 0 700 210" preserveAspectRatio="none">
              <g className="grid-lines">
                <path d="M0 25H700M0 75H700M0 125H700M0 175H700" />
              </g>
              <path
                className="area"
                d="M0 80L115 55L230 71L345 42L460 65L575 145L700 120L700 210H0Z"
              />
              <polyline
                className="sleep-line"
                points="0,80 115,55 230,71 345,42 460,65 575,145 700,120"
              />
              <polyline
                className="reaction-line"
                points="0,125 115,120 230,112 345,105 460,90 575,60 700,47"
              />
            </svg>
            <div className="x-axis">
              {['Sol 178', '179', '180', '181', '182', '183', 'Today'].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
          <div className="explain-box">
            <Icon name="trend" size={16} />
            <p>
              Lower sleep duration and slower reaction time appear in the same period.{' '}
              <b>This correlation does not establish a medical cause.</b>
            </p>
          </div>
        </article>
        <article className="chart-panel">
          <div className="chart-title">
            <div>
              <span className="eyebrow">ENVIRONMENTAL CONTEXT</span>
              <h3>CO₂ & sleep quality</h3>
            </div>
            <SourceTag kind="research">Correlation view</SourceTag>
          </div>
          <div className="correlation-score">
            <strong>r = 0.34</strong>
            <span>Weak association</span>
          </div>
          <div className="scatter">
            {[
              [12, 70],
              [25, 52],
              [38, 63],
              [48, 44],
              [60, 58],
              [70, 32],
              [82, 42],
              [90, 25],
            ].map(([x, y], i) => (
              <i key={i} style={{ left: `${x}%`, top: `${y}%` }} />
            ))}
          </div>
          <p className="chart-footnote">
            Area CO₂ sensor + wearable sleep quality · simulated data
          </p>
        </article>
      </div>
    </>
  )
}
