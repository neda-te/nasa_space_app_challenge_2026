/**
 * Tests & Lab Data page: filterable table of blood or urine results with reference ranges and trends.
 */

import { useState } from 'react'
import { bloodRows, urineRows } from '../../data/simulated/lab-results'
import { PageTitle } from '../../shared/components/PageTitle'
import { SourceTag } from '../../shared/components/SourceTag'
import { Sparkline } from '../../shared/components/Sparkline'
import type { Page } from '../../shared/types'
import { PhysicalTabs } from '../physical-health/PhysicalTabs'

/** Lab results table for the given sample `type`. */
export function LabPage({ type, go }: { type: 'Blood' | 'Urine'; go: (page: Page) => void }) {
  const rows = type === 'Blood' ? bloodRows : urineRows
  const [category, setCategory] = useState('All results')
  const categories = ['All results', ...Array.from(new Set(rows.map((row) => row.category)))]
  const visible =
    category === 'All results' ? rows : rows.filter((row) => row.category === category)
  return (
    <>
      <PageTitle
        kicker="PHYSICAL HEALTH · PERIODIC LABORATORY"
        title={`${type} Test Results`}
        description={`${type === 'Blood' ? 'Blood chemistry, immune, nutritional, glucose, cardiovascular, and bone metabolism results.' : 'Hydration, renal, chemistry, microbial, and exposure results from the latest available sample.'}`}
        action={
          <div className="sample-stamp">
            <span>LATEST SAMPLE</span>
            <b>{type === 'Blood' ? 'Sol 180 · 06:30' : 'Sol 183 · 07:10'}</b>
          </div>
        }
      />
      <PhysicalTabs active={type} go={go} />
      <div className="lab-banner">
        <div>
          <SourceTag kind="lab">Periodic laboratory</SourceTag>
          <b>Not continuously tracked</b>
        </div>
        <p>
          Reference information is shown only when provided by a mission protocol. No clinical
          reference ranges are inferred.
        </p>
      </div>
      <div className="filter-row">
        {categories.map((item) => (
          <button
            className={category === item ? 'active' : ''}
            onClick={() => setCategory(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="results-table">
        <div className="results-header">
          <span>Measurement</span>
          <span>Latest result</span>
          <span>Previous</span>
          <span>Reference information</span>
          <span>Historical trend</span>
          <span>Data source</span>
        </div>
        {visible.map((row) => (
          <div className={`result-row ${row.missing ? 'missing' : ''}`} key={row.name}>
            <div>
              <small>{row.category}</small>
              <b>{row.name}</b>
              <span>{row.date}</span>
            </div>
            <strong>
              {row.value}
              {row.missing && <em>Missing data</em>}
            </strong>
            <span>{row.previous}</span>
            <span>{row.reference}</span>
            <div>
              {row.trend.length ? (
                <Sparkline values={row.trend} tone={row.missing ? 'orange' : 'blue'} />
              ) : (
                <span className="no-trend">Not enough data</span>
              )}
            </div>
            <span>{row.source}</span>
          </div>
        ))}
      </div>
    </>
  )
}
