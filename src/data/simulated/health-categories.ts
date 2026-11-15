/**
 * Physical-health categories shown on the Physical Health page.
 *
 * SIMULATED DATA – prototype values, not real crew measurements.
 * Replace this module with readings delivered by the ingestion gateway
 * (`src/ingestion`) once a real data source is connected. See docs/simulated-data.md.
 */

import type { Status } from '../../shared/types'

/** One entry per physical-health category (summary value, status and detail fields). */
export const healthCategories = [
  {
    title: 'Cardiovascular Health',
    value: '62 bpm',
    detail: 'Resting heart rate · baseline 60 bpm',
    status: 'Normal' as Status,
    type: 'Continuous sensor',
    time: 'Updated 38 sec ago',
    fields: [
      ['Blood pressure', '118 / 76 mmHg'],
      ['ECG', 'Last recording: Sol 182'],
      ['7-day trend', '+1.8%'],
      ['Personal baseline', '+2 bpm'],
    ],
  },
  {
    title: 'Venous Circulation',
    value: 'No significant finding',
    detail: 'Periodic ultrasound assessment',
    status: 'Normal' as Status,
    type: 'Periodic examination',
    time: 'Examined Sol 176',
    fields: [
      ['Jugular flow', 'Assessment complete'],
      ['Ultrasound', 'Crew medical review filed'],
      ['Finding', 'No change noted'],
      ['Next exam', 'Sol 206'],
    ],
  },
  {
    title: 'Sleep and Activity',
    value: '5h 42m',
    detail: 'Sleep quality 68 / 100',
    status: 'Attention' as Status,
    type: 'Wearable + questionnaire',
    time: 'Updated 06:12',
    fields: [
      ['Sleep / wake', '22:48 – 04:30'],
      ['Activity', '8,240 steps'],
      ['Light exposure', '7.2 h'],
      ['Circadian trend', '32 min phase delay'],
    ],
  },
  {
    title: 'Cognitive Performance',
    value: '284 ms',
    detail: 'Reaction time +18% from baseline',
    status: 'Monitor' as Status,
    type: 'Periodic test',
    time: 'Tested 07:40',
    fields: [
      ['Attention', '92 / 100'],
      ['Memory', '88 / 100'],
      ['Composite score', '89 / 100'],
      ['Previous', '271 ms'],
    ],
  },
  {
    title: 'Psychological & Behavioral Health',
    value: 'Well-being 7.8 / 10',
    detail: 'Private · role-based access',
    status: 'Normal' as Status,
    type: 'Self-reported',
    time: 'Check-in 08:05',
    fields: [
      ['Stress', 'Low'],
      ['Sleep concern', 'Reported'],
      ['Mood check-in', 'Stable'],
      ['Personal journal', 'Private — crew member only'],
    ],
  },
  {
    title: 'Nutrition & Metabolism',
    value: '2,310 kcal',
    detail: 'Protein target 91%',
    status: 'Monitor' as Status,
    type: 'Food record + laboratory',
    time: 'Updated Sol 183',
    fields: [
      ['Nutritional intake', '91% plan'],
      ['Food record', 'Complete'],
      ['Biomarkers', 'Latest panel Sol 180'],
      ['Chemistry', 'See laboratory results'],
    ],
  },
  {
    title: 'Immune Function',
    value: 'Latest panel reviewed',
    detail: 'No continuous measurement',
    status: 'Normal' as Status,
    type: 'Periodic laboratory',
    time: 'Sample Sol 180',
    fields: [
      ['Blood markers', '4 results available'],
      ['Saliva sample', 'Not collected'],
      ['Change over time', 'Stable across 3 samples'],
      ['Source', 'Onboard analyzer'],
    ],
  },
  {
    title: 'Microbiome',
    value: '3 sample sites',
    detail: 'No illness interpretation applied',
    status: 'Normal' as Status,
    type: 'Research sample',
    time: 'Collected Sol 165',
    fields: [
      ['Gut sample', 'Sequencing complete'],
      ['Oral sample', 'Processing'],
      ['Skin sample', 'Archived'],
      ['Interpretation', 'Research record only'],
    ],
  },
  {
    title: 'Muscle Strength & Performance',
    value: 'Grip 42.8 kg',
    detail: '−3.2% from preflight baseline',
    status: 'Monitor' as Status,
    type: 'Performance assessment',
    time: 'Tested Sol 181',
    fields: [
      ['Strength', '42.8 kg grip'],
      ['Exercise output', '94% target'],
      ['Capability score', '91 / 100'],
      ['30-day trend', '−1.4%'],
    ],
  },
  {
    title: 'Balance & Sensorimotor',
    value: '94 / 100',
    detail: 'Postural control stable',
    status: 'Normal' as Status,
    type: 'Periodic assessment',
    time: 'Tested Sol 178',
    fields: [
      ['Balance', '94 / 100'],
      ['Coordination', '96 / 100'],
      ['Vestibular', 'No change reported'],
      ['Previous score', '93 / 100'],
    ],
  },
  {
    title: 'Eye Health & Vision',
    value: '20 / 20',
    detail: 'Periodic ophthalmology exam',
    status: 'Normal' as Status,
    type: 'Periodic examination',
    time: 'Examined Sol 160',
    fields: [
      ['Visual acuity', '20 / 20'],
      ['Retinal imaging', 'Image set available'],
      ['Optic disc', 'Crew medical review filed'],
      ['Next exam', 'Sol 220'],
    ],
  },
  {
    title: 'Bone Health',
    value: 'BMD result available',
    detail: 'Not continuously measured onboard',
    status: 'Normal' as Status,
    type: 'Periodic imaging + laboratory',
    time: 'Examined preflight + Sol 150',
    fields: [
      ['Bone density', 'Historical result'],
      ['P1NP', '38 µg/L'],
      ['Historical change', 'Study view available'],
      ['Source', 'Research protocol'],
    ],
  },
]
