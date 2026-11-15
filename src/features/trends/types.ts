/**
 * Types of the Trends & Analysis feature.
 */

/** Selectable time range of the trend charts. */
export type TrendRange = '24 Hours' | '7 Days' | '30 Days'

/** Metric that has a trend chart. */
export type TrendMetric = 'sleep' | 'heart' | 'fatigue' | 'reaction' | 'activity'
