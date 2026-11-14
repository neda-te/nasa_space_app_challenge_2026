'use server'

import {
  getCurrentAppUser,
  loginAppUser,
  logoutAppUser,
  toAppUserView,
  type AppUserView,
} from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import type { Journal, ReminderCompletion, User } from '@/payload-types'

const reminderKeys = ['daily-health', 'blood-test', 'urine-test', 'ultrasound'] as const
type ReminderKey = (typeof reminderKeys)[number]
type Mood = 'calm' | 'focused' | 'tired' | 'stressed' | 'positive'

export type ReminderCompletionView = {
  id: string
  reminderKey: ReminderKey
  completed: boolean
  completedAt: string | null
}

export type JournalEntryView = {
  id: string
  title: string
  body: string
  entryDate: string
  mood: Mood | null
  sharedWithMedical: boolean
  updatedAt: string
}

export type PrivateDashboardData = {
  user: AppUserView | null
  reminders: ReminderCompletionView[]
  journals: JournalEntryView[]
}

export type DashboardActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; message: string }

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

async function getPrivateDataForUser(user: User): Promise<PrivateDashboardData> {
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
    reminders: reminders.docs.map((document) => ({
      id: String(document.id),
      reminderKey: document.reminderKey,
      completed: document.completed,
      completedAt: document.completedAt ?? null,
    })),
    journals: journals.docs.map((document) => ({
      id: String(document.id),
      title: document.title,
      body: document.body,
      entryDate: document.entryDate,
      mood: document.mood ?? null,
      sharedWithMedical: document.sharedWithMedical ?? false,
      updatedAt: document.updatedAt,
    })),
  }
}

export async function getPrivateDashboardData(): Promise<PrivateDashboardData> {
  const user = await getCurrentAppUser()
  if (!user) return { user: null, reminders: [], journals: [] }
  return getPrivateDataForUser(user)
}

export async function registerAstronaut(input: {
  name: string
  email: string
  password: string
}): Promise<DashboardActionResult<PrivateDashboardData>> {
  const name = input.name?.trim()
  const email = input.email?.trim().toLowerCase()
  if (!name || name.length > 100) return { success: false, message: 'Enter your name.' }
  if (!isEmail(email)) return { success: false, message: 'Enter a valid email address.' }
  if (!input.password || input.password.length < 8) {
    return { success: false, message: 'Use a password with at least 8 characters.' }
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'users',
      overrideAccess: false,
      data: {
        name,
        email,
        password: input.password,
        astronautCode: 'MC-01',
      },
    })
    const user = await loginAppUser(email, input.password)
    return { success: true, data: await getPrivateDataForUser(user) }
  } catch {
    return {
      success: false,
      message: 'This account could not be created. The email may be in use.',
    }
  }
}

export async function loginAstronaut(input: {
  email: string
  password: string
}): Promise<DashboardActionResult<PrivateDashboardData>> {
  const email = input.email?.trim().toLowerCase()
  if (!isEmail(email) || !input.password) {
    return { success: false, message: 'Enter your email and password.' }
  }
  try {
    const user = await loginAppUser(email, input.password)
    return { success: true, data: await getPrivateDataForUser(user) }
  } catch {
    return { success: false, message: 'Email or password is incorrect.' }
  }
}

export async function logoutAstronaut(): Promise<DashboardActionResult> {
  await logoutAppUser()
  return { success: true, data: undefined }
}

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
    return {
      success: true,
      data: {
        id: String(document.id),
        reminderKey: document.reminderKey,
        completed: document.completed,
        completedAt: document.completedAt ?? null,
      },
    }
  } catch {
    return { success: false, message: 'The reminder could not be updated.' }
  }
}

function validateJournal(input: {
  title: string
  body: string
  entryDate: string
  mood: string | null
  sharedWithMedical: boolean
}) {
  const title = input.title?.trim()
  const body = input.body?.trim()
  const entryDate = input.entryDate
  const moods: Mood[] = ['calm', 'focused', 'tired', 'stressed', 'positive']
  if (!title || title.length > 140) return 'Enter a title up to 140 characters.'
  if (!body || body.length > 10000) return 'Enter a journal entry up to 10,000 characters.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) return 'Choose a valid entry date.'
  if (input.mood && !moods.includes(input.mood as Mood)) return 'Choose a valid mood.'
  return null
}

export async function saveJournalEntry(input: {
  id?: string
  title: string
  body: string
  entryDate: string
  mood: string | null
  sharedWithMedical: boolean
}): Promise<DashboardActionResult<JournalEntryView>> {
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
    return {
      success: true,
      data: {
        id: String(document.id),
        title: document.title,
        body: document.body,
        entryDate: document.entryDate,
        mood: document.mood ?? null,
        sharedWithMedical: document.sharedWithMedical ?? false,
        updatedAt: document.updatedAt,
      },
    }
  } catch {
    return { success: false, message: 'The journal entry could not be saved.' }
  }
}

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
