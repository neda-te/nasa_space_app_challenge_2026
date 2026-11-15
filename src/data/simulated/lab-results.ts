/**
 * Blood and urine laboratory results shown on the Tests & Lab Data pages.
 *
 * SIMULATED DATA – prototype values, not real crew measurements.
 * Replace this module with readings delivered by the ingestion gateway
 * (`src/ingestion`) once a real data source is connected. See docs/simulated-data.md.
 */

/** One laboratory result row. */
type LabRow = {
  category: string
  name: string
  value: string
  date: string
  reference: string
  previous: string
  source: string
  trend: number[]
  missing?: boolean
}

/** Blood test results. */
export const bloodRows: LabRow[] = [
  {
    category: 'Blood chemistry',
    name: 'Hemoglobin',
    value: '14.1 g/dL',
    date: 'Sol 180 · 06:30',
    reference: 'Reference not supplied',
    previous: '14.3 g/dL',
    source: 'Onboard analyzer · simulated',
    trend: [18, 17, 19, 16, 15],
  },
  {
    category: 'Immune biomarker',
    name: 'White blood cells',
    value: '5.8 ×10⁹/L',
    date: 'Sol 180 · 06:30',
    reference: 'Crew medical protocol',
    previous: '5.6 ×10⁹/L',
    source: 'Onboard analyzer · simulated',
    trend: [13, 16, 15, 17, 16],
  },
  {
    category: 'Immune biomarker',
    name: 'C-reactive protein',
    value: '1.2 mg/L',
    date: 'Sol 180 · 06:30',
    reference: 'Reference not supplied',
    previous: '1.0 mg/L',
    source: 'Research assay · simulated',
    trend: [19, 18, 17, 15, 13],
  },
  {
    category: 'Nutritional biomarker',
    name: '25-OH Vitamin D',
    value: '28 ng/mL',
    date: 'Sol 180 · 06:30',
    reference: 'Review with crew medical',
    previous: '30 ng/mL',
    source: 'Research assay · simulated',
    trend: [12, 14, 16, 19, 21],
  },
  {
    category: 'Glucose',
    name: 'Fasting glucose',
    value: '92 mg/dL',
    date: 'Sol 180 · 06:30',
    reference: 'Reference not supplied',
    previous: '89 mg/dL',
    source: 'Onboard analyzer · simulated',
    trend: [18, 14, 17, 13, 16],
  },
  {
    category: 'Cardiovascular biomarker',
    name: 'Apolipoprotein B',
    value: '—',
    date: 'No current sample',
    reference: 'Not available',
    previous: '82 mg/dL · preflight',
    source: 'OSDR protocol record',
    trend: [],
    missing: true,
  },
  {
    category: 'Bone metabolism',
    name: 'P1NP',
    value: '38 µg/L',
    date: 'Sol 180 · 06:30',
    reference: 'Protocol-specific review',
    previous: '40 µg/L',
    source: 'Research assay · simulated',
    trend: [13, 14, 16, 17, 18],
  },
]

/** Urine test results. */
export const urineRows: LabRow[] = [
  {
    category: 'Hydration indicator',
    name: 'Urine color index',
    value: '3 / 8',
    date: 'Sol 183 · 07:10',
    reference: 'Crew hydration protocol',
    previous: '2 / 8',
    source: 'Crew observation · simulated',
    trend: [18, 17, 13, 15, 11],
  },
  {
    category: 'Hydration indicator',
    name: 'Specific gravity',
    value: '1.024',
    date: 'Sol 183 · 07:10',
    reference: 'Reference not supplied',
    previous: '1.019',
    source: 'Onboard refractometer · simulated',
    trend: [18, 16, 14, 13, 10],
  },
  {
    category: 'Urine chemistry',
    name: 'pH',
    value: '6.2',
    date: 'Sol 183 · 07:10',
    reference: 'Reference not supplied',
    previous: '6.4',
    source: 'Onboard strip analyzer · simulated',
    trend: [15, 14, 17, 16, 18],
  },
  {
    category: 'Urine chemistry',
    name: 'Protein',
    value: 'Trace',
    date: 'Sol 183 · 07:10',
    reference: 'Crew medical review',
    previous: 'Not detected',
    source: 'Onboard strip analyzer · simulated',
    trend: [18, 18, 18, 15, 13],
  },
  {
    category: 'Renal marker',
    name: 'Creatinine',
    value: '118 mg/dL',
    date: 'Sol 183 · 07:10',
    reference: 'Reference not supplied',
    previous: '112 mg/dL',
    source: 'Research assay · simulated',
    trend: [18, 17, 16, 13, 14],
  },
  {
    category: 'Microbial finding',
    name: 'Culture screen',
    value: 'No growth reported',
    date: 'Sol 170 · 09:20',
    reference: 'Research protocol',
    previous: 'No growth reported',
    source: 'Periodic culture · simulated',
    trend: [],
  },
  {
    category: 'Exposure biomarker',
    name: '8-OHdG',
    value: '—',
    date: 'Analysis pending',
    reference: 'Research use only',
    previous: '4.8 ng/mg · Sol 150',
    source: 'NASA OSDR protocol',
    trend: [],
    missing: true,
  },
]
