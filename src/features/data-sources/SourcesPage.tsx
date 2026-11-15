/**
 * Data Sources & Transparency page.
 *
 * Explains which NASA / research sources shaped the data categories and which values
 * are simulated. This page is descriptive only; the technical connection points for
 * real data sources are defined in `src/ingestion`.
 */

import { useState } from 'react'
import { Icon } from '../../shared/components/Icon'
import { PageTitle } from '../../shared/components/PageTitle'
import { SourceTag } from '../../shared/components/SourceTag'

/** Data Sources & Transparency page. */
export function SourcesPage() {
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const sources = [
    [
      'NASA Environmental Data App',
      'Cabin environmental categories and measurement context',
      'Historical research + simulated',
      'Used to structure CO₂, pressure, temperature, humidity, air quality, and location context. Prototype values remain simulated.',
    ],
    [
      'NASA Open Science Data Repository',
      'Human spaceflight study protocols and research datasets',
      'Historical research',
      'Used for study-variable naming, collection-method context, and data provenance. No participant records are reproduced.',
    ],
    [
      'NASA Life Sciences Portal',
      'Human research study context and experiment metadata',
      'Historical research',
      'Used to organize periodic examination and human-research categories without inferring clinical conclusions.',
    ],
    [
      'Inspiration4 research datasets',
      'Civilian spaceflight health research structure',
      'Historical research',
      'Used as a reference for integrated wearable, laboratory, cognitive, and microbiome study organization.',
    ],
    [
      'NASA & JAXA human research',
      'Long-duration spaceflight monitoring categories',
      'Historical research',
      'Used to inform long-duration physiological and environmental monitoring categories across partner research.',
    ],
  ]
  return (
    <>
      <PageTitle
        kicker="DATA PROVENANCE"
        title="Sources & Transparency"
        description="Every interface measurement is labeled by acquisition type and prototype origin."
      />
      <div className="source-type-grid">
        <div>
          <SourceTag>Continuous sensor</SourceTag>
          <p>Automatically sampled cabin or wearable telemetry.</p>
        </div>
        <div>
          <SourceTag kind="lab">Periodic laboratory</SourceTag>
          <p>Discrete sample with collection and analysis time.</p>
        </div>
        <div>
          <SourceTag kind="self">Self-reported</SourceTag>
          <p>Crew check-ins and questionnaires with role controls.</p>
        </div>
        <div>
          <SourceTag kind="research">Historical research</SourceTag>
          <p>Study context; not current personal exposure.</p>
        </div>
      </div>
      <div className="source-list">
        {sources.map(([name, use, type, note]) => (
          <article className={activeSource === name ? 'expanded' : ''} key={name}>
            <div className="nasa-mark">NASA</div>
            <div>
              <h3>{name}</h3>
              <p>{use}</p>
            </div>
            <span>{type}</span>
            <button
              aria-expanded={activeSource === name}
              onClick={() => setActiveSource(activeSource === name ? null : name)}
            >
              Dataset notes <Icon name="chevron" size={14} />
            </button>
            {activeSource === name && (
              <div className="source-notes">
                <SourceTag kind="research">Research foundation</SourceTag>
                <p>{note}</p>
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="transparency-note">
        <h3>Prototype data policy</h3>
        <p>
          Actual astronaut measurements are not displayed. All crew values in this hackathon
          prototype are simulated and clearly labeled. Research-derived categories inform interface
          structure only; they do not provide diagnosis or individualized exposure conclusions.
        </p>
      </div>
    </>
  )
}
