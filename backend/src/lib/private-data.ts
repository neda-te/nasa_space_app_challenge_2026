/**
 * Read access to the private records of one crew member.
 *
 * All queries run with `overrideAccess: false` and the acting `user`, so the access
 * rules of the collections (owner-only) are enforced by Payload on every call.
 */

import 'server-only'

import { getPayloadClient } from '@/lib/payload'
import { toAppUserView } from '@/lib/app-auth'
import type { Journal, ReminderCompletion, User } from '@/payload-types'
import type {
  JournalEntryView,
  PrivateDashboardData,
  ReminderCompletionView,
} from '@dashboard/services/backend/contract'

/** Maps a `reminder-completions` document to its UI shape. */
export function toReminderCompletionView(document: ReminderCompletion): ReminderCompletionView {
  return {
    id: String(document.id),
    reminderKey: document.reminderKey,
    completed: document.completed,
    completedAt: document.completedAt ?? null,
  }
}

/** Maps a `journals` document to its UI shape. */
export function toJournalEntryView(document: Journal): JournalEntryView {
  return {
    id: String(document.id),
    title: document.title,
    body: document.body,
    entryDate: document.entryDate,
    mood: document.mood ?? null,
    sharedWithMedical: document.sharedWithMedical ?? false,
    updatedAt: document.updatedAt,
  }
}

/** Loads profile, reminder completions and journal entries of `user`. */
export async function getPrivateDataForUser(user: User): Promise<PrivateDashboardData> {
  const payload = await getPayloadClient()
  const [reminders, journals] = await Promise.all([
    payload.find({
      collection: 'reminder-completions',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 20,
      where: { owner: { equals: user.id } },
    }),
    payload.find({
      collection: 'journals',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 100,
      sort: '-entryDate',
      where: { owner: { equals: user.id } },
    }),
  ])

  return {
    user: toAppUserView(user),
    reminders: reminders.docs.map(toReminderCompletionView),
    journals: journals.docs.map(toJournalEntryView),
  }
}
