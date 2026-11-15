'use server'

/**
 * Server actions: health reminders.
 */

import { getCurrentAppUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { toReminderCompletionView } from '@/lib/private-data'
import type { ReminderCompletion } from '@/payload-types'
import {
  reminderKeys,
  type DashboardActionResult,
  type ReminderCompletionView,
  type ReminderKey,
} from '@dashboard/services/backend/contract'

/** Marks a reminder as completed / open for the signed-in crew member (one record per reminder). */
export async function setReminderCompleted(
  reminderKey: string,
  completed: boolean,
): Promise<DashboardActionResult<ReminderCompletionView>> {
  const user = await getCurrentAppUser()
  if (!user) return { success: false, message: 'Sign in to update reminders.' }
  if (!reminderKeys.includes(reminderKey as ReminderKey)) {
    return { success: false, message: 'Unknown reminder.' }
  }

  try {
    const payload = await getPayloadClient()
    const existing = await payload.find({
      collection: 'reminder-completions',
      overrideAccess: false,
      user,
      depth: 0,
      limit: 1,
      where: {
        and: [{ owner: { equals: user.id } }, { reminderKey: { equals: reminderKey } }],
      },
    })
    const document = (
      existing.docs[0]
        ? await payload.update({
            collection: 'reminder-completions',
            id: existing.docs[0].id,
            overrideAccess: false,
            user,
            data: { completed },
          })
        : await payload.create({
            collection: 'reminder-completions',
            overrideAccess: false,
            user,
            data: {
              owner: user.id,
              reminderKey: reminderKey as ReminderKey,
              completed,
            },
          })
    ) as ReminderCompletion
    return { success: true, data: toReminderCompletionView(document) }
  } catch {
    return { success: false, message: 'The reminder could not be updated.' }
  }
}
