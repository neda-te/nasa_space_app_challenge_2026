/**
 * Small chart series used by the home-dashboard widgets and the environment cards.
 *
 * SIMULATED DATA – prototype values, not real crew measurements.
 * Replace this module with readings delivered by the ingestion gateway
 * (`src/ingestion`) once a real data source is connected. See docs/simulated-data.md.
 *
 * The sparkline series are already scaled to chart units (0-30, see `Sparkline`);
 * they are shapes for the mini charts, not physical measurements.
 */

/** Heart-rate widget: recent resting heart rate trend (chart units). */
export const heartRateSparkline = [14, 16, 13, 18, 11, 16, 14, 17, 13, 15]

/** Sleep widget: sleep quality of the last seven nights in percent (bar height). */
export const sleepQualityWeekBars = [62, 76, 70, 82, 74, 49, 59]

/** Cognitive-performance widget: reaction-time trend (chart units, rising = slower). */
export const reactionTimeSparkline = [12, 13, 15, 14, 18, 20, 21]

/** Environment cards: placeholder trend shown in every expanded card (chart units). */
export const environmentDetailSparkline = [16, 14, 15, 13, 17, 16, 14, 15]
