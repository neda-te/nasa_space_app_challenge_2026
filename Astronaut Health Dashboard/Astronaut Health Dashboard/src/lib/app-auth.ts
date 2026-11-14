import 'server-only'

import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import type { User } from '@/payload-types'

const sessionCookie = 'app-session'

export type AppUserView = {
  id: string
  email: string
  name: string
  astronautCode: string
}

function isAppUser(user: Record<string, unknown>): user is Record<string, unknown> & User {
  return user.collection === 'users' && Boolean(user.id) && Boolean(user.email)
}

export function toAppUserView(user: User): AppUserView {
  return {
    id: String(user.id),
    email: String(user.email),
    name: String(user.name || 'Astronaut'),
    astronautCode: String(user.astronautCode || 'MC-01'),
  }
}

export async function getCurrentAppUser(): Promise<User | null> {
  const token = (await cookies()).get(sessionCookie)?.value
  if (!token) return null

  const payload = await getPayloadClient()
  const authHeaders = new Headers({ Authorization: `JWT ${token}` })
  const { user } = await payload.auth({ headers: authHeaders })
  const candidate = user as unknown as Record<string, unknown> | null
  return candidate && isAppUser(candidate) ? candidate : null
}

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
    maxAge: 60 * 60 * 24 * 7,
  })
  return candidate
}

export async function logoutAppUser() {
  const cookieStore = await cookies()
  cookieStore.delete(sessionCookie)
}
