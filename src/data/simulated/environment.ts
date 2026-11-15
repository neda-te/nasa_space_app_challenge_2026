/**
 * Habitat / cabin environment readings shown on the Environmental Monitoring page.
 *
 * SIMULATED DATA – prototype values, not real crew measurements.
 * Replace this module with readings delivered by the ingestion gateway
 * (`src/ingestion`) once a real data source is connected. See docs/simulated-data.md.
 */

import type { Status } from '../../shared/types'

/** Cabin / habitat environment readings. */
export const environmental = [
  {
    name: 'Carbon Dioxide',
    value: '2.1 mmHg',
    status: 'Normal' as Status,
    type: 'Continuous sensor',
    details: [
      ['Exposure', '2.0–2.3 mmHg · 8 h'],
      ['Location', 'Habitat module'],
      ['Source', 'Environmental Data App · simulated'],
    ],
  },
  {
    name: 'Oxygen & Cabin Pressure',
    value: '21.0% · 14.7 psi',
    status: 'Normal' as Status,
    type: 'Continuous sensor',
    details: [
      ['O₂ partial pressure', '3.09 psi'],
      ['Pressure change', '+0.01 psi / 24 h'],
      ['Location', 'Habitat module'],
    ],
  },
  {
    name: 'Temperature & Humidity',
    value: '22.4°C · 42%',
    status: 'Normal' as Status,
    type: 'Continuous sensor',
    details: [
      ['Exposure duration', '8 h'],
      ['24 h range', '21.8–23.1°C'],
      ['Location', 'Crew quarters'],
    ],
  },
  {
    name: 'Airborne Chemicals',
    value: '4 trace gases',
    status: 'Normal' as Status,
    type: 'Periodic sample',
    details: [
      ['VOC composite', '0.18 index'],
      ['Sample period', 'Sol 183 · 24 h'],
      ['Source', 'Historical research method'],
    ],
  },
  {
    name: 'Radiation',
    value: '0.62 mSv/day',
    status: 'Monitor' as Status,
    type: 'Area + personal dosimetry',
    details: [
      ['Accumulated mission dose', '106.4 mSv'],
      ['Detector', 'Habitat dosimeter 02'],
      ['Personal dosimeter', '0.59 mSv/day'],
    ],
  },
  {
    name: 'Noise',
    value: '61 dBA',
    status: 'Normal' as Status,
    type: 'Continuous area sensor',
    details: [
      ['8 h average', '58 dBA'],
      ['Sleep bay', '47 dBA'],
      ['History', '7-day view available'],
    ],
  },
  {
    name: 'Drinking-Water Quality',
    value: 'Sample passed',
    status: 'Normal' as Status,
    type: 'Periodic laboratory',
    details: [
      ['Chemical panel', '12 results available'],
      ['Microbial indicator', 'No finding reported'],
      ['Sample', 'Sol 181 · galley outlet'],
    ],
  },
  {
    name: 'Environmental Microbes',
    value: '42 CFU/m³',
    status: 'Normal' as Status,
    type: 'Periodic research sample',
    details: [
      ['Cabin air', '42 CFU/m³'],
      ['Surface sample', 'Processing'],
      ['Water sample', 'No finding reported'],
    ],
  },
  {
    name: 'Lighting',
    value: '485 lux',
    status: 'Normal' as Status,
    type: 'Continuous sensor',
    details: [
      ['Schedule', '06:00–21:30'],
      ['Spectrum', 'Cool-enriched daytime'],
      ['Sleep relevance', 'Circadian context only'],
    ],
  },
]
