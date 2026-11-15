/**
 * Catalogue of home-dashboard widgets and the default layout.
 */

import type { WidgetId } from '../../shared/types'

/** Display name per widget. */
export const widgetLabels: Record<WidgetId, string> = {
  heart: 'Heart Rate',
  sleep: 'Sleep',
  fatigue: 'Fatigue',
  cognitive: 'Cognitive Performance',
  status: 'General Health',
  abnormalities: 'Recent Changes',
  activity: 'Activity Progress',
  cabin: 'Cabin Snapshot',
}

/** Widgets that are always shown and cannot be removed in the settings. */
export const essential: WidgetId[] = ['heart', 'sleep', 'fatigue', 'cognitive']

/** Widgets (and their order) shown before the user customises the dashboard. */
export const defaultWidgets: WidgetId[] = [
  'sleep',
  'heart',
  'fatigue',
  'cognitive',
  'status',
  'abnormalities',
]
