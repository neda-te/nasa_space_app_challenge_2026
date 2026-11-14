// Local preview uses the original dashboard UI, without the Figma server runtime.
// Never pretend that private health records or authentication have been saved.
const unavailable = async (..._args: unknown[]) => ({
  success: false as const,
  message: 'Sign-in and saved health records require the connected Figma Make backend. They are unavailable in this local preview.',
})

export async function getPrivateDashboardData() {
  return { user: null, reminders: [], journals: [] }
}

export const loginAstronaut = unavailable
export const registerAstronaut = unavailable
export const logoutAstronaut = unavailable
export const saveJournalEntry = unavailable
export const deleteJournalEntry = unavailable
export const setReminderCompleted = unavailable
export const submitDailyCheckIn = unavailable
