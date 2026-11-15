/**
 * Backend contract.
 *
 * The single source of truth for everything the UI may ask the backend to do, and for
 * the shapes of the data that travel between them. Both sides depend on this file:
 *
 * - UI:      calls the functions of `BackendActions` through `useBackend()`.
 * - Server:  `backend/src/actions` implements `BackendActions` with Payload CMS.
 * - Local:   `local-preview.ts` implements it without persistence.
 *
 * This file contains only types and constant value lists (no logic), so it can be
 * imported from client and server code.
 */

/** Signed-in crew member as shown in the UI. */
export type AppUserView = {
  id: string
  email: string
  name: string
  astronautCode: string
}

/** Keys of the health reminders shown on the home dashboard. */
export const reminderKeys = ['daily-health', 'blood-test', 'urine-test', 'ultrasound'] as const
export type ReminderKey = (typeof reminderKeys)[number]

/** Moods a journal entry can be tagged with. */
export const journalMoods = ['calm', 'focused', 'tired', 'stressed', 'positive'] as const
export type Mood = (typeof journalMoods)[number]

/** Completion state of one reminder for the signed-in user. */
export type ReminderCompletionView = {
  id: string
  reminderKey: ReminderKey
  completed: boolean
  completedAt: string | null
}

/** One private journal entry. */
export type JournalEntryView = {
  id: string
  title: string
  body: string
  entryDate: string
  mood: Mood | null
  sharedWithMedical: boolean
  updatedAt: string
}

/** Everything that belongs to the signed-in user. `user` is `null` when signed out. */
export type PrivateDashboardData = {
  user: AppUserView | null
  reminders: ReminderCompletionView[]
  journals: JournalEntryView[]
}

/** Result of a backend action: either the data or a message that can be shown to the user. */
export type DashboardActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; message: string }

/** Scale questions (1-5) of the daily check-in. */
export const checkInResponseFields = [
  'sleepQuality',
  'physicalRestfulness',
  'mentalAlertness',
  'mentalExhaustion',
  'physicalFatigue',
  'stressLevel',
  'workloadManageability',
  'crewConnection',
] as const
export type CheckInResponseField = (typeof checkInResponseFields)[number]

/** A daily check-in as submitted by the UI. */
export type CheckInSubmission = {
  sessionType: 'morning' | 'evening'
  privacyLevel: 'private' | 'crew-medical'
  responses: Partial<Record<CheckInResponseField, number | null>>
  hasPhysicalDiscomfort?: boolean | null
  physicalDiscomfortDescription?: string
}

/** Result of a check-in submission. `field` names the invalid input, if any. */
export type CheckInActionResult =
  | { success: true; id: string }
  | { success: false; field?: string; message: string }

/** Input of `saveJournalEntry`. Omit `id` to create a new entry. */
export type JournalEntryInput = {
  id?: string
  title: string
  body: string
  /** Calendar date in the form YYYY-MM-DD. */
  entryDate: string
  mood: string | null
  sharedWithMedical: boolean
}

/** All operations the UI can perform against the backend. */
export interface BackendActions {
  /** Loads the private data of the current session (empty when signed out). */
  getPrivateDashboardData(): Promise<PrivateDashboardData>

  registerAstronaut(input: {
    name: string
    email: string
    password: string
  }): Promise<DashboardActionResult<PrivateDashboardData>>

  loginAstronaut(input: {
    email: string
    password: string
  }): Promise<DashboardActionResult<PrivateDashboardData>>

  logoutAstronaut(): Promise<DashboardActionResult>

  setReminderCompleted(
    reminderKey: string,
    completed: boolean,
  ): Promise<DashboardActionResult<ReminderCompletionView>>

  saveJournalEntry(input: JournalEntryInput): Promise<DashboardActionResult<JournalEntryView>>

  deleteJournalEntry(id: string): Promise<DashboardActionResult<{ id: string }>>

  submitDailyCheckIn(submission: CheckInSubmission): Promise<CheckInActionResult>
}
