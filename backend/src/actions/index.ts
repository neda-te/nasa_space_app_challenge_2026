/**
 * Server-side implementation of the backend contract.
 *
 * Bundles all server actions into one object that satisfies `BackendActions`, the
 * interface the dashboard UI programs against (`src/services/backend/contract.ts`).
 * The host page passes it to `<BackendProvider>`.
 */

import type { BackendActions } from '@dashboard/services/backend/contract'
import {
  getPrivateDashboardData,
  loginAstronaut,
  logoutAstronaut,
  registerAstronaut,
} from './auth'
import { submitDailyCheckIn } from './check-in'
import { deleteJournalEntry, saveJournalEntry } from './journal'
import { setReminderCompleted } from './reminders'

export const serverBackend: BackendActions = {
  getPrivateDashboardData,
  registerAstronaut,
  loginAstronaut,
  logoutAstronaut,
  setReminderCompleted,
  saveJournalEntry,
  deleteJournalEntry,
  submitDailyCheckIn,
}
