/**
 * Home-dashboard widget.
 *
 * One component renders every widget type (`WidgetId`); the selected type decides
 * the markup. The metric values shown inside the widgets are SIMULATED demo values
 * (see docs/simulated-data.md).
 */

import { useState } from 'react'
import {
  heartRateSparkline,
  reactionTimeSparkline,
  sleepQualityWeekBars,
} from '../../data/simulated/widget-series'
import { Icon } from '../../shared/components/Icon'
import { SourceTag } from '../../shared/components/SourceTag'
import { Sparkline } from '../../shared/components/Sparkline'
import { StatusBadge } from '../../shared/components/StatusBadge'
import type { ChartStyle, Page, Status, WidgetId } from '../../shared/types'

/**
 * Renders the widget identified by `id`.
 *
 * @param go            Navigates to another page.
 * @param chart         Chart style chosen in the dashboard settings.
 * @param fatigueScore  Fatigue score from today's check-in, or `null` if none was submitted.
 * @param openPhysical  Opens the Physical Health page with the given category expanded.
 */
export function HomeWidget({
  id,
  go,
  chart,
  fatigueScore,
  openPhysical,
}: {
  id: WidgetId
  go: (page: Page) => void
  chart: ChartStyle
  fatigueScore: number | null
  openPhysical: (category: string) => void
}) {
  const [reactionInfoOpen, setReactionInfoOpen] = useState(false)
  if (id === 'heart')
    return (
      <article
        className="primary-widget heart-widget secondary-metric clickable-widget"
        role="button"
        tabIndex={0}
        onClick={() => openPhysical('Cardiovascular Health')}
        onKeyDown={(event) => event.key === 'Enter' && openPhysical('Cardiovascular Health')}
      >
        <div className="widget-top">
          <div className="widget-icon">
            <Icon name="heart" />
          </div>
          <SourceTag>Secondary live metric</SourceTag>
        </div>
        <p>HEART RATE</p>
        <div className="big-metric">
          62 <small>bpm</small>
        </div>
        <div className="compare-row">
          <span>
            Yesterday <b>60 bpm</b>
          </span>
          <span>
            Baseline <b>+2 bpm</b>
          </span>
        </div>
        <Sparkline values={heartRateSparkline} mode={chart} />
        <button className="card-link" onClick={() => openPhysical('Cardiovascular Health')}>
          View cardiovascular details <Icon name="arrow" size={14} />
        </button>
      </article>
    )
  if (id === 'sleep')
    return (
      <article
        className="primary-widget sleep-widget featured-metric clickable-widget"
        role="button"
        tabIndex={0}
        onClick={() => openPhysical('Sleep and Activity')}
        onKeyDown={(event) => event.key === 'Enter' && openPhysical('Sleep and Activity')}
      >
        <div className="widget-top">
          <div className="widget-icon">
            <span className="moon">◐</span>
          </div>
          <SourceTag>Wearable</SourceTag>
        </div>
        <p>SLEEP CYCLE</p>
        <div className="big-metric">5h 42m</div>
        <div className="sleep-facts">
          <span>
            Quality <b>68%</b>
          </span>
          <span>
            Cycle <b>22:48–04:30</b>
          </span>
        </div>
        <div className="week-bars">
          {sleepQualityWeekBars.map((h, i) => (
            <span key={i}>
              <i style={{ height: `${h}%` }} className={i === 5 ? 'low' : ''} />
              <small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</small>
            </span>
          ))}
        </div>
      </article>
    )
  if (id === 'fatigue') {
    const score = fatigueScore ?? 5.8
    const level = score <= 3 ? 'Low' : score <= 6 ? 'Moderate' : 'High'
    const status: Status = score <= 3 ? 'Normal' : score <= 6 ? 'Monitor' : 'Attention'
    return (
      <article
        className="primary-widget reaction-widget clickable-widget"
        role="button"
        tabIndex={0}
        onClick={() => openPhysical('Psychological & Behavioral Health')}
        onKeyDown={(event) =>
          event.key === 'Enter' && openPhysical('Psychological & Behavioral Health')
        }
      >
        <div className="widget-top">
          <div className="widget-icon orange">
            <Icon name="trend" />
          </div>
          <SourceTag kind="self">Self-reported</SourceTag>
        </div>
        <p>FATIGUE CHECK-IN</p>
        <div className="big-metric">
          {score} <small>/ 10</small>
        </div>
        <div className="metric-caption">
          <StatusBadge status={status} />
          {level} subjective fatigue
        </div>
        <div className="gauge">
          <i style={{ width: `${score * 10}%` }} />
        </div>
        <span className="last-update">
          {fatigueScore === null
            ? 'Simulated previous check-in · 08:05'
            : 'New check-in saved this session'}
        </span>
      </article>
    )
  }
  if (id === 'cognitive')
    return (
      <article
        className="primary-widget clickable-widget"
        role="button"
        tabIndex={0}
        onClick={() => openPhysical('Cognitive Performance')}
        onKeyDown={(event) => event.key === 'Enter' && openPhysical('Cognitive Performance')}
      >
        <div className="widget-top">
          <div className="widget-icon blue">
            <Icon name="trend" />
          </div>
          <SourceTag kind="lab">Periodic test</SourceTag>
        </div>
        <div className="reaction-title-row">
          <p>REACTION TIME TREND</p>
          <button
            className={`reaction-info ${reactionInfoOpen ? 'open' : ''}`}
            aria-label="What is reaction time?"
            aria-expanded={reactionInfoOpen}
            onClick={(event) => {
              event.stopPropagation()
              setReactionInfoOpen(!reactionInfoOpen)
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            i
            <span className="reaction-tooltip" onClick={(event) => event.stopPropagation()}>
              <strong>What is Reaction Time?</strong>
              <p>
                Reaction time measures how quickly you respond to a visual stimulus during a
                cognitive performance test.
              </p>
              <ul>
                <li>Measured in milliseconds (ms).</li>
                <li>Lower values generally indicate faster responses.</li>
                <li>Higher values indicate slower responses.</li>
                <li>
                  Changes may accompany fatigue, sleep loss, or reduced alertness, but do not
                  establish a diagnosis.
                </li>
              </ul>
              <div className="reaction-detail-grid">
                <span>
                  Current <b>284 ms</b>
                </span>
                <span>
                  Previous <b>271 ms</b>
                </span>
                <span>
                  Baseline <b>241 ms</b>
                </span>
                <span>
                  Change <b>18% slower</b>
                </span>
              </div>
              <svg viewBox="0 0 250 48" preserveAspectRatio="none">
                <path d="M0 39H250" />
                <polyline points="2,34 42,30 84,29 126,24 168,19 208,11 248,8" />
              </svg>
              <small>Last test: Sol 184 · 07:40 · Simulated periodic test</small>
            </span>
          </button>
        </div>
        <div className="big-metric">
          284 <small>ms</small>
        </div>
        <div className="compare-row">
          <span>
            Attention <b>92 / 100</b>
          </span>
          <span>
            Previous <b>271 ms</b>
          </span>
        </div>
        <Sparkline values={reactionTimeSparkline} tone="orange" mode={chart} />
        <span className="baseline-change">+18% reaction time vs. personal baseline</span>
      </article>
    )
  if (id === 'status')
    return (
      <article className="wide-widget health-status">
        <div className="status-orb">
          <span>GOOD</span>
        </div>
        <div>
          <span className="eyebrow">GENERAL HEALTH STATUS</span>
          <h3>Stable with two changes to monitor</h3>
          <p>
            Most tracked indicators are within your personal range. Sleep and reaction time have
            shifted from the 14-day baseline.
          </p>
        </div>
        <button onClick={() => go('Trends')}>
          Review trends <Icon name="arrow" size={14} />
        </button>
      </article>
    )
  if (id === 'abnormalities')
    return (
      <article className="wide-widget recent-changes">
        <div className="widget-section-title">
          <div>
            <span className="eyebrow">EXPLAINABLE NOTIFICATIONS</span>
            <h3>Recent changes</h3>
          </div>
          <span>2 items</span>
        </div>
        <div className="change-list">
          <div>
            <i className="orange-dot" />
            <p>
              <b>Sleep duration decreased</b>
              <span>1h 18m below your usual range · wearable data</span>
            </p>
          </div>
          <div>
            <i className="yellow-dot" />
            <p>
              <b>Reaction time increased</b>
              <span>18% above personal baseline · periodic test</span>
            </p>
          </div>
        </div>
        <p className="cause-note">
          These measurements occurred together; this does not establish medical causation.
        </p>
      </article>
    )
  if (id === 'activity')
    return (
      <article className="wide-widget optional-widget">
        <div>
          <span className="eyebrow">OPTIONAL WIDGET</span>
          <h3>Daily activity</h3>
          <p>8,240 steps · 46 active minutes · exercise target 94%</p>
        </div>
        <div className="ring">
          94<small>%</small>
        </div>
      </article>
    )
  return (
    <article className="wide-widget optional-widget">
      <div>
        <span className="eyebrow">OPTIONAL WIDGET</span>
        <h3>Cabin environment</h3>
        <p>22.4°C · 42% RH · CO₂ 2.1 mmHg</p>
      </div>
      <button onClick={() => go('Environment')}>
        Open environment <Icon name="arrow" size={14} />
      </button>
    </article>
  )
}
