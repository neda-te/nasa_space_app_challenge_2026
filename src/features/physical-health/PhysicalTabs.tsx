/**
 * Tab bar that links the Physical Health overview with the Blood and Urine lab pages.
 */

import type { Page } from '../../shared/types'

/** Tab bar; `active` marks the current page. */
export function PhysicalTabs({ active, go }: { active: Page; go: (page: Page) => void }) {
  return (
    <div className="page-tabs">
      {[
        { label: 'Overview', page: 'Physical' as Page },
        { label: 'Blood Test', page: 'Blood' as Page },
        { label: 'Urine Test', page: 'Urine' as Page },
      ].map((tab) => (
        <button
          className={active === tab.page ? 'active' : ''}
          onClick={() => go(tab.page)}
          key={tab.page}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
