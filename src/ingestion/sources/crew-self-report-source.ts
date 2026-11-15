/**
 * Connection point: crew self-reports (daily health check-in).
 *
 * STATUS: NOT CONNECTED to the gateway – check-ins are already stored by the backend
 * (`backend/src/actions/check-in.ts`, collection `daily-health-checkins`), but they are not
 * yet forwarded as readings.
 *
 * To connect: read the stored check-ins of a crew member and report the derived values,
 * e.g. the fatigue score (1–10) that the dashboard computes after a check-in
 * (`features/check-in/DailyCheckInFlow.tsx`).
 */

import { defineUnconnectedSource } from './unconnected-source'

export const crewSelfReportSource = defineUnconnectedSource({
  id: 'crew-self-report',
  name: 'Crew self-reports',
  kind: 'self-report',
  description: 'Values the crew member enters in the daily check-in (sleep quality, fatigue).',
  transport: 'Internal: HEALium backend (Payload collection `daily-health-checkins`)',
  provides: ['fatigue-score', 'sleep-quality'],
  quality: 'self-reported',
})
