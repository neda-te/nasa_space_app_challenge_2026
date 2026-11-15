import type { CheckInSubmission } from '../Astronaut Health Dashboard/Astronaut Health Dashboard/src/app/(frontend)/checkin-actions'
import type { JournalEntryView, PrivateDashboardData, ReminderCompletionView } from '../Astronaut Health Dashboard/Astronaut Health Dashboard/src/app/(frontend)/dashboard-actions'

// Session-only prototype: no accounts, persistent health records, or network delivery.
let reminders: ReminderCompletionView[] = []
let journals: JournalEntryView[] = []
export async function getPrivateDashboardData(): Promise<PrivateDashboardData> {
  return { user: null, reminders: [...reminders], journals: [...journals] }
}
export async function setReminderCompleted(key: string, completed: boolean) {
  if (!['daily-health', 'blood-test', 'urine-test', 'ultrasound'].includes(key)) return { success: false as const, message: 'Choose a valid reminder.' }
  const data: ReminderCompletionView = { id: key, reminderKey: key as ReminderCompletionView['reminderKey'], completed, completedAt: completed ? new Date().toISOString() : null }
  reminders = [...reminders.filter((item) => item.reminderKey !== key), data]
  return { success: true as const, data, simulated: true }
}
export async function saveJournalEntry(input: Omit<JournalEntryView, 'id' | 'updatedAt'> & { id?: string }) {
  if (!input.title.trim() || !input.body.trim()) return { success: false as const, message: 'Add a title and reflection.' }
  const data: JournalEntryView = { ...input, title: input.title.trim(), body: input.body.trim(), id: input.id ?? crypto.randomUUID(), updatedAt: new Date().toISOString() }
  journals = [data, ...journals.filter((entry) => entry.id !== data.id)]
  return { success: true as const, data, simulated: true }
}
export async function deleteJournalEntry(id: string) {
  journals = journals.filter((entry) => entry.id !== id)
  return { success: true as const, data: undefined }
}
export async function submitDailyCheckIn(input: CheckInSubmission) {
  const responses = Object.values(input.responses)
  if (!responses.length || responses.some((value) => typeof value !== 'number' || value < 1 || value > 5)) return { success: false as const, message: 'Answer at least one item using the 1–5 scale.' }
  await new Promise((resolve) => setTimeout(resolve, 350))
  return { success: true as const, id: crypto.randomUUID(), simulated: true }
}
