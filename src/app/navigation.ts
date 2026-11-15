/**
 * Sidebar navigation entries of the dashboard shell.
 */

import type { Page } from '../shared/types'

/** Entries of the sidebar navigation, in display order. */
export const navItems: { label: string; icon: string; page: Page }[] = [
  { label: 'Health Dashboard', icon: 'dashboard', page: 'Dashboard' },
  { label: 'Physical Health', icon: 'heart', page: 'Physical' },
  { label: 'Environmental Monitoring', icon: 'environment', page: 'Environment' },
  { label: 'Tests & Lab Data', icon: 'lab', page: 'Blood' },
  { label: 'Trends & Analysis', icon: 'trend', page: 'Trends' },
  { label: 'My Journal', icon: 'journal', page: 'Journal' },
  { label: 'Data Sources', icon: 'data', page: 'Sources' },
  { label: 'Emergency Data', icon: 'heart', page: 'EmergencyData' },
  { label: 'Dashboard Settings', icon: 'settings', page: 'Customize' },
]
