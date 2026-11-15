/**
 * Questions of the daily health check-in.
 *
 * Research-inspired prototype questionnaire; not an official NASA instrument.
 * The `field` names are the keys stored by the backend
 * (`backend/src/collections/DailyHealthCheckins.ts`).
 */

/** Morning session: 1-5 scale questions. */
export const morningQuestions = [
  {
    field: 'sleepQuality',
    title: 'How would you rate your sleep quality?',
    support: 'Consider how continuous and restorative your sleep felt.',
    low: 'Very poor',
    high: 'Excellent',
  },
  {
    field: 'physicalRestfulness',
    title: 'How physically rested do you feel?',
    support: 'Notice muscle heaviness, energy, and readiness to move.',
    low: 'Not rested',
    high: 'Fully rested',
  },
  {
    field: 'mentalAlertness',
    title: 'How mentally alert do you feel?',
    support: 'Consider concentration, clarity, and readiness to focus.',
    low: 'Very foggy',
    high: 'Very alert',
  },
] as const

/** Number of morning steps (scale questions plus the yes/no discomfort question). */
export const morningQuestionCount = morningQuestions.length + 1

/** Evening session: 1-5 scale questions. */
export const eveningQuestions = [
  { field: 'mentalExhaustion', title: 'Mental exhaustion', low: 'Low', high: 'High' },
  { field: 'physicalFatigue', title: 'Physical fatigue', low: 'Low', high: 'High' },
  { field: 'stressLevel', title: 'Stress level', low: 'Low', high: 'High' },
  {
    field: 'workloadManageability',
    title: 'Workload manageability',
    low: 'Difficult',
    high: 'Manageable',
  },
  {
    field: 'crewConnection',
    title: 'Connection with the crew',
    low: 'Disconnected',
    high: 'Connected',
  },
] as const

/** Field name of any scale question. */
export type CheckInAnswerKey =
  | (typeof morningQuestions)[number]['field']
  | (typeof eveningQuestions)[number]['field']
