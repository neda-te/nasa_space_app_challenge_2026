'use server'

/**
 * Server actions: daily health check-in.
 */

import { getCurrentAppUser } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import type {
  CheckInActionResult,
  CheckInResponseField,
  CheckInSubmission,
} from '@dashboard/services/backend/contract'

/**
 * Validates and stores one check-in session of the signed-in crew member.
 *
 * Only the questions that belong to the session type are accepted (morning: sleep and
 * alertness; evening: fatigue, stress, workload and crew connection). Fields the server
 * owns (owner, astronaut code, measured sleep) are set by the collection hook.
 */
export async function submitDailyCheckIn(
  submission: CheckInSubmission,
): Promise<CheckInActionResult> {
  if (
    !submission ||
    (submission.sessionType !== 'morning' && submission.sessionType !== 'evening')
  ) {
    return { success: false, field: 'sessionType', message: 'Choose a valid check-in period.' }
  }
  if (submission.privacyLevel !== 'private' && submission.privacyLevel !== 'crew-medical') {
    return { success: false, field: 'privacyLevel', message: 'Choose a valid privacy setting.' }
  }

  const allowedForSession: CheckInResponseField[] =
    submission.sessionType === 'morning'
      ? ['sleepQuality', 'physicalRestfulness', 'mentalAlertness']
      : [
          'mentalExhaustion',
          'physicalFatigue',
          'stressLevel',
          'workloadManageability',
          'crewConnection',
        ]

  const responses: Partial<Record<CheckInResponseField, number>> = {}
  for (const field of allowedForSession) {
    const value = submission.responses?.[field]
    if (value === null || value === undefined) continue
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return { success: false, field, message: 'Responses must use the 1–5 scale.' }
    }
    responses[field] = value
  }
  if (Object.keys(responses).length === 0) {
    return { success: false, message: 'Answer at least one question before submitting.' }
  }
  if (
    submission.sessionType === 'morning' &&
    submission.hasPhysicalDiscomfort !== true &&
    submission.hasPhysicalDiscomfort !== false
  ) {
    return {
      success: false,
      field: 'hasPhysicalDiscomfort',
      message: 'Choose Yes or No for physical discomfort.',
    }
  }
  const discomfortDescription = submission.physicalDiscomfortDescription?.trim() ?? ''
  if (discomfortDescription.length > 500) {
    return {
      success: false,
      field: 'physicalDiscomfortDescription',
      message: 'Keep the discomfort description under 500 characters.',
    }
  }
  if (submission.hasPhysicalDiscomfort !== true && discomfortDescription) {
    return {
      success: false,
      field: 'physicalDiscomfortDescription',
      message: 'A discomfort description can only be saved with a Yes response.',
    }
  }

  try {
    const user = await getCurrentAppUser()
    if (!user) {
      return { success: false, message: 'Sign in to save your private daily health record.' }
    }
    const payload = await getPayloadClient()
    const document = await payload.create({
      collection: 'daily-health-checkins',
      overrideAccess: false,
      user,
      draft: false,
      data: {
        owner: user.id,
        astronautCode: 'MC-01',
        sessionType: submission.sessionType,
        privacyLevel: submission.privacyLevel,
        responses: {
          ...responses,
          hasPhysicalDiscomfort:
            submission.sessionType === 'morning'
              ? submission.hasPhysicalDiscomfort === true
              : undefined,
          physicalDiscomfortDescription:
            submission.sessionType === 'morning' && submission.hasPhysicalDiscomfort
              ? discomfortDescription
              : undefined,
        },
        researchBasis: 'Research-inspired prototype; not an official NASA questionnaire',
      },
    })
    return { success: true, id: String(document.id) }
  } catch {
    return {
      success: false,
      message: 'The check-in could not be saved. Your answers remain on this screen.',
    }
  }
}
