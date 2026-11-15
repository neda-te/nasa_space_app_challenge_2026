/**
 * Physical Health page: expandable cards per health category plus the radiation exposure chart.
 */

import { useState } from 'react'
import { healthCategories } from '../../data/simulated/health-categories'
import { Icon } from '../../shared/components/Icon'
import { PageTitle } from '../../shared/components/PageTitle'
import { SourceTag } from '../../shared/components/SourceTag'
import { StatusBadge } from '../../shared/components/StatusBadge'
import type { Page } from '../../shared/types'
import { PhysicalTabs } from './PhysicalTabs'
import { RadiationExposureChart } from './RadiationExposureChart'

/**
 * Physical Health page.
 *
 * @param initialOpen Category that is expanded when the page opens.
 */
export function PhysicalPage({ go, initialOpen }: { go: (page: Page) => void; initialOpen: string }) {
  const [open, setOpen] = useState(initialOpen)
  return (
    <>
      <PageTitle
        kicker="PHYSICAL HEALTH · MC-01"
        title="Physical Health Monitoring"
        description="Integrated physiological, performance, examination, and self-reported records."
        action={
          <div className="legend-row">
            <SourceTag>Continuous</SourceTag>
            <SourceTag kind="lab">Periodic</SourceTag>
            <SourceTag kind="self">Self-reported</SourceTag>
          </div>
        }
      />
      <PhysicalTabs active="Physical" go={go} />
      <RadiationExposureChart />
      <div className="privacy-note">
        <Icon name="lock" size={15} />
        <p>
          Private behavioral and journal information is restricted by role and permission. You are
          viewing the crew-member profile.
        </p>
      </div>
      <div className="category-grid">
        {healthCategories.map((item) => {
          const expanded = open === item.title
          return (
            <article className={`category-card ${expanded ? 'expanded' : ''}`} key={item.title}>
              <button
                className="category-summary"
                onClick={() => setOpen(expanded ? '' : item.title)}
              >
                <div>
                  <StatusBadge status={item.status} />
                  <h3>{item.title}</h3>
                  <strong>{item.value}</strong>
                  <p>{item.detail}</p>
                </div>
                <span className="expand-control">
                  <Icon name="chevron" size={17} />
                </span>
              </button>
              {expanded && (
                <div className="category-details">
                  <div className="detail-meta">
                    <SourceTag
                      kind={
                        item.type.includes('Self')
                          ? 'self'
                          : item.type.includes('laboratory') ||
                              item.type.includes('examination') ||
                              item.type.includes('assessment')
                            ? 'lab'
                            : item.type.includes('Research')
                              ? 'research'
                              : 'sensor'
                      }
                    >
                      {item.type}
                    </SourceTag>
                    <span>{item.time}</span>
                  </div>
                  <div className="detail-fields">
                    {item.fields.map(([label, value]) => (
                      <div key={label}>
                        <span>{label}</span>
                        <b>{value}</b>
                      </div>
                    ))}
                  </div>
                  <p className="clinical-note">
                    Informational monitoring only. Review interpretation with crew medical
                    personnel.
                  </p>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}
