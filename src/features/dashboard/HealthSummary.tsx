/**
 * Today's health summary banner at the top of the home dashboard.
 */

import { Icon } from '../../shared/components/Icon'
import type { Page } from '../../shared/types'

/** Summary banner; the wording depends on the fatigue score of the daily check-in. */
export function HealthSummary({
  dailyScore,
  go,
}: {
  dailyScore: number | null
  go: (page: Page) => void
}) {
  const fatigue = dailyScore ?? 5.8
  const highFatigue = fatigue >= 7
  const status = highFatigue ? 'Attention needed' : 'Monitor today'

  return (
    <section className="health-summary" aria-labelledby="health-summary-title">
      <div className="summary-status-block">
        <span className="summary-status-icon">
          <Icon name={highFatigue ? 'heart' : 'trend'} size={22} />
        </span>
        <div>
          <span className="eyebrow">TODAY&apos;S HEALTH SUMMARY</span>
          <h3 id="health-summary-title">{status}</h3>
          <p>
            {highFatigue
              ? 'Fatigue is high, with sleep and reaction time outside your personal range.'
              : 'Most indicators are stable. Sleep and reaction time need added attention.'}
          </p>
        </div>
      </div>
      <div className="summary-column">
        <span>RECENT TRENDS</span>
        <strong>Sleep lower · response slower</strong>
        <p>
          Sleep is 1h 18m below usual and reaction time is 18% slower. Radiation dose is 8% above
          the weekly planning baseline.
        </p>
      </div>
      <div className="summary-column recommendation">
        <span>RECOMMENDATION</span>
        <strong>{highFatigue ? 'Reduce high-demand work' : 'Add recovery and verification'}</strong>
        <p>
          {highFatigue
            ? 'Delay nonessential critical work, repeat readiness checks, and notify flight medical.'
            : 'Take a recovery break and use two-person verification for precision or critical work.'}
        </p>
        <button onClick={() => go('Trends')}>
          Review personal trends <Icon name="arrow" size={14} />
        </button>
      </div>
      <small className="summary-updated">
        Latest sources: telemetry 38 sec ago · cognitive test 07:40 · check-in{' '}
        {dailyScore === null ? '08:05' : 'updated this session'}
      </small>
    </section>
  )
}
