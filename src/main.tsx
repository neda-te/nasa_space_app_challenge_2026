/**
 * Browser entry point of the local preview (`npm run dev` / `npm run build`).
 *
 * Mounts the dashboard with the local-preview backend, which stores nothing.
 * The server-rendered entry point with the real backend is
 * `backend/src/app/(frontend)/page.tsx`.
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { BackendProvider } from './services/backend/BackendContext'
import { localPreviewBackend } from './services/backend/local-preview'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BackendProvider actions={localPreviewBackend}>
      <App emergencySnapshots={[]} />
    </BackendProvider>
  </React.StrictMode>,
)
