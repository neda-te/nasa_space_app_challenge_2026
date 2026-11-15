/**
 * Session handling for crew members (the `users` collection).
 *
 * Authentication is done by Payload; the resulting JWT is kept in an http-only cookie so
 * that browser scripts can never read it. Admin users of the Payload panel (`admins`
 * collection) are a separate account type and are never accepted here.
 */

import 'server-only'

import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import type { User } from '@/payload-types'
import type { AppUserView } from '@dashboard/services/backend/contract'

const sessionCookie = 'app-session'
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7

/** Type guard: `user` is an authenticated document of the `users` collection. */
function isAppUser(user: Record<string, unknown>): user is Record<string, unknown> & User {
  return user.collection === 'users' && Boolean(user.id) && Boolean(user.email)
}

/** Reduces a user document to the fields the UI is allowed to see. */
export function toAppUserView(user: User): AppUserView {
  return {
    id: String(user.id),
    email: String(user.email),
    name: String(user.name || 'Astronaut'),
    astronautCode: String(user.astronautCode || 'MC-01'),
  }
}

/** Returns the crew member of the current request, or `null` when signed out. */
export async function getCurrentAppUser(): Promise<User | null> {
  const token = (await cookies()).get(sessionCookie)?.value
  if (!token) return null

  const payload = await getPayloadClient()
  const authHeaders = new Headers({ Authorization: `JWT ${token}` })
  const { user } = await payload.auth({ headers: authHeaders })
  const candidate = user as unknown as Record<string, unknown> | null
  return candidate && isAppUser(candidate) ? candidate : null
}

/**
 * Verifies the credentials and starts a session.
 *
 * @throws when the credentials are wrong or do not belong to a crew member.
 */
export async function loginAppUser(email: string, password: string): Promise<User> {
  const payload = await getPayloadClient()
  const result = await payload.login({
    collection: 'users',
    data: { email, password },
  })
  const candidate = result.user as unknown as Record<string, unknown>
  if (!result.token || !isAppUser(candidate)) throw new Error('Invalid astronaut account.')

  const cookieStore = await cookies()
  cookieStore.set(sessionCookie, result.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: sessionMaxAgeSeconds,
  })
  return candidate
}

/** Ends the session of the current request. */
export async function logoutAppUser() {
  const cookieStore = await cookies()
  cookieStore.delete(sessionCookie)
}
