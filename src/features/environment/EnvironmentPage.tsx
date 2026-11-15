/**
 * Environmental Monitoring page: expandable cards for each cabin / habitat reading.
 */

import { useState } from 'react'
import { environmental } from '../../data/simulated/environment'
import { environmentDetailSparkline } from '../../data/simulated/widget-series'
import { Icon } from '../../shared/components/Icon'
import { PageTitle } from '../../shared/components/PageTitle'
import { SourceTag } from '../../shared/components/SourceTag'
import { Sparkline } from '../../shared/components/Sparkline'
import { StatusBadge } from '../../shared/components/StatusBadge'

/** Environmental Monitoring page. */
export function EnvironmentPage() {
  const [open, setOpen] = useState('Radiation')
  return (
    <>
      <PageTitle
        kicker="HABITAT · ENVIRONMENTAL HEALTH"
        title="Environmental Monitoring"
        description="Cabin conditions, exposure context, periodic samples, and research measurements."
        action={
          <div className="live-chip">
            <i />8 systems nominal
          </div>
        }
      />
      <div className="research-caution">
        <Icon name="data" size={16} />
        <p>
          <b>Exposure context:</b> Area sensors and historical research measurements are not
          automatically assigned as a specific crew member's personal exposure.
        </p>
      </div>
      <div className="environment-grid">
        {environmental.map((item, index) => {
          const expanded = open === item.name
          return (
            <article className={`environment-card ${expanded ? 'expanded' : ''}`} key={item.name}>
              <button onClick={() => setOpen(expanded ? '' : item.name)}>
                <div className="environment-card-top">
                  <span className="env-number">0{index + 1}</span>
                  <StatusBadge status={item.status} />
                </div>
                <h3>{item.name}</h3>
                <strong>{item.value}</strong>
                <div className="env-type">
                  <SourceTag
                    kind={
                      item.type.includes('research')
                        ? 'research'
                        : item.type.includes('laboratory') || item.type.includes('sample')
                          ? 'lab'
                          : 'sensor'
                    }
                  >
                    {item.type}
                  </SourceTag>
                  <Icon name="chevron" size={15} />
                </div>
              </button>
              {expanded && (
                <div className="environment-detail">
                  <Sparkline
                    values={environmentDetailSparkline}
                    tone={item.status === 'Monitor' ? 'orange' : 'blue'}
                  />
                  {item.details.map(([label, value]) => (
                    <p key={label}>
                      <span>{label}</span>
                      <b>{value}</b>
                    </p>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}
