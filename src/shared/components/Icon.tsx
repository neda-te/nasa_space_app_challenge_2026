/**
 * Inline SVG icon set.
 *
 * All icons are drawn on a 24x24 grid and inherit the current text colour, so they
 * can be styled purely through CSS.
 */

import type { ReactNode } from 'react'

/** SVG path data per icon name. */
const icons: Record<string, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
  ),
  environment: (
    <>
      <path d="M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M12 2v20M3 12h18M5.6 5.6c3.5 3.5 9.3 3.5 12.8 0M5.6 18.4c3.5-3.5 9.3-3.5 12.8 0" />
    </>
  ),
  lab: (
    <>
      <path d="M9 3h6M10 3v6l-5.3 9.2A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.7-2.8L14 9V3" />
      <path d="M7.5 16h9" />
    </>
  ),
  trend: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 16 4-5 4 3 5-7" />
    </>
  ),
  data: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
    </>
  ),
  journal: (
    <>
      <path d="M5 3h11a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3Z" />
      <path d="M8 3v18M11 8h5M11 12h5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  breath: (
    <>
      <path d="M4 9c2.5 0 2.5-3 5-3 1.7 0 2.5 1.1 2.5 2.2S10.7 10.5 9 10.5H3" />
      <path d="M5 15c2.5 0 2.5 3 5 3 1.7 0 2.5-1.1 2.5-2.2s-.8-2.3-2.5-2.3H3" />
      <path d="M14 8.5c1.5-1.7 3-2.5 4.4-1.5 1.4 1 1 3.5-1.4 3.5h-3M14 13.5h4c2.4 0 2.8 2.5 1.4 3.5-1.4 1-2.9.2-4.4-1.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  grip: (
    <>
      <circle cx="8" cy="7" r=".8" fill="currentColor" />
      <circle cx="16" cy="7" r=".8" fill="currentColor" />
      <circle cx="8" cy="12" r=".8" fill="currentColor" />
      <circle cx="16" cy="12" r=".8" fill="currentColor" />
      <circle cx="8" cy="17" r=".8" fill="currentColor" />
      <circle cx="16" cy="17" r=".8" fill="currentColor" />
    </>
  ),
}

/** Renders the icon registered under `name`. */
export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}
