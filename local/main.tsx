import React from 'react'
import { createRoot } from 'react-dom/client'
import DashboardApp from '../Astronaut Health Dashboard/Astronaut Health Dashboard/src/app/(frontend)/DashboardApp'
import '../Astronaut Health Dashboard/Astronaut Health Dashboard/src/app/(frontend)/styles.css'
import '../shared/dashboard.css'
import '../shared/features.css'
import '../shared/telemetry.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DashboardApp emergencySnapshots={[]} prototypeMode />
  </React.StrictMode>,
)
