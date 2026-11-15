/**
 * Server-rendered entry point of the dashboard.
 *
 * Loads the data that is public within the prototype (simulated emergency snapshots) on
 * the server and mounts the same React dashboard as the local preview (`src/main.tsx`),
 * but connected to the real backend: `serverBackend` contains the Payload server actions.
 */

import { App } from '@dashboard/app/App'
import { BackendProvider } from '@dashboard/services/backend/BackendContext'
import { serverBackend } from '@/actions'
import { listEmergencySnapshots } from '@/lib/emergency-snapshots'

export default async function HomePage() {
  const emergencySnapshots = await listEmergencySnapshots()

  return (
    <BackendProvider actions={serverBackend}>
      <App emergencySnapshots={emergencySnapshots} />
    </BackendProvider>
  )
}
