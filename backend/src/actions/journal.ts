'use server'

/**
 * Server actions: private journal.
 */

import { getCurrentAppUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { toJournalEntryView } from '@/lib/private-data'
import type { Journal } from '@/payload-types'
import {
  journalMoods,
  type DashboardActionResult,
  type JournalEntryInput,
  type JournalEntryView,
  type Mood,
} from '@dashboard/services/backend/contract'

/** Returns an error message for invalid input, or `null` when the entry is valid. */
function validateJournal(input: JournalEntryInput) {
  const title = input.title?.trim()
  const body = input.body?.trim()
  const entryDate = input.entryDate
  if (!title || title.length > 140) return 'Enter a title up to 140 characters.'
  if (!body || body.length > 10000) return 'Enter a journal entry up to 10,000 characters.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) return 'Choose a valid entry date.'
  if (input.mood && !journalMoods.includes(input.mood as Mood)) return 'Choose a valid mood.'
  return null
}

/** Creates a journal entry, or updates the entry with `input.id`. */
export async function saveJournalEntry(
  input: JournalEntryInput,
): Promise<DashboardActionResult<JournalEntryView>> {
  const user = await getCurrentAppUser()
  if (!user) return { success: false, message: 'Sign in to save journal entries.' }
  const validationError = validateJournal(input)
  if (validationError) return { success: false, message: validationError }

  try {
    const payload = await getPayloadClient()
    const data = {
      owner: user.id,
      title: input.title.trim(),
      body: input.body.trim(),
      // Stored at noon UTC so the calendar date is the same in every time zone.
      entryDate: `${input.entryDate}T12:00:00.000Z`,
      mood: (input.mood || null) as Mood | null,
      sharedWithMedical: input.sharedWithMedical === true,
    }
    const document = (
      input.id
        ? await payload.update({
            collection: 'journals',
            id: input.id,
            overrideAccess: false,
            user,
            data,
          })
        : await payload.create({
            collection: 'journals',
            overrideAccess: false,
            user,
            data,
          })
    ) as Journal
    return { success: true, data: toJournalEntryView(document) }
  } catch {
    return { success: false, message: 'The journal entry could not be saved.' }
  }
}

/** Deletes a journal entry of the signed-in crew member. */
export async function deleteJournalEntry(
  id: string,
): Promise<DashboardActionResult<{ id: string }>> {
  const user = await getCurrentAppUser()
  if (!user) return { success: false, message: 'Sign in to delete journal entries.' }
  if (!id || id.length > 100) return { success: false, message: 'Invalid journal entry.' }

  try {
    const payload = await getPayloadClient()
    await payload.delete({
      collection: 'journals',
      id,
      overrideAccess: false,
      user,
    })
    return { success: true, data: { id } }
  } catch {
    return { success: false, message: 'The journal entry could not be deleted.' }
  }
}
