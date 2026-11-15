/**
 * Backend implementation for the local preview (`npm run dev`).
 *
 * No server is running in the local preview, so nothing can be stored. Every action
 * therefore answers with an explicit "not available" message instead of pretending
 * that sign-in or saving worked. Private health data is never simulated or kept in
 * the browser.
 *
 * The real implementation lives in `backend/src/actions`.
 */

import type { BackendActions } from './contract'

const unavailable = async () => ({
  success: false as const,
  message:
    'Sign-in and saved health records require the connected backend. They are unavailable in this local preview.',
})

export const localPreviewBackend: BackendActions = {
  getPrivateDashboardData: async () => ({ user: null, reminders: [], journals: [] }),
  registerAstronaut: unavailable,
  loginAstronaut: unavailable,
  logoutAstronaut: unavailable,
  setReminderCompleted: unavailable,
  saveJournalEntry: unavailable,
  deleteJournalEntry: unavailable,
  submitDailyCheckIn: unavailable,
}
