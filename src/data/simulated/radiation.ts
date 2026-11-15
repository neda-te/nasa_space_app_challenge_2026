/**
 * Daily radiation dose series used by the radiation exposure chart.
 *
 * SIMULATED DATA – prototype values, not real crew measurements.
 * Replace this module with readings delivered by the ingestion gateway
 * (`src/ingestion`) once a real data source is connected. See docs/simulated-data.md.
 */

/** Daily radiation dose in mSv for the last 30 days (oldest first). */
export const simulatedRadiationExposure = [
  0.18, 0.2, 0.17, 0.19, 0.21, 0.18, 0.2, 0.19, 0.22, 0.2, 0.18, 0.21, 0.46, 0.24, 0.2, 0.19, 0.21,
  0.2, 0.18, 0.22, 0.21, 0.19, 0.2, 0.18, 0.21, 0.23, 0.41, 0.24, 0.2, 0.19,
]
