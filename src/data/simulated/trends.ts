/**
 * Time series behind the Trends & Analysis page (24 h / 7 d / 30 d per metric).
 *
 * SIMULATED DATA – prototype values, not real crew measurements.
 * Replace this module with readings delivered by the ingestion gateway
 * (`src/ingestion`) once a real data source is connected. See docs/simulated-data.md.
 */

import type { TrendMetric, TrendRange } from '../../features/trends/types'

/** Trend series and display metadata per metric. */
export const trendMetricData: Record<
  TrendMetric,
  {
    title: string
    value: string
    unit: string
    baseline: number
    baselineLabel: string
    tone: 'teal' | 'blue' | 'orange'
    source: string
    series: Record<TrendRange, number[]>
  }
> = {
  sleep: {
    title: 'Sleep duration & cycle',
    value: '5h 42m',
    unit: 'hours',
    baseline: 7,
    baselineLabel: 'Personal baseline · 7.0 h',
    tone: 'teal',
    source: 'Wearable actigraphy · simulated',
    series: {
      '24 Hours': [0, 0, 0, 0, 1.4, 4.2, 5.7, 5.7],
      '7 Days': [6.8, 7.3, 7.0, 7.6, 7.2, 5.7, 6.1, 5.7],
      '30 Days': [7.1, 6.9, 7.3, 6.8, 7.0, 6.6, 6.4, 5.7],
    },
  },
  heart: {
    title: 'Heart rate',
    value: '62 bpm',
    unit: 'bpm',
    baseline: 60,
    baselineLabel: 'Personal baseline · 60 bpm',
    tone: 'blue',
    source: 'Continuous wearable sensor · simulated',
    series: {
      '24 Hours': [58, 57, 59, 61, 66, 72, 64, 62],
      '7 Days': [60, 61, 59, 63, 62, 60, 61, 62],
      '30 Days': [59, 60, 61, 60, 62, 61, 63, 62],
    },
  },
  fatigue: {
    title: 'Subjective fatigue',
    value: '5.8 / 10',
    unit: 'score',
    baseline: 4.2,
    baselineLabel: '7-day baseline · 4.2',
    tone: 'orange',
    source: 'Daily self-report · simulated history',
    series: {
      '24 Hours': [3.2, 3.4, 3.7, 4.1, 4.8, 5.1, 5.5, 5.8],
      '7 Days': [3.9, 4.2, 4.0, 4.6, 4.8, 5.2, 5.4, 5.8],
      '30 Days': [3.8, 4.1, 4.0, 4.3, 4.5, 4.8, 5.2, 5.8],
    },
  },
  reaction: {
    title: 'Reaction time & cognitive performance',
    value: '284 ms',
    unit: 'ms',
    baseline: 241,
    baselineLabel: 'Personal baseline · 241 ms',
    tone: 'orange',
    source: 'Periodic cognitive test · simulated',
    series: {
      '24 Hours': [252, 256, 261, 267, 270, 276, 281, 284],
      '7 Days': [243, 246, 251, 258, 264, 271, 279, 284],
      '30 Days': [239, 241, 244, 250, 258, 265, 275, 284],
    },
  },
  activity: {
    title: 'Physical activity',
    value: '8,240 steps',
    unit: 'steps',
    baseline: 7800,
    baselineLabel: 'Daily target · 7,800 steps',
    tone: 'teal',
    source: 'Wearable activity sensor · simulated',
    series: {
      '24 Hours': [0, 420, 1160, 2460, 3980, 5740, 7120, 8240],
      '7 Days': [7600, 8120, 7840, 9030, 8210, 7420, 7960, 8240],
      '30 Days': [7450, 7910, 8060, 7680, 8340, 8020, 7790, 8240],
    },
  },
}
