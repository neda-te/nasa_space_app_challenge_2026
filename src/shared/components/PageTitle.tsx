/**
 * Standard page header (kicker, title, description and optional action area).
 */

import type { ReactNode } from 'react'

/** Page header with an optional `action` element rendered on the right. */
export function PageTitle({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}
