'use server'

/**
 * Server actions: account and session.
 *
 * Every action validates its input on the server and returns a serialisable result
 * (`DashboardActionResult`); it never throws to the client.
 */

import { getCurrentAppUser, loginAppUser, logoutAppUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { getPrivateDataForUser } from '@/lib/private-data'
import type {
  DashboardActionResult,
  PrivateDashboardData,
} from '@dashboard/services/backend/contract'

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

/** Loads the private data of the current session (empty when signed out). */
export async function getPrivateDashboardData(): Promise<PrivateDashboardData> {
  const user = await getCurrentAppUser()
  if (!user) return { user: null, reminders: [], journals: [] }
  return getPrivateDataForUser(user)
}

/** Creates a crew-member account and signs it in. */
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

/** Signs a crew member in and returns their private data. */
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

/** Ends the current session. */
export async function logoutAstronaut(): Promise<DashboardActionResult> {
  await logoutAppUser()
  return { success: true, data: undefined }
}
