'use client'
// ^ Marks the client boundary when the dashboard is rendered by the Next.js host (backend/). Ignored by Vite.

/**
 * Makes the backend available to the component tree.
 *
 * Components never import a concrete backend. They call `useBackend()` and get whatever
 * implementation the host put into `<BackendProvider>`:
 *
 * - `src/main.tsx` (local preview)      -> `localPreviewBackend`
 * - `backend/src/app/(frontend)/page.tsx` -> the Payload server actions
 *
 * This keeps the UI independent of where and how data is stored.
 */

import { createContext, useContext, type ReactNode } from 'react'
import type { BackendActions } from './contract'

const BackendContext = createContext<BackendActions | null>(null)

/** Provides `actions` to all components below it. */
export function BackendProvider({
  actions,
  children,
}: {
  actions: BackendActions
  children: ReactNode
}) {
  return <BackendContext.Provider value={actions}>{children}</BackendContext.Provider>
}

/** Returns the backend of the nearest `<BackendProvider>`. */
export function useBackend(): BackendActions {
  const backend = useContext(BackendContext)
  if (!backend) throw new Error('useBackend() must be used inside <BackendProvider>.')
  return backend
}
