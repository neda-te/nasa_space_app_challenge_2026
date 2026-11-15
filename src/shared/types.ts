/**
 * Shared domain and UI types used across several features.
 *
 * Feature-specific types live next to the feature that owns them
 * (e.g. `features/trends/types.ts`).
 */

/** Health status of a value or category. */
export type Status = 'Normal' | 'Monitor' | 'Attention'

/** Identifier of every page the app shell can display. */
export type Page =
  | 'Dashboard'
  | 'Physical'
  | 'Blood'
  | 'Urine'
  | 'Environment'
  | 'Trends'
  | 'Sources'
  | 'Customize'
  | 'EmergencyData'
  | 'Breathing'
  | 'Journal'

/** Identifier of a home-dashboard widget. */
export type WidgetId =
  | 'heart'
  | 'sleep'
  | 'fatigue'
  | 'cognitive'
  | 'status'
  | 'abnormalities'
  | 'activity'
  | 'cabin'

/** Rendering style of the small widget charts. */
export type ChartStyle = 'Line' | 'Bars' | 'Area'

/** Size preset of the home-dashboard widgets. */
export type WidgetSize = 'Compact' | 'Medium' | 'Wide'
