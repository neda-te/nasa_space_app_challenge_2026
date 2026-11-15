/**
 * Health reminders panel on the home dashboard (questionnaire, blood test,
 * urine test, ultrasound). Completion state is stored per user in the backend.
 */

import type { ReminderCompletionView } from '../../services/backend/contract'
import { Icon } from '../../shared/components/Icon'
import type { Page } from '../../shared/types'

/** Reminder definitions. `key` must match the reminder keys accepted by the backend. */
const dashboardReminders = [
  {
    key: 'daily-health',
    title: 'Daily health assessment',
    detail: 'Complete the private Daily Health Questionnaire.',
    dueOffset: 0,
    kind: 'Questionnaire',
    destination: 'checkin',
  },
  {
    key: 'blood-test',
    title: 'Scheduled blood test',
    detail: 'Periodic chemistry and immune panel.',
    dueOffset: 1,
    kind: 'Blood test',
    destination: 'Blood',
  },
  {
    key: 'urine-test',
    title: 'Scheduled urine test',
    detail: 'Hydration, renal, and chemistry sample.',
    dueOffset: 3,
    kind: 'Urine test',
    destination: 'Urine',
  },
  {
    key: 'ultrasound',
    title: 'Venous ultrasound assessment',
    detail: 'Periodic circulation examination follow-up.',
    dueOffset: -2,
    kind: 'Ultrasound',
    destination: 'Physical',
  },
] as const

/** Formats today plus `offset` days as a short date. */
function formatReminderDate(offset: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Reminder list with completion checkboxes; asks for sign-in when the user is not signed in. */
export function DashboardReminders({
  completions,
  signedIn,
  onToggle,
  onStartCheckIn,
  go,
  openPhysical,
}: {
  completions: ReminderCompletionView[]
  signedIn: boolean
  onToggle: (key: string, completed: boolean) => void
  onStartCheckIn: () => void
  go: (page: Page) => void
  openPhysical: (category: string) => void
}) {
  const completionByKey = new Map(completions.map((item) => [item.reminderKey, item]))

  const openReminder = (destination: (typeof dashboardReminders)[number]['destination']) => {
    if (destination === 'checkin') onStartCheckIn()
    else if (destination === 'Physical') openPhysical('Venous Circulation')
    else go(destination)
  }

  return (
    <section className="dashboard-reminders" aria-labelledby="dashboard-reminders-title">
      <div className="reminder-heading">
        <div>
          <span className="eyebrow">SCHEDULE & FOLLOW-UP</span>
          <h3 id="dashboard-reminders-title">Health reminders</h3>
        </div>
        <span>{signedIn ? 'Completion sync active' : 'Sign in to sync completion'}</span>
      </div>
      <div className="reminder-grid">
        {dashboardReminders.map((reminder) => {
          const completion = completionByKey.get(reminder.key)
          const completed = completion?.completed === true
          const overdue = reminder.dueOffset < 0 && !completed
          return (
            <article
              className={`${completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
              key={reminder.key}
            >
              <button
                className="reminder-check"
                aria-label={`${completed ? 'Reopen' : 'Complete'} ${reminder.title}`}
                aria-pressed={completed}
                onClick={() => onToggle(reminder.key, !completed)}
              >
                {completed && <Icon name="check" size={13} />}
              </button>
              <div>
                <span>{reminder.kind}</span>
                <button
                  className="reminder-link"
                  onClick={() => openReminder(reminder.destination)}
                >
                  {reminder.title}
                </button>
                <p>{reminder.detail}</p>
              </div>
              <div className="reminder-due">
                <span>{completed ? 'COMPLETED' : overdue ? 'OVERDUE' : 'DUE'}</span>
                <b>
                  {completed && completion?.completedAt
                    ? new Date(completion.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : formatReminderDate(reminder.dueOffset)}
                </b>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
