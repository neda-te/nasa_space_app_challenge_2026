/**
 * Root layout of the dashboard pages: document metadata and the global stylesheet.
 *
 * The stylesheet is shared with the local preview and lives in `src/styles`.
 */

import React from 'react'
import type { Metadata } from 'next'
import '../../../../src/styles/index.css'

const title = 'Astronaut Health Monitoring'
const description =
  'Mission health, environmental monitoring, and simulated crew telemetry for long-duration spaceflight.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title,
  description,
  icons: { icon: '/favicon.svg' },
  openGraph: { title, description },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div id="root" tabIndex={-1}>
          {children}
        </div>
      </body>
    </html>
  )
}
