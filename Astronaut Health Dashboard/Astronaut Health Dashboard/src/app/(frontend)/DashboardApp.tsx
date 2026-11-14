'use client'

import { useEffect, useRef, useState, useTransition, type DragEvent, type ReactNode } from 'react'
import { submitDailyCheckIn, type CheckInSubmission } from './checkin-actions'
import {
  deleteJournalEntry,
  getPrivateDashboardData,
  loginAstronaut,
  logoutAstronaut,
  registerAstronaut,
  saveJournalEntry,
  setReminderCompleted,
  type JournalEntryView,
  type PrivateDashboardData,
  type ReminderCompletionView,
} from './dashboard-actions'

type Status = 'Normal' | 'Monitor' | 'Attention'
type Page =
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
type WidgetId =
  | 'heart'
  | 'sleep'
  | 'fatigue'
  | 'cognitive'
  | 'status'
  | 'abnormalities'
  | 'activity'
  | 'cabin'
type ChartStyle = 'Line' | 'Bars' | 'Area'
type WidgetSize = 'Compact' | 'Medium' | 'Wide'
type BreathingScene = 'ball' | 'forest' | 'waves' | 'galaxy'
type BreathingMode = 'Calm' | 'Focus' | 'Sleep' | 'Stress relief'
type ReadinessLevel = 'Normal' | 'Caution' | 'High caution'

export type EmergencySnapshotView = {
  id: string
  externalEventId: string
  astronautCode: string
  recordedAt: string
  eventType: string
  status: string
  bodyRegion: string
  summary: string
  sourceSystem: string
  vitals: {
    heartRate: number | null
    oxygenSaturation: number | null
    systolicPressure: number | null
    diastolicPressure: number | null
  } | null
}

const icons: Record<string, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
  ),
  environment: (
    <>
      <path d="M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M12 2v20M3 12h18M5.6 5.6c3.5 3.5 9.3 3.5 12.8 0M5.6 18.4c3.5-3.5 9.3-3.5 12.8 0" />
    </>
  ),
  lab: (
    <>
      <path d="M9 3h6M10 3v6l-5.3 9.2A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.7-2.8L14 9V3" />
      <path d="M7.5 16h9" />
    </>
  ),
  trend: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 16 4-5 4 3 5-7" />
    </>
  ),
  data: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
    </>
  ),
  journal: (
    <>
      <path d="M5 3h11a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3Z" />
      <path d="M8 3v18M11 8h5M11 12h5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  breath: (
    <>
      <path d="M4 9c2.5 0 2.5-3 5-3 1.7 0 2.5 1.1 2.5 2.2S10.7 10.5 9 10.5H3" />
      <path d="M5 15c2.5 0 2.5 3 5 3 1.7 0 2.5-1.1 2.5-2.2s-.8-2.3-2.5-2.3H3" />
      <path d="M14 8.5c1.5-1.7 3-2.5 4.4-1.5 1.4 1 1 3.5-1.4 3.5h-3M14 13.5h4c2.4 0 2.8 2.5 1.4 3.5-1.4 1-2.9.2-4.4-1.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  grip: (
    <>
      <circle cx="8" cy="7" r=".8" fill="currentColor" />
      <circle cx="16" cy="7" r=".8" fill="currentColor" />
      <circle cx="8" cy="12" r=".8" fill="currentColor" />
      <circle cx="16" cy="12" r=".8" fill="currentColor" />
      <circle cx="8" cy="17" r=".8" fill="currentColor" />
      <circle cx="16" cy="17" r=".8" fill="currentColor" />
    </>
  ),
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

const navItems: { label: string; icon: string; page: Page }[] = [
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

const healthCategories = [
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
const bloodRows: LabRow[] = [
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
const urineRows: LabRow[] = [
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

const environmental = [
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

const widgetLabels: Record<WidgetId, string> = {
  heart: 'Heart Rate',
  sleep: 'Sleep',
  fatigue: 'Fatigue',
  cognitive: 'Cognitive Performance',
  status: 'General Health',
  abnormalities: 'Recent Changes',
  activity: 'Activity Progress',
  cabin: 'Cabin Snapshot',
}
const essential: WidgetId[] = ['heart', 'sleep', 'fatigue', 'cognitive']
const defaultWidgets: WidgetId[] = [
  'sleep',
  'heart',
  'fatigue',
  'cognitive',
  'status',
  'abnormalities',
]

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  )
}

function SourceTag({
  children,
  kind = 'sensor',
}: {
  children: ReactNode
  kind?: 'sensor' | 'lab' | 'self' | 'research'
}) {
  return <span className={`source-tag source-${kind}`}>{children}</span>
}

function Sparkline({
  values,
  tone = 'teal',
  mode = 'Line',
}: {
  values: number[]
  tone?: 'teal' | 'orange' | 'blue'
  mode?: ChartStyle
}) {
  const points = values
    .map((value, index) => `${index * (94 / Math.max(values.length - 1, 1)) + 3},${30 - value}`)
    .join(' ')
  if (mode === 'Bars') {
    return (
      <div className={`spark-bars spark-${tone}`}>
        {values.map((value, index) => (
          <i style={{ height: `${Math.max(value * 2.7, 18)}%` }} key={index} />
        ))}
      </div>
    )
  }
  return (
    <svg
      className={`sparkline spark-${tone} ${mode === 'Area' ? 'area-spark' : ''}`}
      viewBox="0 0 100 34"
      preserveAspectRatio="none"
    >
      <path d="M3 29H97" />
      {mode === 'Area' && <polygon points={`${points} 97,30 3,30`} />}
      <polyline points={points} />
    </svg>
  )
}

function PageTitle({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

function HomeWidget({
  id,
  go,
  chart,
  fatigueScore,
  openPhysical,
}: {
  id: WidgetId
  go: (page: Page) => void
  chart: ChartStyle
  fatigueScore: number | null
  openPhysical: (category: string) => void
}) {
  const [reactionInfoOpen, setReactionInfoOpen] = useState(false)
  if (id === 'heart')
    return (
      <article
        className="primary-widget heart-widget secondary-metric clickable-widget"
        role="button"
        tabIndex={0}
        onClick={() => openPhysical('Cardiovascular Health')}
        onKeyDown={(event) => event.key === 'Enter' && openPhysical('Cardiovascular Health')}
      >
        <div className="widget-top">
          <div className="widget-icon">
            <Icon name="heart" />
          </div>
          <SourceTag>Secondary live metric</SourceTag>
        </div>
        <p>HEART RATE</p>
        <div className="big-metric">
          62 <small>bpm</small>
        </div>
        <div className="compare-row">
          <span>
            Yesterday <b>60 bpm</b>
          </span>
          <span>
            Baseline <b>+2 bpm</b>
          </span>
        </div>
        <Sparkline values={[14, 16, 13, 18, 11, 16, 14, 17, 13, 15]} mode={chart} />
        <button className="card-link" onClick={() => openPhysical('Cardiovascular Health')}>
          View cardiovascular details <Icon name="arrow" size={14} />
        </button>
      </article>
    )
  if (id === 'sleep')
    return (
      <article
        className="primary-widget sleep-widget featured-metric clickable-widget"
        role="button"
        tabIndex={0}
        onClick={() => openPhysical('Sleep and Activity')}
        onKeyDown={(event) => event.key === 'Enter' && openPhysical('Sleep and Activity')}
      >
        <div className="widget-top">
          <div className="widget-icon">
            <span className="moon">◐</span>
          </div>
          <SourceTag>Wearable</SourceTag>
        </div>
        <p>SLEEP CYCLE</p>
        <div className="big-metric">5h 42m</div>
        <div className="sleep-facts">
          <span>
            Quality <b>68%</b>
          </span>
          <span>
            Cycle <b>22:48–04:30</b>
          </span>
        </div>
        <div className="week-bars">
          {[62, 76, 70, 82, 74, 49, 59].map((h, i) => (
            <span key={i}>
              <i style={{ height: `${h}%` }} className={i === 5 ? 'low' : ''} />
              <small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</small>
            </span>
          ))}
        </div>
      </article>
    )
  if (id === 'fatigue') {
    const score = fatigueScore ?? 5.8
    const level = score <= 3 ? 'Low' : score <= 6 ? 'Moderate' : 'High'
    const status: Status = score <= 3 ? 'Normal' : score <= 6 ? 'Monitor' : 'Attention'
    return (
      <article
        className="primary-widget reaction-widget clickable-widget"
        role="button"
        tabIndex={0}
        onClick={() => openPhysical('Psychological & Behavioral Health')}
        onKeyDown={(event) =>
          event.key === 'Enter' && openPhysical('Psychological & Behavioral Health')
        }
      >
        <div className="widget-top">
          <div className="widget-icon orange">
            <Icon name="trend" />
          </div>
          <SourceTag kind="self">Self-reported</SourceTag>
        </div>
        <p>FATIGUE CHECK-IN</p>
        <div className="big-metric">
          {score} <small>/ 10</small>
        </div>
        <div className="metric-caption">
          <StatusBadge status={status} />
          {level} subjective fatigue
        </div>
        <div className="gauge">
          <i style={{ width: `${score * 10}%` }} />
        </div>
        <span className="last-update">
          {fatigueScore === null
            ? 'Simulated previous check-in · 08:05'
            : 'New check-in saved this session'}
        </span>
      </article>
    )
  }
  if (id === 'cognitive')
    return (
      <article
        className="primary-widget clickable-widget"
        role="button"
        tabIndex={0}
        onClick={() => openPhysical('Cognitive Performance')}
        onKeyDown={(event) => event.key === 'Enter' && openPhysical('Cognitive Performance')}
      >
        <div className="widget-top">
          <div className="widget-icon blue">
            <Icon name="trend" />
          </div>
          <SourceTag kind="lab">Periodic test</SourceTag>
        </div>
        <div className="reaction-title-row">
          <p>REACTION TIME TREND</p>
          <button
            className={`reaction-info ${reactionInfoOpen ? 'open' : ''}`}
            aria-label="What is reaction time?"
            aria-expanded={reactionInfoOpen}
            onClick={(event) => {
              event.stopPropagation()
              setReactionInfoOpen(!reactionInfoOpen)
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            i
            <span className="reaction-tooltip" onClick={(event) => event.stopPropagation()}>
              <strong>What is Reaction Time?</strong>
              <p>
                Reaction time measures how quickly you respond to a visual stimulus during a
                cognitive performance test.
              </p>
              <ul>
                <li>Measured in milliseconds (ms).</li>
                <li>Lower values generally indicate faster responses.</li>
                <li>Higher values indicate slower responses.</li>
                <li>
                  Changes may accompany fatigue, sleep loss, or reduced alertness, but do not
                  establish a diagnosis.
                </li>
              </ul>
              <div className="reaction-detail-grid">
                <span>
                  Current <b>284 ms</b>
                </span>
                <span>
                  Previous <b>271 ms</b>
                </span>
                <span>
                  Baseline <b>241 ms</b>
                </span>
                <span>
                  Change <b>18% slower</b>
                </span>
              </div>
              <svg viewBox="0 0 250 48" preserveAspectRatio="none">
                <path d="M0 39H250" />
                <polyline points="2,34 42,30 84,29 126,24 168,19 208,11 248,8" />
              </svg>
              <small>Last test: Sol 184 · 07:40 · Simulated periodic test</small>
            </span>
          </button>
        </div>
        <div className="big-metric">
          284 <small>ms</small>
        </div>
        <div className="compare-row">
          <span>
            Attention <b>92 / 100</b>
          </span>
          <span>
            Previous <b>271 ms</b>
          </span>
        </div>
        <Sparkline values={[12, 13, 15, 14, 18, 20, 21]} tone="orange" mode={chart} />
        <span className="baseline-change">+18% reaction time vs. personal baseline</span>
      </article>
    )
  if (id === 'status')
    return (
      <article className="wide-widget health-status">
        <div className="status-orb">
          <span>GOOD</span>
        </div>
        <div>
          <span className="eyebrow">GENERAL HEALTH STATUS</span>
          <h3>Stable with two changes to monitor</h3>
          <p>
            Most tracked indicators are within your personal range. Sleep and reaction time have
            shifted from the 14-day baseline.
          </p>
        </div>
        <button onClick={() => go('Trends')}>
          Review trends <Icon name="arrow" size={14} />
        </button>
      </article>
    )
  if (id === 'abnormalities')
    return (
      <article className="wide-widget recent-changes">
        <div className="widget-section-title">
          <div>
            <span className="eyebrow">EXPLAINABLE NOTIFICATIONS</span>
            <h3>Recent changes</h3>
          </div>
          <span>2 items</span>
        </div>
        <div className="change-list">
          <div>
            <i className="orange-dot" />
            <p>
              <b>Sleep duration decreased</b>
              <span>1h 18m below your usual range · wearable data</span>
            </p>
          </div>
          <div>
            <i className="yellow-dot" />
            <p>
              <b>Reaction time increased</b>
              <span>18% above personal baseline · periodic test</span>
            </p>
          </div>
        </div>
        <p className="cause-note">
          These measurements occurred together; this does not establish medical causation.
        </p>
      </article>
    )
  if (id === 'activity')
    return (
      <article className="wide-widget optional-widget">
        <div>
          <span className="eyebrow">OPTIONAL WIDGET</span>
          <h3>Daily activity</h3>
          <p>8,240 steps · 46 active minutes · exercise target 94%</p>
        </div>
        <div className="ring">
          94<small>%</small>
        </div>
      </article>
    )
  return (
    <article className="wide-widget optional-widget">
      <div>
        <span className="eyebrow">OPTIONAL WIDGET</span>
        <h3>Cabin environment</h3>
        <p>22.4°C · 42% RH · CO₂ 2.1 mmHg</p>
      </div>
      <button onClick={() => go('Environment')}>
        Open environment <Icon name="arrow" size={14} />
      </button>
    </article>
  )
}

type MissionTask = {
  id: string
  title: string
  subtitle: string
  icon: string
  level: ReadinessLevel
  statusCopy: string
  metrics: [string, string, string][]
  concerns: string[]
  why: string
  actions: string[]
  sources: string
}

function getMissionTasks(dailyScore: number | null): MissionTask[] {
  const fatigue = dailyScore ?? 5.8
  const fatigueHigh = fatigue >= 7
  const fatigueModerate = fatigue >= 5

  return [
    {
      id: 'eva',
      title: 'EVA / Spacewalk',
      subtitle: 'External vehicle activity · 3h 40m planned',
      icon: 'environment',
      level: 'High caution',
      statusCopy: 'Elevated radiation exposure requires mission review.',
      metrics: [
        ['Accumulated dose', '+8% this week', 'Monitor'],
        ['Reaction time', '284 ms', '+18% slower'],
        ['Fatigue', `${fatigue} / 10`, fatigueHigh ? 'High' : 'Moderate'],
      ],
      concerns: [
        'Weekly radiation exposure is above the personal planning baseline.',
        'Slower reaction time may reduce response margin during complex EVA procedures.',
      ],
      why: 'EVA combines radiation exposure, time-critical decisions, and sustained physical demand. The indicators are shown together for planning and do not establish medical causation.',
      actions: [
        'Review current dose projection with flight medical and radiation teams.',
        'Consider a shorter EVA window or crew reassignment.',
        'Repeat the reaction-time test before suit-up.',
      ],
      sources: 'Dosimeter · periodic cognitive test · daily check-in',
    },
    {
      id: 'precision',
      title: 'Precision Maintenance',
      subtitle: 'Guidance assembly calibration · fine motor work',
      icon: 'settings',
      level: 'Caution',
      statusCopy: 'Sleep and reaction trends may affect precision.',
      metrics: [
        ['Sleep', '5h 42m', '−1h 18m'],
        ['Reaction time', '284 ms', '+18% slower'],
        ['Heart rate', '62 bpm', 'Normal'],
      ],
      concerns: [
        'Sleep duration is below the 14-day personal range.',
        'Reaction time is slower than baseline during today’s periodic test.',
      ],
      why: 'Fine motor calibration benefits from sustained attention and consistent response speed. Current values suggest additional verification is appropriate.',
      actions: [
        'Use a two-person verification checklist.',
        'Schedule the task after a recovery break if timing allows.',
        'Pause and reassess if attention feels reduced.',
      ],
      sources: 'Wearable · periodic cognitive test · continuous sensor',
    },
    {
      id: 'critical',
      title: 'Critical Operations',
      subtitle: 'Docking and contingency response readiness',
      icon: 'trend',
      level: fatigueHigh ? 'High caution' : 'Caution',
      statusCopy: fatigueHigh
        ? 'High fatigue adds risk to time-critical decisions.'
        : 'Slower response speed warrants additional safeguards.',
      metrics: [
        ['Reaction time', '284 ms', '+18% slower'],
        ['Attention', '92 / 100', 'In range'],
        ['Fatigue', `${fatigue} / 10`, fatigueHigh ? 'High' : 'Moderate'],
      ],
      concerns: [
        'Response speed is outside the current personal baseline.',
        fatigueHigh
          ? 'The latest check-in reports high subjective fatigue.'
          : 'Subjective fatigue should be monitored through the shift.',
      ],
      why: 'Critical operations depend on rapid response and reliable attention. A second qualified crew member provides additional operational margin.',
      actions: [
        'Assign a second operator for verification.',
        'Repeat readiness checks before the operation.',
        'Escalate any further decline to flight medical.',
      ],
      sources: 'Periodic cognitive test · daily check-in',
    },
    {
      id: 'physical',
      title: 'Physical Work',
      subtitle: 'Cargo transfer and resistance exercise',
      icon: 'heart',
      level: fatigueHigh ? 'High caution' : fatigueModerate ? 'Caution' : 'Normal',
      statusCopy: fatigueHigh
        ? 'Current fatigue supports reducing workload.'
        : fatigueModerate
          ? 'Current fatigue supports paced activity.'
          : 'Current indicators support planned activity.',
      metrics: [
        ['Fatigue', `${fatigue} / 10`, fatigueHigh ? 'High' : fatigueModerate ? 'Moderate' : 'Low'],
        ['Heart rate', '62 bpm', '+2 bpm'],
        ['Activity', '8,240 steps', '94% target'],
      ],
      concerns: fatigueModerate
        ? ['Reported fatigue may reduce endurance during sustained lifting.']
        : ['No task-specific concern is currently indicated.'],
      why: 'Workload guidance responds directly to the latest daily check-in while continuous cardiovascular data remains within range.',
      actions: fatigueModerate
        ? ['Use paced work intervals.', 'Hydrate and reassess after the first transfer block.']
        : ['Continue the planned workload and standard monitoring.'],
      sources: 'Daily check-in · continuous sensor · wearable',
    },
    {
      id: 'routine',
      title: 'Routine Tasks',
      subtitle: 'Inventory, documentation, and standard checks',
      icon: 'check',
      level: 'Normal',
      statusCopy: 'No task-specific limitation is indicated.',
      metrics: [
        ['Heart rate', '62 bpm', 'Normal'],
        ['Attention', '92 / 100', 'In range'],
        ['Cabin status', 'Nominal', 'Stable'],
      ],
      concerns: ['No significant task-specific concern is indicated by current measurements.'],
      why: 'Routine work has lower physical and cognitive demand than EVA, precision maintenance, or critical operations.',
      actions: ['Proceed as planned.', 'Continue standard self-monitoring and scheduled breaks.'],
      sources: 'Continuous sensor · periodic cognitive test · environmental telemetry',
    },
  ]
}

const dashboardReminders = [
  {
    key: 'daily-health',
    title: 'Daily health assessment',
    detail: 'Complete the private Daily Health Questionnaire.',
    dueOffset: 0,
    kind: 'Questionnaire',
    destination: 'checkin',
  },
  {
    key: 'blood-test',
    title: 'Scheduled blood test',
    detail: 'Periodic chemistry and immune panel.',
    dueOffset: 1,
    kind: 'Blood test',
    destination: 'Blood',
  },
  {
    key: 'urine-test',
    title: 'Scheduled urine test',
    detail: 'Hydration, renal, and chemistry sample.',
    dueOffset: 3,
    kind: 'Urine test',
    destination: 'Urine',
  },
  {
    key: 'ultrasound',
    title: 'Venous ultrasound assessment',
    detail: 'Periodic circulation examination follow-up.',
    dueOffset: -2,
    kind: 'Ultrasound',
    destination: 'Physical',
  },
] as const

function formatReminderDate(offset: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function DashboardReminders({
  completions,
  signedIn,
  onToggle,
  onStartCheckIn,
  go,
  openPhysical,
}: {
  completions: ReminderCompletionView[]
  signedIn: boolean
  onToggle: (key: string, completed: boolean) => void
  onStartCheckIn: () => void
  go: (page: Page) => void
  openPhysical: (category: string) => void
}) {
  const completionByKey = new Map(completions.map((item) => [item.reminderKey, item]))

  const openReminder = (destination: (typeof dashboardReminders)[number]['destination']) => {
    if (destination === 'checkin') onStartCheckIn()
    else if (destination === 'Physical') openPhysical('Venous Circulation')
    else go(destination)
  }

  return (
    <section className="dashboard-reminders" aria-labelledby="dashboard-reminders-title">
      <div className="reminder-heading">
        <div>
          <span className="eyebrow">SCHEDULE & FOLLOW-UP</span>
          <h3 id="dashboard-reminders-title">Health reminders</h3>
        </div>
        <span>{signedIn ? 'Completion sync active' : 'Sign in to sync completion'}</span>
      </div>
      <div className="reminder-grid">
        {dashboardReminders.map((reminder) => {
          const completion = completionByKey.get(reminder.key)
          const completed = completion?.completed === true
          const overdue = reminder.dueOffset < 0 && !completed
          return (
            <article
              className={`${completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
              key={reminder.key}
            >
              <button
                className="reminder-check"
                aria-label={`${completed ? 'Reopen' : 'Complete'} ${reminder.title}`}
                aria-pressed={completed}
                onClick={() => onToggle(reminder.key, !completed)}
              >
                {completed && <Icon name="check" size={13} />}
              </button>
              <div>
                <span>{reminder.kind}</span>
                <button
                  className="reminder-link"
                  onClick={() => openReminder(reminder.destination)}
                >
                  {reminder.title}
                </button>
                <p>{reminder.detail}</p>
              </div>
              <div className="reminder-due">
                <span>{completed ? 'COMPLETED' : overdue ? 'OVERDUE' : 'DUE'}</span>
                <b>
                  {completed && completion?.completedAt
                    ? new Date(completion.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : formatReminderDate(reminder.dueOffset)}
                </b>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function HealthSummary({
  dailyScore,
  go,
}: {
  dailyScore: number | null
  go: (page: Page) => void
}) {
  const fatigue = dailyScore ?? 5.8
  const highFatigue = fatigue >= 7
  const status = highFatigue ? 'Attention needed' : 'Monitor today'

  return (
    <section className="health-summary" aria-labelledby="health-summary-title">
      <div className="summary-status-block">
        <span className="summary-status-icon">
          <Icon name={highFatigue ? 'heart' : 'trend'} size={22} />
        </span>
        <div>
          <span className="eyebrow">TODAY&apos;S HEALTH SUMMARY</span>
          <h3 id="health-summary-title">{status}</h3>
          <p>
            {highFatigue
              ? 'Fatigue is high, with sleep and reaction time outside your personal range.'
              : 'Most indicators are stable. Sleep and reaction time need added attention.'}
          </p>
        </div>
      </div>
      <div className="summary-column">
        <span>RECENT TRENDS</span>
        <strong>Sleep lower · response slower</strong>
        <p>
          Sleep is 1h 18m below usual and reaction time is 18% slower. Radiation dose is 8% above
          the weekly planning baseline.
        </p>
      </div>
      <div className="summary-column recommendation">
        <span>RECOMMENDATION</span>
        <strong>{highFatigue ? 'Reduce high-demand work' : 'Add recovery and verification'}</strong>
        <p>
          {highFatigue
            ? 'Delay nonessential critical work, repeat readiness checks, and notify flight medical.'
            : 'Take a recovery break and use two-person verification for precision or critical work.'}
        </p>
        <button onClick={() => go('Trends')}>
          Review personal trends <Icon name="arrow" size={14} />
        </button>
      </div>
      <small className="summary-updated">
        Latest sources: telemetry 38 sec ago · cognitive test 07:40 · check-in{' '}
        {dailyScore === null ? '08:05' : 'updated this session'}
      </small>
    </section>
  )
}

function TaskStatus({ level }: { level: ReadinessLevel }) {
  return (
    <span className={`task-status task-status-${level.toLowerCase().replace(' ', '-')}`}>
      <i />
      {level}
    </span>
  )
}

function MissionTaskReadiness({ dailyScore }: { dailyScore: number | null }) {
  const tasks = getMissionTasks(dailyScore)
  const [selectedId, setSelectedId] = useState(tasks[0].id)
  const selected = tasks.find((task) => task.id === selectedId) ?? tasks[0]

  return (
    <section className="mission-readiness" aria-labelledby="mission-readiness-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">HEALTH-INFORMED PLANNING</span>
          <h3 id="mission-readiness-title">Mission Task Readiness</h3>
          <p>Operational guidance derived from current indicators and personal baselines.</p>
        </div>
        <span className="rules-badge">RULE-BASED · NON-DIAGNOSTIC</span>
      </div>
      <div className="task-layout">
        <div className="task-list" role="list">
          {tasks.map((task) => (
            <button
              className={selected.id === task.id ? 'active' : ''}
              onClick={() => setSelectedId(task.id)}
              key={task.id}
              type="button"
            >
              <span className="task-icon">
                <Icon name={task.icon} size={18} />
              </span>
              <span className="task-copy">
                <strong>{task.title}</strong>
                <small>{task.subtitle}</small>
              </span>
              <TaskStatus level={task.level} />
              <Icon name="chevron" size={16} />
            </button>
          ))}
        </div>
        <article className="task-detail" aria-live="polite">
          <div className="task-detail-head">
            <div>
              <span>SELECTED TASK</span>
              <h4>{selected.title}</h4>
            </div>
            <TaskStatus level={selected.level} />
          </div>
          <div
            className={`task-caution task-caution-${selected.level.toLowerCase().replace(' ', '-')}`}
          >
            <Icon name={selected.level === 'Normal' ? 'check' : 'trend'} size={18} />
            <strong>{selected.statusCopy}</strong>
          </div>
          <div className="task-metrics">
            {selected.metrics.map(([label, current, baseline]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{current}</strong>
                <small>{baseline}</small>
              </div>
            ))}
          </div>
          <div className="task-detail-grid">
            <div>
              <span>SPECIFIC CONCERNS</span>
              <ul>
                {selected.concerns.map((concern) => (
                  <li key={concern}>{concern}</li>
                ))}
              </ul>
            </div>
            <div>
              <span>RECOMMENDED ACTIONS</span>
              <ul>
                {selected.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="task-why">
            <span>WHY THIS GUIDANCE</span>
            <p>{selected.why}</p>
          </div>
          <p className="task-sources">
            <b>Data sources:</b> {selected.sources}
          </p>
        </article>
      </div>
    </section>
  )
}

function DashboardPage({
  go,
  widgets,
  chart,
  size,
  dailyScore,
  openPhysical,
  reminderCompletions,
  signedIn,
  onToggleReminder,
  onStartCheckIn,
}: {
  go: (page: Page) => void
  widgets: WidgetId[]
  chart: ChartStyle
  size: WidgetSize
  dailyScore: number | null
  openPhysical: (category: string) => void
  reminderCompletions: ReminderCompletionView[]
  signedIn: boolean
  onToggleReminder: (key: string, completed: boolean) => void
  onStartCheckIn: () => void
}) {
  return (
    <>
      <PageTitle
        kicker="MISSION DAY 184 · CREW MEMBER MC-01"
        title="Good morning, Maya"
        description="Your personal health overview for today. Essential indicators update from approved mission data sources."
        action={
          <div className="title-actions">
            <button className="secondary-button" onClick={() => go('Customize')}>
              <Icon name="edit" size={15} />
              Edit Dashboard
            </button>
          </div>
        }
      />
      <DashboardReminders
        completions={reminderCompletions}
        signedIn={signedIn}
        onToggle={onToggleReminder}
        onStartCheckIn={onStartCheckIn}
        go={go}
        openPhysical={openPhysical}
      />
      <HealthSummary dailyScore={dailyScore} go={go} />
      <div className="simulated-banner">
        <span>SIMULATED CREW DATA</span>
        <p>
          Prototype measurements are clearly separated by source type and are not intended for
          diagnosis.
        </p>
        <button onClick={() => go('Sources')}>View data transparency</button>
      </div>
      <div className={`home-grid widget-size-${size.toLowerCase()}`}>
        {widgets.map((id) => (
          <HomeWidget
            id={id}
            go={go}
            chart={chart}
            fatigueScore={dailyScore}
            openPhysical={openPhysical}
            key={id}
          />
        ))}
      </div>
      <MissionTaskReadiness dailyScore={dailyScore} />
      <button className="physical-quick" onClick={() => go('Physical')}>
        <div className="quick-icon">
          <Icon name="heart" size={21} />
        </div>
        <div>
          <span>QUICK ACCESS</span>
          <h3>Physical Health Monitoring</h3>
          <p>Review cardiovascular, sleep, performance, examination, and laboratory records.</p>
        </div>
        <Icon name="arrow" />
      </button>
    </>
  )
}

const simulatedRadiationExposure = [
  0.18, 0.2, 0.17, 0.19, 0.21, 0.18, 0.2, 0.19, 0.22, 0.2, 0.18, 0.21, 0.46, 0.24, 0.2, 0.19, 0.21,
  0.2, 0.18, 0.22, 0.21, 0.19, 0.2, 0.18, 0.21, 0.23, 0.41, 0.24, 0.2, 0.19,
]

function RadiationExposureChart() {
  const [range, setRange] = useState<7 | 30>(30)
  const [selectedIndex, setSelectedIndex] = useState(simulatedRadiationExposure.length - 1)
  const cumulative = simulatedRadiationExposure.reduce<number[]>((values, value, index) => {
    values.push(value + (values[index - 1] ?? 0))
    return values
  }, [])
  const start = simulatedRadiationExposure.length - range
  const daily = simulatedRadiationExposure.slice(start)
  const cumulativeVisible = cumulative.slice(start)
  const dates = daily.map((_, index) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - (daily.length - 1 - index))
    return date
  })
  const chartWidth = 760
  const chartHeight = 210
  const left = 46
  const right = 728
  const top = 20
  const bottom = 175
  const dailyMax = Math.max(...daily) * 1.2
  const cumulativeMin = Math.min(...cumulativeVisible)
  const cumulativeMax = Math.max(...cumulativeVisible)
  const x = (index: number) => left + (index / Math.max(1, daily.length - 1)) * (right - left)
  const yDaily = (value: number) => bottom - (value / dailyMax) * (bottom - top)
  const yCumulative = (value: number) =>
    bottom -
    ((value - cumulativeMin) / Math.max(0.01, cumulativeMax - cumulativeMin)) * (bottom - top)
  const cumulativePoints = cumulativeVisible
    .map((value, index) => `${x(index)},${yCumulative(value)}`)
    .join(' ')
  const localSelected = Math.max(0, selectedIndex - start)
  const selectedDate = dates[localSelected] ?? dates[dates.length - 1]
  const selectedDaily = daily[localSelected] ?? daily[daily.length - 1]
  const selectedCumulative =
    cumulativeVisible[localSelected] ?? cumulativeVisible[cumulativeVisible.length - 1]

  return (
    <section className="radiation-chart-card" aria-labelledby="radiation-chart-title">
      <div className="radiation-chart-head">
        <div>
          <span className="eyebrow">SIMULATED DOSIMETER MEASUREMENTS</span>
          <h3 id="radiation-chart-title">Radiation exposure</h3>
          <p>Daily exposure and accumulated mission dose. Values are prototype data in mSv.</p>
        </div>
        <div className="range-tabs" aria-label="Radiation chart range">
          {[7, 30].map((days) => (
            <button
              className={range === days ? 'active' : ''}
              onClick={() => {
                setRange(days as 7 | 30)
                setSelectedIndex(simulatedRadiationExposure.length - 1)
              }}
              key={days}
            >
              {days}-day
            </button>
          ))}
        </div>
      </div>
      <div className="radiation-legend">
        <span>
          <i className="daily" /> Daily exposure (mSv)
        </span>
        <span>
          <i className="cumulative" /> Cumulative dose (mSv)
        </span>
        <span>
          <i className="unusual" /> Unusual relative change
        </span>
      </div>
      <div className="radiation-chart-wrap">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={`${range}-day simulated radiation exposure chart`}
        >
          <path
            className="radiation-grid"
            d={`M${left} 20H${right}M${left} 72H${right}M${left} 124H${right}M${left} 175H${right}`}
          />
          {daily.map((value, index) => {
            const average =
              daily.slice(Math.max(0, index - 4), index).reduce((sum, item) => sum + item, 0) /
              Math.max(1, Math.min(4, index))
            const unusual = index > 0 && value > average * 1.65
            const barWidth = range === 7 ? 42 : 12
            return (
              <g key={`${dates[index].toISOString()}-${value}`}>
                <rect
                  className={unusual ? 'radiation-bar unusual' : 'radiation-bar'}
                  x={x(index) - barWidth / 2}
                  y={yDaily(value)}
                  width={barWidth}
                  height={bottom - yDaily(value)}
                  rx="3"
                />
                <circle
                  className="radiation-hit"
                  cx={x(index)}
                  cy={yDaily(value)}
                  r={range === 7 ? 10 : 7}
                  tabIndex={0}
                  onMouseEnter={() => setSelectedIndex(start + index)}
                  onFocus={() => setSelectedIndex(start + index)}
                  aria-label={`${dates[index].toLocaleDateString()}: ${value.toFixed(2)} mSv daily exposure`}
                />
              </g>
            )
          })}
          <polyline className="radiation-cumulative-line" points={cumulativePoints} />
          <circle
            className="radiation-selected-point"
            cx={x(localSelected)}
            cy={yCumulative(selectedCumulative)}
            r="4"
          />
          <text x="3" y="24">
            mSv/day
          </text>
          <text x="730" y="24">
            mSv
          </text>
          <text x={left} y="201">
            {dates[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
          <text x={right - 40} y="201">
            {dates[dates.length - 1]?.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </text>
        </svg>
        <div className="radiation-tooltip" aria-live="polite">
          <span>
            {selectedDate?.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <strong>{selectedDaily.toFixed(2)} mSv daily</strong>
          <b>{selectedCumulative.toFixed(2)} mSv cumulative</b>
        </div>
      </div>
      <p className="radiation-note">
        Orange markers identify changes that are unusual relative to this simulated recent pattern;
        they are not medical safety thresholds.
      </p>
    </section>
  )
}

function PhysicalTabs({ active, go }: { active: Page; go: (page: Page) => void }) {
  return (
    <div className="page-tabs">
      {[
        { label: 'Overview', page: 'Physical' as Page },
        { label: 'Blood Test', page: 'Blood' as Page },
        { label: 'Urine Test', page: 'Urine' as Page },
      ].map((tab) => (
        <button
          className={active === tab.page ? 'active' : ''}
          onClick={() => go(tab.page)}
          key={tab.page}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function PhysicalPage({ go, initialOpen }: { go: (page: Page) => void; initialOpen: string }) {
  const [open, setOpen] = useState(initialOpen)
  return (
    <>
      <PageTitle
        kicker="PHYSICAL HEALTH · MC-01"
        title="Physical Health Monitoring"
        description="Integrated physiological, performance, examination, and self-reported records."
        action={
          <div className="legend-row">
            <SourceTag>Continuous</SourceTag>
            <SourceTag kind="lab">Periodic</SourceTag>
            <SourceTag kind="self">Self-reported</SourceTag>
          </div>
        }
      />
      <PhysicalTabs active="Physical" go={go} />
      <RadiationExposureChart />
      <div className="privacy-note">
        <Icon name="lock" size={15} />
        <p>
          Private behavioral and journal information is restricted by role and permission. You are
          viewing the crew-member profile.
        </p>
      </div>
      <div className="category-grid">
        {healthCategories.map((item) => {
          const expanded = open === item.title
          return (
            <article className={`category-card ${expanded ? 'expanded' : ''}`} key={item.title}>
              <button
                className="category-summary"
                onClick={() => setOpen(expanded ? '' : item.title)}
              >
                <div>
                  <StatusBadge status={item.status} />
                  <h3>{item.title}</h3>
                  <strong>{item.value}</strong>
                  <p>{item.detail}</p>
                </div>
                <span className="expand-control">
                  <Icon name="chevron" size={17} />
                </span>
              </button>
              {expanded && (
                <div className="category-details">
                  <div className="detail-meta">
                    <SourceTag
                      kind={
                        item.type.includes('Self')
                          ? 'self'
                          : item.type.includes('laboratory') ||
                              item.type.includes('examination') ||
                              item.type.includes('assessment')
                            ? 'lab'
                            : item.type.includes('Research')
                              ? 'research'
                              : 'sensor'
                      }
                    >
                      {item.type}
                    </SourceTag>
                    <span>{item.time}</span>
                  </div>
                  <div className="detail-fields">
                    {item.fields.map(([label, value]) => (
                      <div key={label}>
                        <span>{label}</span>
                        <b>{value}</b>
                      </div>
                    ))}
                  </div>
                  <p className="clinical-note">
                    Informational monitoring only. Review interpretation with crew medical
                    personnel.
                  </p>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}

function LabPage({ type, go }: { type: 'Blood' | 'Urine'; go: (page: Page) => void }) {
  const rows = type === 'Blood' ? bloodRows : urineRows
  const [category, setCategory] = useState('All results')
  const categories = ['All results', ...Array.from(new Set(rows.map((row) => row.category)))]
  const visible =
    category === 'All results' ? rows : rows.filter((row) => row.category === category)
  return (
    <>
      <PageTitle
        kicker="PHYSICAL HEALTH · PERIODIC LABORATORY"
        title={`${type} Test Results`}
        description={`${type === 'Blood' ? 'Blood chemistry, immune, nutritional, glucose, cardiovascular, and bone metabolism results.' : 'Hydration, renal, chemistry, microbial, and exposure results from the latest available sample.'}`}
        action={
          <div className="sample-stamp">
            <span>LATEST SAMPLE</span>
            <b>{type === 'Blood' ? 'Sol 180 · 06:30' : 'Sol 183 · 07:10'}</b>
          </div>
        }
      />
      <PhysicalTabs active={type} go={go} />
      <div className="lab-banner">
        <div>
          <SourceTag kind="lab">Periodic laboratory</SourceTag>
          <b>Not continuously tracked</b>
        </div>
        <p>
          Reference information is shown only when provided by a mission protocol. No clinical
          reference ranges are inferred.
        </p>
      </div>
      <div className="filter-row">
        {categories.map((item) => (
          <button
            className={category === item ? 'active' : ''}
            onClick={() => setCategory(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="results-table">
        <div className="results-header">
          <span>Measurement</span>
          <span>Latest result</span>
          <span>Previous</span>
          <span>Reference information</span>
          <span>Historical trend</span>
          <span>Data source</span>
        </div>
        {visible.map((row) => (
          <div className={`result-row ${row.missing ? 'missing' : ''}`} key={row.name}>
            <div>
              <small>{row.category}</small>
              <b>{row.name}</b>
              <span>{row.date}</span>
            </div>
            <strong>
              {row.value}
              {row.missing && <em>Missing data</em>}
            </strong>
            <span>{row.previous}</span>
            <span>{row.reference}</span>
            <div>
              {row.trend.length ? (
                <Sparkline values={row.trend} tone={row.missing ? 'orange' : 'blue'} />
              ) : (
                <span className="no-trend">Not enough data</span>
              )}
            </div>
            <span>{row.source}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function EnvironmentPage() {
  const [open, setOpen] = useState('Radiation')
  return (
    <>
      <PageTitle
        kicker="HABITAT · ENVIRONMENTAL HEALTH"
        title="Environmental Monitoring"
        description="Cabin conditions, exposure context, periodic samples, and research measurements."
        action={
          <div className="live-chip">
            <i />8 systems nominal
          </div>
        }
      />
      <div className="research-caution">
        <Icon name="data" size={16} />
        <p>
          <b>Exposure context:</b> Area sensors and historical research measurements are not
          automatically assigned as a specific crew member's personal exposure.
        </p>
      </div>
      <div className="environment-grid">
        {environmental.map((item, index) => {
          const expanded = open === item.name
          return (
            <article className={`environment-card ${expanded ? 'expanded' : ''}`} key={item.name}>
              <button onClick={() => setOpen(expanded ? '' : item.name)}>
                <div className="environment-card-top">
                  <span className="env-number">0{index + 1}</span>
                  <StatusBadge status={item.status} />
                </div>
                <h3>{item.name}</h3>
                <strong>{item.value}</strong>
                <div className="env-type">
                  <SourceTag
                    kind={
                      item.type.includes('research')
                        ? 'research'
                        : item.type.includes('laboratory') || item.type.includes('sample')
                          ? 'lab'
                          : 'sensor'
                    }
                  >
                    {item.type}
                  </SourceTag>
                  <Icon name="chevron" size={15} />
                </div>
              </button>
              {expanded && (
                <div className="environment-detail">
                  <Sparkline
                    values={[16, 14, 15, 13, 17, 16, 14, 15]}
                    tone={item.status === 'Monitor' ? 'orange' : 'blue'}
                  />
                  {item.details.map(([label, value]) => (
                    <p key={label}>
                      <span>{label}</span>
                      <b>{value}</b>
                    </p>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}

type TrendRange = '24 Hours' | '7 Days' | '30 Days'
type TrendMetric = 'sleep' | 'heart' | 'fatigue' | 'reaction' | 'activity'

const trendMetricData: Record<
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

function DetailedTrendWidget({
  metric,
  range,
  expanded,
  onToggle,
}: {
  metric: TrendMetric
  range: TrendRange
  expanded: boolean
  onToggle: () => void
}) {
  const data = trendMetricData[metric]
  const values = data.series[range]
  const low = Math.min(...values, data.baseline)
  const high = Math.max(...values, data.baseline)
  const spread = Math.max(high - low, 1)
  const points = values
    .map((value, index) => {
      const x = 38 + index * (542 / Math.max(values.length - 1, 1))
      const y = 168 - ((value - low) / spread) * 118
      return `${x},${y}`
    })
    .join(' ')
  const baselineY = 168 - ((data.baseline - low) / spread) * 118
  const labels =
    range === '24 Hours'
      ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00', 'Now']
      : range === '7 Days'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today']
        : ['Day 1', '5', '10', '15', '20', '25', '29', 'Today']
  return (
    <article className={`metric-trend-widget ${expanded ? 'expanded' : ''}`}>
      <button className="trend-widget-summary" onClick={onToggle} aria-expanded={expanded}>
        <div className={`trend-widget-icon ${data.tone}`}>
          <Icon name={metric === 'heart' ? 'heart' : 'trend'} size={16} />
        </div>
        <div>
          <span>{data.title}</span>
          <strong>{data.value}</strong>
        </div>
        <p>{data.baselineLabel}</p>
        <SourceTag kind={metric === 'fatigue' ? 'self' : metric === 'reaction' ? 'lab' : 'sensor'}>
          Simulated
        </SourceTag>
        <span className="trend-expand">
          <Icon name="chevron" size={16} />
        </span>
      </button>
      {expanded && (
        <div className="trend-widget-detail">
          <div className="trend-chart-meta">
            <div>
              <span className="eyebrow">{range.toUpperCase()} TREND</span>
              <h3>{data.title}</h3>
            </div>
            <div className="chart-legend">
              <span>
                <i className={data.tone} />
                Measured
              </span>
              <span>
                <i className="baseline" />
                Personal baseline
              </span>
            </div>
          </div>
          <div className="metric-chart-wrap">
            <span className="metric-y-label top">
              {high.toLocaleString()} {data.unit}
            </span>
            <span className="metric-y-label bottom">
              {low.toLocaleString()} {data.unit}
            </span>
            <svg
              viewBox="0 0 620 190"
              preserveAspectRatio="none"
              aria-label={`${data.title} ${range} simulated trend`}
            >
              <path className="metric-grid" d="M38 50H580M38 89H580M38 128H580M38 168H580" />
              <line className="metric-baseline" x1="38" x2="580" y1={baselineY} y2={baselineY} />
              <polyline className={`metric-series ${data.tone}`} points={points} />
              {values.map((value, index) => {
                const x = 38 + index * (542 / Math.max(values.length - 1, 1))
                const y = 168 - ((value - low) / spread) * 118
                return (
                  <circle className={`metric-point ${data.tone}`} cx={x} cy={y} r="4" key={index}>
                    <title>{`${labels[Math.min(index, labels.length - 1)]}: ${value.toLocaleString()} ${data.unit}`}</title>
                  </circle>
                )
              })}
            </svg>
            <div className="metric-x-axis">
              {labels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
          <div className="trend-context-row">
            <span>{data.source}</span>
            {metric === 'sleep' && <span>Sleep window today · 22:48–04:30</span>}
            {metric === 'reaction' && (
              <span className="slower-label">Current result is 18% slower than baseline</span>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

function TrendsPage() {
  const [range, setRange] = useState<TrendRange>('7 Days')
  const [expandedTrend, setExpandedTrend] = useState<TrendMetric>('sleep')
  return (
    <>
      <PageTitle
        kicker="PERSONAL BASELINES · EXPLAINABLE ANALYSIS"
        title="Trends & Analysis"
        description="Compare current measurements with recent history and your rolling personal baseline."
        action={
          <div className="range-tabs">
            {(['24 Hours', '7 Days', '30 Days'] as TrendRange[]).map((item) => (
              <button
                className={range === item ? 'active' : ''}
                onClick={() => setRange(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        }
      />
      <div className="trend-summary">
        <div>
          <span>CURRENT VS. YESTERDAY</span>
          <b>
            Heart rate <i>+2 bpm</i>
          </b>
          <p>Within expected personal variation</p>
        </div>
        <div>
          <span>CURRENT VS. BASELINE</span>
          <b>
            Sleep <i className="warm">−1h 18m</i>
          </b>
          <p>Outside usual 14-day range</p>
        </div>
        <div>
          <span>COGNITIVE CHANGE</span>
          <b>
            Reaction <i className="warm">+18%</i>
          </b>
          <p>Two consecutive slower tests</p>
        </div>
      </div>
      <section className="trend-widget-section">
        <div className="trend-section-heading">
          <div>
            <span className="eyebrow">SIMULATED HISTORICAL DATA</span>
            <h3>Health & performance trends</h3>
          </div>
          <p>
            Select a metric to expand its detailed chart. Hover chart points for measured values.
          </p>
        </div>
        <div className="trend-widget-stack">
          {(['sleep', 'heart', 'fatigue', 'reaction', 'activity'] as TrendMetric[]).map(
            (metric) => (
              <DetailedTrendWidget
                metric={metric}
                range={range}
                expanded={expandedTrend === metric}
                onToggle={() => setExpandedTrend(expandedTrend === metric ? 'sleep' : metric)}
                key={metric}
              />
            ),
          )}
        </div>
      </section>
      <div className="analysis-grid">
        <article className="chart-panel large">
          <div className="chart-title">
            <div>
              <span className="eyebrow">HEALTH TREND</span>
              <h3>Sleep duration & reaction time</h3>
            </div>
            <div className="chart-legend">
              <span>
                <i className="teal" />
                Sleep
              </span>
              <span>
                <i className="orange" />
                Reaction time
              </span>
            </div>
          </div>
          <div className="line-chart">
            <span className="axis-label top">8h / 240ms</span>
            <span className="axis-label bottom">5h / 300ms</span>
            <svg viewBox="0 0 700 210" preserveAspectRatio="none">
              <g className="grid-lines">
                <path d="M0 25H700M0 75H700M0 125H700M0 175H700" />
              </g>
              <path
                className="area"
                d="M0 80L115 55L230 71L345 42L460 65L575 145L700 120L700 210H0Z"
              />
              <polyline
                className="sleep-line"
                points="0,80 115,55 230,71 345,42 460,65 575,145 700,120"
              />
              <polyline
                className="reaction-line"
                points="0,125 115,120 230,112 345,105 460,90 575,60 700,47"
              />
            </svg>
            <div className="x-axis">
              {['Sol 178', '179', '180', '181', '182', '183', 'Today'].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
          <div className="explain-box">
            <Icon name="trend" size={16} />
            <p>
              Lower sleep duration and slower reaction time appear in the same period.{' '}
              <b>This correlation does not establish a medical cause.</b>
            </p>
          </div>
        </article>
        <article className="chart-panel">
          <div className="chart-title">
            <div>
              <span className="eyebrow">ENVIRONMENTAL CONTEXT</span>
              <h3>CO₂ & sleep quality</h3>
            </div>
            <SourceTag kind="research">Correlation view</SourceTag>
          </div>
          <div className="correlation-score">
            <strong>r = 0.34</strong>
            <span>Weak association</span>
          </div>
          <div className="scatter">
            {[
              [12, 70],
              [25, 52],
              [38, 63],
              [48, 44],
              [60, 58],
              [70, 32],
              [82, 42],
              [90, 25],
            ].map(([x, y], i) => (
              <i key={i} style={{ left: `${x}%`, top: `${y}%` }} />
            ))}
          </div>
          <p className="chart-footnote">
            Area CO₂ sensor + wearable sleep quality · simulated data
          </p>
        </article>
      </div>
    </>
  )
}

function SourcesPage() {
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const sources = [
    [
      'NASA Environmental Data App',
      'Cabin environmental categories and measurement context',
      'Historical research + simulated',
      'Used to structure CO₂, pressure, temperature, humidity, air quality, and location context. Prototype values remain simulated.',
    ],
    [
      'NASA Open Science Data Repository',
      'Human spaceflight study protocols and research datasets',
      'Historical research',
      'Used for study-variable naming, collection-method context, and data provenance. No participant records are reproduced.',
    ],
    [
      'NASA Life Sciences Portal',
      'Human research study context and experiment metadata',
      'Historical research',
      'Used to organize periodic examination and human-research categories without inferring clinical conclusions.',
    ],
    [
      'Inspiration4 research datasets',
      'Civilian spaceflight health research structure',
      'Historical research',
      'Used as a reference for integrated wearable, laboratory, cognitive, and microbiome study organization.',
    ],
    [
      'NASA & JAXA human research',
      'Long-duration spaceflight monitoring categories',
      'Historical research',
      'Used to inform long-duration physiological and environmental monitoring categories across partner research.',
    ],
  ]
  return (
    <>
      <PageTitle
        kicker="DATA PROVENANCE"
        title="Sources & Transparency"
        description="Every interface measurement is labeled by acquisition type and prototype origin."
      />
      <div className="source-type-grid">
        <div>
          <SourceTag>Continuous sensor</SourceTag>
          <p>Automatically sampled cabin or wearable telemetry.</p>
        </div>
        <div>
          <SourceTag kind="lab">Periodic laboratory</SourceTag>
          <p>Discrete sample with collection and analysis time.</p>
        </div>
        <div>
          <SourceTag kind="self">Self-reported</SourceTag>
          <p>Crew check-ins and questionnaires with role controls.</p>
        </div>
        <div>
          <SourceTag kind="research">Historical research</SourceTag>
          <p>Study context; not current personal exposure.</p>
        </div>
      </div>
      <div className="source-list">
        {sources.map(([name, use, type, note]) => (
          <article className={activeSource === name ? 'expanded' : ''} key={name}>
            <div className="nasa-mark">NASA</div>
            <div>
              <h3>{name}</h3>
              <p>{use}</p>
            </div>
            <span>{type}</span>
            <button
              aria-expanded={activeSource === name}
              onClick={() => setActiveSource(activeSource === name ? null : name)}
            >
              Dataset notes <Icon name="chevron" size={14} />
            </button>
            {activeSource === name && (
              <div className="source-notes">
                <SourceTag kind="research">Research foundation</SourceTag>
                <p>{note}</p>
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="transparency-note">
        <h3>Prototype data policy</h3>
        <p>
          Actual astronaut measurements are not displayed. All crew values in this hackathon
          prototype are simulated and clearly labeled. Research-derived categories inform interface
          structure only; they do not provide diagnosis or individualized exposure conclusions.
        </p>
      </div>
    </>
  )
}

function AstronautBody({
  region,
  side,
  gender,
}: {
  region: string
  side: boolean
  gender: 'female' | 'male'
}) {
  const active = (part: string) =>
    region === part || region === 'whole-body' ? 'body-part active' : 'body-part'
  return (
    <div className={`astronaut-body natural-human ${gender} ${side ? 'side-view' : ''}`}>
      <div className="body-orbit orbit-one" />
      <div className="body-orbit orbit-two" />
      <svg
        viewBox="0 0 300 560"
        role="img"
        aria-label={`${gender} human anatomical model highlighting ${region}`}
      >
        <defs>
          <radialGradient id={`humanSkin-${gender}`} cx="38%" cy="28%" r="78%">
            <stop offset="0" stopColor="#f2f4f4" />
            <stop offset=".42" stopColor="#c5cbcd" />
            <stop offset=".76" stopColor="#858f93" />
            <stop offset="1" stopColor="#4b585e" />
          </radialGradient>
          <linearGradient id="limbShade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e7eaea" />
            <stop offset=".5" stopColor="#a7b0b3" />
            <stop offset="1" stopColor="#59666c" />
          </linearGradient>
          <linearGradient id="legShade" x1=".25" y1="0" x2=".8" y2="1">
            <stop offset="0" stopColor="#dfe3e4" />
            <stop offset=".56" stopColor="#929da1" />
            <stop offset="1" stopColor="#4a575d" />
          </linearGradient>
          <filter id="bodyDepth" x="-30%" y="-20%" width="160%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#02080b" floodOpacity=".48" />
          </filter>
          <filter id="regionGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ff9a68" floodOpacity=".8" />
          </filter>
        </defs>
        <g className="mannequin-model" filter="url(#bodyDepth)">
          <ellipse
            className={active('head')}
            cx="150"
            cy="55"
            rx={gender === 'female' ? 29 : 31}
            ry="43"
          />
          <ellipse className="human-ear" cx="118" cy="58" rx="5" ry="10" />
          <ellipse className="human-ear" cx="182" cy="58" rx="5" ry="10" />
          <path
            className="human-hair"
            d={
              gender === 'female'
                ? 'M120 48c-2-30 13-44 30-44 23 0 34 19 30 47l-8-23c-14 5-30 4-44-4Z'
                : 'M120 43c3-27 18-38 34-36 17 1 28 13 26 38-17-11-42-11-60-2Z'
            }
          />
          <path
            className="human-neck-shape"
            d="M132 91c1 17-4 24-17 31l35 25 35-25c-13-7-18-14-17-31Z"
          />
          {gender === 'female' ? (
            <>
              <path
                className={active('chest')}
                d="M112 112c-31 6-55 17-68 36 11 30 18 68 25 102 20 10 142 10 162 0 7-34 14-72 25-102-13-19-37-30-68-36-8 22-20 32-38 32s-30-10-38-32Z"
              />
              <path
                className={active('abdomen')}
                d="M69 238c20 9 45 13 81 13s61-4 81-13l-12 76c-19 20-47 30-69 30s-50-10-69-30Z"
              />
              <path
                className={active('left-arm')}
                d="M52 141c-16 8-23 24-29 45L7 285c-3 16-6 30-1 40 4 8 14 6 16-1 3 7 11 5 12-2 4 5 10 1 9-6l-6-23 39-101 4-43Z"
              />
              <path
                className={active('right-arm')}
                d="M248 141c16 8 23 24 29 45l16 99c3 16 6 30 1 40-4 8-14 6-16-1-3 7-11 5-12-2-4 5-10 1-9-6l6-23-39-101-4-43Z"
              />
              <path
                className={active('left-leg')}
                d="M84 307c13 17 35 26 62 27l-12 145-7 55c-9 17-31 12-36-2l-3-51-18-98Z"
              />
              <path
                className={active('right-leg')}
                d="M216 307c-13 17-35 26-62 27l12 145 7 55c9 17 31 12 36-2l3-51 18-98Z"
              />
            </>
          ) : (
            <>
              <path
                className={active('chest')}
                d="M112 108c-27 5-46 16-57 33 10 31 19 68 28 106 18 10 116 10 134 0 9-38 18-75 28-106-11-17-30-28-57-33-8 20-20 30-38 30s-30-10-38-30Z"
              />
              <path
                className={active('abdomen')}
                d="M83 239c18 9 39 13 67 13s49-4 67-13l-12 73c-14 18-35 26-55 26s-41-8-55-26Z"
              />
              <path
                className={active('left-arm')}
                d="M62 136c-15 10-21 27-27 49L18 279c-4 15-7 29-2 39 4 9 14 7 17-1 3 7 11 5 12-2 4 5 10 1 9-6l-6-23 39-96 3-44Z"
              />
              <path
                className={active('right-arm')}
                d="M238 136c15 10 21 27 27 49l17 94c4 15 7 29 2 39-4 9-14 7-17-1-3 7-11 5-12-2-4 5-10 1-9-6l6-23-39-96-3-44Z"
              />
              <path
                className={active('left-leg')}
                d="M96 306c13 17 29 24 50 25l-10 147-7 56c-9 17-31 12-36-3l-3-52-17-97Z"
              />
              <path
                className={active('right-leg')}
                d="M204 306c-13 17-29 24-50 25l10 147 7 56c9 17 31 12 36-3l3-52 17-97Z"
              />
            </>
          )}
          <path
            className="human-foot left"
            d="M89 526c6 11 30 15 39 2l7 10c4 8-1 15-10 16H90c-9-1-11-9-1-28Z"
          />
          <path
            className="human-foot right"
            d="M211 526c-6 11-30 15-39 2l-7 10c-4 8 1 15 10 16h35c9-1 11-9 1-28Z"
          />
          <path
            className="anatomy-detail face"
            d="M137 54c3 2 7 2 10 0m6 0c3 2 7 2 10 0m-16 8 3 6 3-1m-13 13c7 4 14 4 21 0"
          />
          <path className="anatomy-detail clavicle" d="M103 137c19 15 34 15 47 7 13 8 28 8 47-7" />
          <path
            className="anatomy-detail pectoral"
            d="M83 174c21-14 42-14 64-2m6 0c22-12 43-12 64 2"
          />
          <path className="anatomy-detail center" d="M150 146v164" />
          <path className="anatomy-detail knee" d="M91 420c13 7 26 7 39 0m40 0c13 7 26 7 39 0" />
          <circle className="anatomy-detail navel" cx="150" cy="282" r="2.5" />
        </g>
      </svg>
      <span className="body-axis">
        {gender.toUpperCase()} ANATOMICAL MODEL · {side ? 'LATERAL' : 'ANTERIOR'}
      </span>
    </div>
  )
}

function EmergencyDataPage({ snapshots }: { snapshots: EmergencySnapshotView[] }) {
  const [selectedId, setSelectedId] = useState(snapshots[0]?.id ?? '')
  const [side, setSide] = useState(false)
  const selected = snapshots.find((item) => item.id === selectedId) ?? snapshots[0]
  const selectedGender: 'female' | 'male' = selected?.astronautCode === 'ER-02' ? 'male' : 'female'
  return (
    <>
      <PageTitle
        kicker="SYSTEM · EXTERNAL EMERGENCY ARCHIVE"
        title="Emergency Data Records"
        description="Read-only, simulated snapshots received from the separate emergency handling system."
        action={<SourceTag kind="research">Payload saved records</SourceTag>}
      />
      <div className="emergency-scope-note">
        <Icon name="lock" size={15} />
        <p>
          This screen archives sanitized emergency telemetry for later health review. Emergency
          response and handling remain outside this dashboard.
        </p>
      </div>
      {selected ? (
        <div className="emergency-layout">
          <section className="body-viewer-panel">
            <div className="viewer-heading">
              <div>
                <span className="eyebrow">ANATOMICAL EVENT MAP</span>
                <h3>Astronaut body representation</h3>
              </div>
              <div className="view-toggle">
                <button className={!side ? 'active' : ''} onClick={() => setSide(false)}>
                  Front
                </button>
                <button className={side ? 'active' : ''} onClick={() => setSide(true)}>
                  Side
                </button>
              </div>
            </div>
            <AstronautBody region={selected.bodyRegion} side={side} gender={selectedGender} />
            <div className="body-region-label">
              <span>{selectedGender.toUpperCase()} HUMAN MODEL · ACTIVE RECORD REGION</span>
              <strong>{selected.bodyRegion.replace('-', ' ')}</strong>
            </div>
          </section>
          <section className="emergency-record-panel">
            <div className="record-detail-head">
              <div>
                <span>{selected.externalEventId}</span>
                <h3>{selected.eventType.replace('-', ' ')}</h3>
              </div>
              <StatusBadge status={selected.status === 'monitoring' ? 'Monitor' : 'Normal'} />
            </div>
            <p className="record-summary">{selected.summary}</p>
            <div className="record-metrics">
              <div>
                <span>Heart rate</span>
                <b>
                  {selected.vitals?.heartRate ?? '—'} <small>bpm</small>
                </b>
              </div>
              <div>
                <span>O₂ saturation</span>
                <b>
                  {selected.vitals?.oxygenSaturation ?? '—'} <small>%</small>
                </b>
              </div>
              <div>
                <span>Blood pressure</span>
                <b>
                  {selected.vitals?.systolicPressure ?? '—'} /{' '}
                  {selected.vitals?.diastolicPressure ?? '—'}
                </b>
              </div>
              <div>
                <span>Astronaut</span>
                <b>{selected.astronautCode}</b>
              </div>
            </div>
            <div className="record-provenance">
              <div>
                <span>RECORDED</span>
                <b>{new Date(selected.recordedAt).toLocaleString()}</b>
              </div>
              <div>
                <span>SOURCE SYSTEM</span>
                <b>{selected.sourceSystem}</b>
              </div>
              <div>
                <span>DATA CLASS</span>
                <b>Simulated · saved in Payload</b>
              </div>
            </div>
            <div className="record-list-heading">
              <span>RECENT SAVED SNAPSHOTS</span>
              <b>{snapshots.length} records</b>
            </div>
            <div className="emergency-record-list">
              {snapshots.map((item) => (
                <button
                  className={item.id === selected.id ? 'active' : ''}
                  onClick={() => setSelectedId(item.id)}
                  key={item.id}
                >
                  <i />
                  <div>
                    <b>{item.eventType.replace('-', ' ')}</b>
                    <span>
                      {item.externalEventId} · {item.bodyRegion.replace('-', ' ')}
                    </span>
                  </div>
                  <time>{new Date(item.recordedAt).toLocaleDateString()}</time>
                  <Icon name="chevron" size={14} />
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="empty-records">
          <Icon name="data" size={25} />
          <h3>No emergency snapshots saved</h3>
          <p>Imported records from the external emergency system will appear here.</p>
        </div>
      )}
    </>
  )
}

function CustomizePage({
  widgets,
  setWidgets,
  go,
  chart,
  setChart,
  size,
  setSize,
}: {
  widgets: WidgetId[]
  setWidgets: (items: WidgetId[]) => void
  go: (page: Page) => void
  chart: ChartStyle
  setChart: (value: ChartStyle) => void
  size: WidgetSize
  setSize: (value: WidgetSize) => void
}) {
  const [draft, setDraft] = useState(widgets)
  const [saved, setSaved] = useState(false)
  const [draftChart, setDraftChart] = useState<ChartStyle>(chart)
  const [draftSize, setDraftSize] = useState<WidgetSize>(size)
  const [dragged, setDragged] = useState<WidgetId | null>(null)
  const move = (from: WidgetId, to: WidgetId) => {
    const next = [...draft]
    const fromIndex = next.indexOf(from)
    const toIndex = next.indexOf(to)
    next.splice(fromIndex, 1)
    next.splice(toIndex, 0, from)
    setDraft(next)
  }
  const drop = (event: DragEvent, to: WidgetId) => {
    event.preventDefault()
    if (dragged && dragged !== to) move(dragged, to)
    setDragged(null)
  }
  const optional = ['status', 'abnormalities', 'activity', 'cabin'] as WidgetId[]
  const reset = () => {
    setDraft(defaultWidgets)
    setDraftChart('Line')
    setDraftSize('Medium')
  }
  return (
    <>
      <PageTitle
        kicker="PERSONAL WORKSPACE"
        title="Dashboard Customization"
        description="Arrange the home dashboard around your mission workflow. Essential health indicators remain visible."
        action={
          <div className="title-actions">
            <button className="secondary-button" onClick={reset}>
              Reset default
            </button>
            <button
              className="primary-button"
              onClick={() => {
                setWidgets(draft)
                setChart(draftChart)
                setSize(draftSize)
                setSaved(true)
                setTimeout(() => go('Dashboard'), 500)
              }}
            >
              {saved ? 'Layout saved' : 'Save layout'}
            </button>
          </div>
        }
      />
      <div className="customize-layout">
        <section className="custom-canvas">
          <div className="custom-toolbar">
            <div>
              <span className="live-dot" />
              Dashboard preview
            </div>
            <span>Drag to rearrange · select size where available</span>
          </div>
          <div className="custom-grid">
            {draft.map((id) => (
              <article
                draggable
                onDragStart={() => setDragged(id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => drop(e, id)}
                className={`custom-widget ${essential.includes(id) ? 'essential' : ''}`}
                key={id}
              >
                <span className="grip">
                  <Icon name="grip" size={17} />
                </span>
                <div>
                  <span>{essential.includes(id) ? 'ESSENTIAL' : 'OPTIONAL'}</span>
                  <h3>{widgetLabels[id]}</h3>
                  <p>
                    {id === 'sleep' || id === 'heart' || id === 'cognitive'
                      ? `${chart} chart · Medium`
                      : 'Compact summary'}
                  </p>
                </div>
                {essential.includes(id) ? (
                  <Icon name="lock" size={14} />
                ) : (
                  <button onClick={() => setDraft(draft.filter((item) => item !== id))}>
                    Remove
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
        <aside className="custom-controls">
          <section>
            <span className="eyebrow">ADD WIDGETS</span>
            <h3>Widget library</h3>
            {optional.map((id) => {
              const added = draft.includes(id)
              return (
                <button disabled={added} onClick={() => setDraft([...draft, id])} key={id}>
                  <div>
                    <b>{widgetLabels[id]}</b>
                    <span>{added ? 'Added to dashboard' : 'Optional module'}</span>
                  </div>
                  {added ? <Icon name="check" size={15} /> : <Icon name="plus" size={15} />}
                </button>
              )
            })}
          </section>
          <section>
            <span className="eyebrow">CHART STYLE</span>
            <h3>Default visualization</h3>
            <div className="chart-options">
              {(['Line', 'Bars', 'Area'] as ChartStyle[]).map((item) => (
                <button
                  className={draftChart === item ? 'active' : ''}
                  onClick={() => setDraftChart(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            <p>Applies to compatible trend widgets after saving.</p>
          </section>
          <section>
            <span className="eyebrow">WIDGET SIZE</span>
            <h3>Compatible health modules</h3>
            <div className="size-options">
              {(['Compact', 'Medium', 'Wide'] as WidgetSize[]).map((item) => (
                <button
                  className={draftSize === item ? 'active' : ''}
                  onClick={() => setDraftSize(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            <p>Changes the density of primary dashboard widgets.</p>
          </section>
        </aside>
      </div>
    </>
  )
}

const breathingThemeMeta: Record<BreathingScene, { label: string; sound: string; credit: string }> =
  {
    ball: { label: 'Minimal', sound: 'Soft tone', credit: 'Minimal focus environment' },
    forest: {
      label: 'Forest',
      sound: 'Forest sound',
      credit: 'Photo: Marita Kavelashvili · Unsplash',
    },
    waves: { label: 'Ocean', sound: 'Ocean waves', credit: 'Photo: Thomas Vimare · Unsplash' },
    galaxy: {
      label: 'Galaxy',
      sound: 'Galaxy ambient',
      credit: 'Photo: Daniele Levis Pelusi · Unsplash',
    },
  }

const breathingPatterns: Record<BreathingMode, [number, number, number]> = {
  Calm: [4, 4, 6],
  Focus: [4, 2, 4],
  Sleep: [4, 4, 8],
  'Stress relief': [4, 2, 6],
}

function HumanBreathingFigure({ phase, running }: { phase: number; running: boolean }) {
  return (
    <svg
      className={`human-breathing-figure phase-${phase} ${running ? 'active' : ''}`}
      viewBox="0 0 280 430"
      role="img"
      aria-label="Natural human silhouette demonstrating gentle chest breathing"
    >
      <defs>
        <linearGradient id="skinSilhouette" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0c3ad" stopOpacity=".92" />
          <stop offset=".52" stopColor="#b18472" stopOpacity=".78" />
          <stop offset="1" stopColor="#684e4d" stopOpacity=".58" />
        </linearGradient>
        <radialGradient id="chestGlow">
          <stop offset="0" stopColor="#b9f3e5" stopOpacity=".62" />
          <stop offset=".65" stopColor="#72cfc1" stopOpacity=".18" />
          <stop offset="1" stopColor="#72cfc1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="human-head" cx="140" cy="68" rx="43" ry="54" />
      <path className="human-neck" d="M119 110c2 23-5 29-18 38l39 28 39-28c-13-9-20-15-18-38Z" />
      <path
        className="human-torso"
        d="M101 140c-30 8-54 22-65 50-14 38-10 114-7 178h222c3-64 7-140-7-178-11-28-35-42-65-50-8 20-21 31-39 31s-31-11-39-31Z"
      />
      <path
        className="human-shoulder-line"
        d="M46 192c34-13 54-11 73 1M234 192c-34-13-54-11-73 1"
      />
      <path className="human-center-line" d="M140 174v176" />
      <ellipse className="human-chest-glow" cx="140" cy="240" rx="78" ry="68" />
      <path className="human-rib left" d="M132 210c-30 1-49 14-57 37 10 19 28 31 56 34" />
      <path className="human-rib right" d="M148 210c30 1 49 14 57 37-10 19-28 31-56 34" />
      <circle className="breath-center" cx="140" cy="244" r="8" />
    </svg>
  )
}

function BreathingExercisePage() {
  const [theme, setTheme] = useState<BreathingScene>('forest')
  const [mode, setMode] = useState<BreathingMode>('Calm')
  const [duration, setDuration] = useState(3)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [phase, setPhase] = useState(0)
  const [phaseSeconds, setPhaseSeconds] = useState(4)
  const [sessionRemaining, setSessionRemaining] = useState(180)
  const [breaths, setBreaths] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const [voiceOn, setVoiceOn] = useState(true)
  const [volume, setVolume] = useState(42)
  const [moodBefore, setMoodBefore] = useState(3)
  const [moodAfter, setMoodAfter] = useState<number | null>(null)
  const audioRef = useRef<{
    context: AudioContext
    oscillator: OscillatorNode
    gain: GainNode
  } | null>(null)

  const pattern = breathingPatterns[mode]
  const phaseNames = ['Inhale', 'Hold', 'Exhale']
  const totalSeconds = duration * 60
  const progress = Math.min(100, ((totalSeconds - sessionRemaining) / totalSeconds) * 100)

  const stopAmbient = () => {
    const audio = audioRef.current
    if (audio) {
      audio.gain.gain.setTargetAtTime(0, audio.context.currentTime, 0.08)
      window.setTimeout(() => void audio.context.close(), 150)
      audioRef.current = null
    }
  }

  const startAmbient = () => {
    if (!soundOn || audioRef.current) return
    const AudioContextClass = window.AudioContext
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const frequencies: Record<BreathingScene, number> = {
      ball: 174,
      forest: 196,
      waves: 110,
      galaxy: 220,
    }
    oscillator.type = theme === 'galaxy' ? 'sine' : theme === 'waves' ? 'triangle' : 'sine'
    oscillator.frequency.value = frequencies[theme]
    gain.gain.value = (volume / 100) * 0.045
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    audioRef.current = { context, oscillator, gain }
  }

  const speak = (message: string) => {
    if (!voiceOn || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.rate = 0.76
    utterance.volume = volume / 100
    window.speechSynthesis.speak(utterance)
  }

  const finishSession = () => {
    setRunning(false)
    setCompleted(true)
    stopAmbient()
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  const beginSession = () => {
    if (!started || sessionRemaining <= 0) {
      setSessionRemaining(totalSeconds)
      setBreaths(0)
      setPhase(0)
      setPhaseSeconds(pattern[0])
      setCompleted(false)
      setMoodAfter(null)
    }
    setStarted(true)
    setRunning(true)
    startAmbient()
    speak('Inhale')
  }

  useEffect(() => {
    if (!running) return
    const interval = window.setInterval(() => {
      setSessionRemaining((current) => {
        if (current <= 1) {
          window.setTimeout(finishSession, 0)
          return 0
        }
        return current - 1
      })
      setPhaseSeconds((current) => {
        if (current > 1) return current - 1
        const nextPhase = (phase + 1) % 3
        if (phase === 2) setBreaths((count) => count + 1)
        setPhase(nextPhase)
        window.setTimeout(() => speak(phaseNames[nextPhase]), 0)
        return pattern[nextPhase]
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [running, phase, pattern, voiceOn, volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.gain.gain.setTargetAtTime(
        soundOn ? (volume / 100) * 0.045 : 0,
        audioRef.current.context.currentTime,
        0.08,
      )
    }
  }, [volume, soundOn])

  useEffect(() => {
    if (!running) return
    stopAmbient()
    startAmbient()
  }, [theme])

  useEffect(() => () => stopAmbient(), [])

  const selectDuration = (minutes: number) => {
    if (running) return
    setDuration(minutes)
    setSessionRemaining(minutes * 60)
    setStarted(false)
    setCompleted(false)
  }

  const pause = () => {
    setRunning(false)
    stopAmbient()
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  return (
    <div className={`breathing-page breathing-theme-${theme}`}>
      <PageTitle
        kicker="WELLNESS TOOL · PRIVATE SESSION"
        title="Breathing Exercise"
        description="A guided reset to regulate breathing, reduce stress, and recover focus."
        action={
          <div className="breathing-session-status">
            <i className={running ? 'active' : ''} />
            {running
              ? 'Session in progress'
              : completed
                ? 'Session complete'
                : 'Ready when you are'}
          </div>
        }
      />
      <div className="breathing-immersive-layout">
        <section className="breathing-stage">
          <div className="breathing-photo-layer" />
          <div className="breathing-vignette" />
          <div className="breathing-stage-top">
            <span>{breathingThemeMeta[theme].label.toUpperCase()} ENVIRONMENT</span>
            <span>
              {mode} · {duration} min
            </span>
          </div>
          <div className="human-guide">
            <HumanBreathingFigure phase={phase} running={running} />
            <div className={`breath-pulse phase-${phase} ${running ? 'active' : ''}`}>
              <div>
                <span>
                  {running ? phaseNames[phase] : completed ? 'Complete' : 'Get comfortable'}
                </span>
                <strong>{running ? phaseSeconds : completed ? breaths : pattern[0]}</strong>
                <small>
                  {running
                    ? `${pattern[0]}s inhale · ${pattern[1]}s hold · ${pattern[2]}s exhale`
                    : completed
                      ? 'breaths completed'
                      : 'Follow the breathing rhythm'}
                </small>
              </div>
            </div>
          </div>
          <div className="breathing-stage-bottom">
            <div>
              <span>SESSION PROGRESS</span>
              <b>
                {Math.floor(sessionRemaining / 60)}:{String(sessionRemaining % 60).padStart(2, '0')}
              </b>
            </div>
            <div className="session-progress">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div>
              <span>BREATHS</span>
              <b>{breaths}</b>
            </div>
          </div>
          <small className="theme-credit">{breathingThemeMeta[theme].credit}</small>
        </section>

        <aside className="breathing-control-panel">
          <section>
            <div className="control-title">
              <div>
                <span className="eyebrow">ENVIRONMENT</span>
                <h3>Choose your space</h3>
              </div>
            </div>
            <div className="breathing-theme-grid">
              {(['forest', 'waves', 'galaxy', 'ball'] as BreathingScene[]).map((item) => (
                <button
                  className={theme === item ? 'active' : ''}
                  onClick={() => setTheme(item)}
                  key={item}
                >
                  <i className={`theme-thumb ${item}`} />
                  <span>
                    {breathingThemeMeta[item].label}
                    <small>{breathingThemeMeta[item].sound}</small>
                  </span>
                  {theme === item && <Icon name="check" size={13} />}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="control-title">
              <div>
                <span className="eyebrow">SESSION</span>
                <h3>Breathing mode</h3>
              </div>
            </div>
            <div className="breathing-mode-grid">
              {(Object.keys(breathingPatterns) as BreathingMode[]).map((item) => (
                <button
                  className={mode === item ? 'active' : ''}
                  disabled={running}
                  onClick={() => {
                    setMode(item)
                    setPhaseSeconds(breathingPatterns[item][0])
                  }}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="session-length-row">
              <span>LENGTH</span>
              <div>
                {[1, 3, 5, 10].map((minutes) => (
                  <button
                    className={duration === minutes ? 'active' : ''}
                    disabled={running}
                    onClick={() => selectDuration(minutes)}
                    key={minutes}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="control-title">
              <div>
                <span className="eyebrow">SOUND</span>
                <h3>Ambient support</h3>
              </div>
              <button
                className={`sound-master ${soundOn ? 'active' : ''}`}
                onClick={() => setSoundOn(!soundOn)}
              >
                {soundOn ? 'On' : 'Muted'}
              </button>
            </div>
            <div className="sound-row">
              <div className="sound-icon">
                <Icon name="environment" size={15} />
              </div>
              <div>
                <b>{breathingThemeMeta[theme].sound}</b>
                <span>Theme ambience</span>
              </div>
              <button className={soundOn ? 'playing' : ''} onClick={() => setSoundOn(!soundOn)}>
                {soundOn ? 'Pause' : 'Play'}
              </button>
            </div>
            <div className="sound-row">
              <div className="sound-icon voice">
                <Icon name="breath" size={15} />
              </div>
              <div>
                <b>Breathing guidance</b>
                <span>Gentle phase prompts</span>
              </div>
              <button className={voiceOn ? 'playing' : ''} onClick={() => setVoiceOn(!voiceOn)}>
                {voiceOn ? 'On' : 'Off'}
              </button>
            </div>
            <label className="volume-control">
              <span>VOLUME</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
              />
              <b>{volume}%</b>
            </label>
          </section>

          <div className="session-actions">
            {!running ? (
              <button className="breathing-primary" onClick={beginSession}>
                {started && !completed
                  ? 'Resume session'
                  : completed
                    ? 'Start another session'
                    : 'Start session'}
              </button>
            ) : (
              <button className="breathing-primary pause" onClick={pause}>
                Pause session
              </button>
            )}
            {started && !completed && (
              <button className="breathing-end" onClick={finishSession}>
                End
              </button>
            )}
          </div>
        </aside>
      </div>

      <div className="breathing-support-row">
        <div className="support-tip">
          <i>1</i>
          <p>
            <b>Relax your shoulders</b>
            <span>Let your hands rest and soften your jaw.</span>
          </p>
        </div>
        <div className="support-tip">
          <i>2</i>
          <p>
            <b>Follow the rhythm</b>
            <span>Focus on slow, steady breaths without forcing.</span>
          </p>
        </div>
        <div className="mood-check">
          <span>{completed ? 'HOW DO YOU FEEL NOW?' : 'MOOD BEFORE SESSION'}</span>
          <div>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                className={(completed ? moodAfter : moodBefore) === value ? 'active' : ''}
                onClick={() => (completed ? setMoodAfter(value) : setMoodBefore(value))}
                key={value}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <p className="breathing-disclaimer">
          For stress relief and self-regulation, not medical treatment.
        </p>
      </div>
    </div>
  )
}

const morningQuestions = [
  {
    field: 'sleepQuality',
    title: 'How would you rate your sleep quality?',
    support: 'Consider how continuous and restorative your sleep felt.',
    low: 'Very poor',
    high: 'Excellent',
  },
  {
    field: 'physicalRestfulness',
    title: 'How physically rested do you feel?',
    support: 'Notice muscle heaviness, energy, and readiness to move.',
    low: 'Not rested',
    high: 'Fully rested',
  },
  {
    field: 'mentalAlertness',
    title: 'How mentally alert do you feel?',
    support: 'Consider concentration, clarity, and readiness to focus.',
    low: 'Very foggy',
    high: 'Very alert',
  },
] as const
const morningQuestionCount = morningQuestions.length + 1

const eveningQuestions = [
  { field: 'mentalExhaustion', title: 'Mental exhaustion', low: 'Low', high: 'High' },
  { field: 'physicalFatigue', title: 'Physical fatigue', low: 'Low', high: 'High' },
  { field: 'stressLevel', title: 'Stress level', low: 'Low', high: 'High' },
  {
    field: 'workloadManageability',
    title: 'Workload manageability',
    low: 'Difficult',
    high: 'Manageable',
  },
  {
    field: 'crewConnection',
    title: 'Connection with the crew',
    low: 'Disconnected',
    high: 'Connected',
  },
] as const

type CheckInAnswerKey =
  | (typeof morningQuestions)[number]['field']
  | (typeof eveningQuestions)[number]['field']

function DailyCheckInFlow({
  onClose,
  onDashboardUpdate,
}: {
  onClose: () => void
  onDashboardUpdate: (score: number) => void
}) {
  const [flow, setFlow] = useState<'choose' | 'morning' | 'evening' | 'summary'>('choose')
  const [completedType, setCompletedType] = useState<'morning' | 'evening'>('morning')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Record<CheckInAnswerKey, number>>>({})
  const [hasPhysicalDiscomfort, setHasPhysicalDiscomfort] = useState<boolean | null>(null)
  const [discomfortDescription, setDiscomfortDescription] = useState('')
  const [privacyLevel, setPrivacyLevel] = useState<'private' | 'crew-medical'>('private')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const currentMorning = morningQuestions[step]

  const chooseAnswer = (field: CheckInAnswerKey, value: number) => {
    setAnswers((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const submit = (sessionType: 'morning' | 'evening') => {
    const allowedFields =
      sessionType === 'morning'
        ? morningQuestions.map((question) => question.field)
        : eveningQuestions.map((question) => question.field)
    const responses = Object.fromEntries(
      allowedFields
        .filter((field) => answers[field] !== undefined)
        .map((field) => [field, answers[field]]),
    ) as CheckInSubmission['responses']
    startTransition(async () => {
      const result = await submitDailyCheckIn({
        sessionType,
        privacyLevel,
        responses,
        hasPhysicalDiscomfort: sessionType === 'morning' ? hasPhysicalDiscomfort : undefined,
        physicalDiscomfortDescription:
          sessionType === 'morning' && hasPhysicalDiscomfort ? discomfortDescription : undefined,
      })
      if (!result.success) {
        setError(result.message)
        return
      }
      setCompletedType(sessionType)
      const fatigue =
        sessionType === 'evening'
          ? (answers.physicalFatigue ?? 3) * 2
          : Math.max(1, 12 - (answers.physicalRestfulness ?? 3) * 2)
      onDashboardUpdate(fatigue)
      setFlow('summary')
    })
  }

  if (flow === 'choose') {
    return (
      <>
        <div className="modal-body checkin-choice-body">
          <div className="checkin-intro">
            <span className="research-label">RESEARCH-INSPIRED PROTOTYPE</span>
            <h3>Choose your check-in</h3>
            <p>
              Short self-reports informed by Spaceflight Standard Measures and Behavioral Core
              Measures research. This does not reproduce an official NASA questionnaire.
            </p>
          </div>
          <div className="checkin-flow-cards">
            <button onClick={() => setFlow('morning')}>
              <span className="flow-time">06:00</span>
              <div>
                <b>Morning check-in</b>
                <p>Sleep, restfulness, alertness, and physical comfort</p>
              </div>
              <Icon name="chevron" size={16} />
            </button>
            <button onClick={() => setFlow('evening')}>
              <span className="flow-time evening">20:00</span>
              <div>
                <b>Evening check-in</b>
                <p>Fatigue, stress, workload, and crew connection</p>
              </div>
              <Icon name="chevron" size={16} />
            </button>
          </div>
          <div className="checkin-history-preview">
            <div>
              <span>7-DAY COMPLETION</span>
              <b>11 / 14</b>
            </div>
            <div className="history-dots">
              {[1, 1, 1, 1, 1, 0, 1].map((done, index) => (
                <i className={done ? 'done' : ''} key={index} />
              ))}
            </div>
            <span>Personal baseline available</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="checkin-skip" onClick={onClose}>
            Skip for now
          </button>
        </div>
      </>
    )
  }

  if (flow === 'summary') {
    const alertness = answers.mentalAlertness ?? 3
    const fatigue = answers.physicalFatigue ?? Math.max(1, 6 - (answers.physicalRestfulness ?? 3))
    const stress = answers.stressLevel ?? 2
    return (
      <>
        <div className="modal-body checkin-summary-body">
          <div className="summary-success">
            <span>
              <Icon name="check" size={19} />
            </span>
            <div>
              <h3>{completedType === 'morning' ? 'Morning' : 'Evening'} check-in saved</h3>
              <p>Your private record has been added to today’s health timeline.</p>
            </div>
          </div>
          <div className="checkin-summary-grid">
            <div>
              <span>ALERTNESS</span>
              <b>{alertness} / 5</b>
              <small>{alertness >= 4 ? 'Above' : 'Near'} personal baseline</small>
            </div>
            <div>
              <span>FATIGUE</span>
              <b>{fatigue} / 5</b>
              <small>{fatigue > 3 ? 'Higher than' : 'Near'} 7-day average</small>
            </div>
            <div>
              <span>STRESS</span>
              <b>{stress} / 5</b>
              <small>{stress <= 2 ? 'Below' : 'Near'} recent baseline</small>
            </div>
            <div>
              <span>SLEEP</span>
              <b>5h 42m</b>
              <small>−1h 18m from usual duration</small>
            </div>
          </div>
          <div className="checkin-trend-card">
            <div>
              <span className="eyebrow">SUBJECTIVE TREND · 7 DAYS</span>
              <h3>Alertness, fatigue & stress</h3>
            </div>
            <div className="checkin-trend-lines">
              <svg viewBox="0 0 420 90" preserveAspectRatio="none">
                <path className="trend-grid" d="M0 20H420M0 45H420M0 70H420" />
                <polyline
                  className="alertness-line"
                  points={`0,50 70,44 140,39 210,43 280,34 350,41 420,${72 - alertness * 10}`}
                />
                <polyline
                  className="fatigue-line"
                  points={`0,35 70,40 140,38 210,47 280,51 350,45 420,${20 + fatigue * 10}`}
                />
              </svg>
              <div>
                <span>
                  <i className="teal" />
                  Alertness
                </span>
                <span>
                  <i className="orange" />
                  Fatigue
                </span>
              </div>
            </div>
          </div>
          <p className="checkin-nondiagnostic">
            Personal comparisons support self-awareness only and are not medical diagnoses or risk
            scores.
          </p>
        </div>
        <div className="modal-footer">
          <button className="primary-button" onClick={onClose}>
            Return to dashboard
          </button>
        </div>
      </>
    )
  }

  const isMorning = flow === 'morning'
  const progress = isMorning ? ((step + 1) / morningQuestionCount) * 100 : 100
  return (
    <>
      <div className="checkin-progress">
        <div>
          <span>
            {isMorning ? `Question ${step + 1} of ${morningQuestionCount}` : 'Evening check-in'}
          </span>
          <b>{Math.round(progress)}%</b>
        </div>
        <i>
          <span style={{ width: `${progress}%` }} />
        </i>
      </div>
      <div className={`modal-body ${isMorning ? 'morning-question-body' : 'evening-checkin-body'}`}>
        {isMorning ? (
          <>
            {step === 0 && (
              <div className="measured-sleep">
                <Icon name="trend" size={16} />
                <div>
                  <span>MEASURED SLEEP DURATION</span>
                  <b>5h 42m</b>
                </div>
                <small>Wearable · synced 06:12</small>
              </div>
            )}
            {step < morningQuestions.length && currentMorning ? (
              <>
                <div className="single-question">
                  <span className="question-number">0{step + 1}</span>
                  <h3>{currentMorning.title}</h3>
                  <p>{currentMorning.support}</p>
                </div>
                <div className="large-answer-scale">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      className={answers[currentMorning.field] === value ? 'active' : ''}
                      onClick={() => chooseAnswer(currentMorning.field, value)}
                      key={value}
                    >
                      <strong>{value}</strong>
                      <span>
                        {value === 1
                          ? currentMorning.low
                          : value === 5
                            ? currentMorning.high
                            : value === 3
                              ? 'Moderate'
                              : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="discomfort-question">
                <div className="single-question">
                  <span className="question-number">0{morningQuestionCount}</span>
                  <h3>Are you experiencing physical discomfort?</h3>
                  <p>Include headache, nausea, soreness, or other symptoms.</p>
                </div>
                <div className="binary-answer-row">
                  <button
                    className={hasPhysicalDiscomfort === true ? 'active' : ''}
                    onClick={() => {
                      setHasPhysicalDiscomfort(true)
                      setError('')
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className={hasPhysicalDiscomfort === false ? 'active' : ''}
                    onClick={() => {
                      setHasPhysicalDiscomfort(false)
                      setDiscomfortDescription('')
                      setError('')
                    }}
                  >
                    No
                  </button>
                </div>
                {hasPhysicalDiscomfort && (
                  <label className="discomfort-description">
                    <span>Please describe your discomfort.</span>
                    <textarea
                      value={discomfortDescription}
                      maxLength={500}
                      onChange={(event) => setDiscomfortDescription(event.target.value)}
                      placeholder="Describe the location, sensation, and when it began."
                    />
                    <small>{discomfortDescription.length} / 500</small>
                  </label>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="evening-intro">
              <h3>How was your day?</h3>
              <p>Use the compact 1–5 scales. You can skip any item.</p>
            </div>
            <div className="evening-slider-list">
              {eveningQuestions.map((question) => (
                <div className="evening-slider" key={question.field}>
                  <div>
                    <b>{question.title}</b>
                    <span>{question.low}</span>
                  </div>
                  <div>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        className={answers[question.field] === value ? 'active' : ''}
                        onClick={() => chooseAnswer(question.field, value)}
                        key={value}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span>{question.high}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="checkin-privacy">
          <div>
            <Icon name="lock" size={14} />
            <span>
              <b>Privacy</b>
              <small>Answers are never shown publicly.</small>
            </span>
          </div>
          <select
            value={privacyLevel}
            onChange={(event) => setPrivacyLevel(event.target.value as 'private' | 'crew-medical')}
          >
            <option value="private">Private health record</option>
            <option value="crew-medical">Share summary with crew medical</option>
          </select>
        </div>
        {error && <p className="checkin-error">{error}</p>}
      </div>
      <div className="modal-footer checkin-footer">
        <button
          className="secondary-button"
          onClick={() => (isMorning && step > 0 ? setStep(step - 1) : setFlow('choose'))}
        >
          Back
        </button>
        {(!isMorning || step < morningQuestionCount - 1) && (
          <button
            className="checkin-skip"
            onClick={() =>
              isMorning && step < morningQuestionCount - 1 ? setStep(step + 1) : onClose()
            }
          >
            Skip
          </button>
        )}
        {isMorning && step < morningQuestionCount - 1 ? (
          <button className="primary-button" onClick={() => setStep(step + 1)}>
            Next
          </button>
        ) : (
          <button
            className="primary-button"
            disabled={isPending || (isMorning && hasPhysicalDiscomfort === null)}
            onClick={() => submit(isMorning ? 'morning' : 'evening')}
          >
            {isPending ? 'Saving…' : 'Submit check-in'}
          </button>
        )}
      </div>
    </>
  )
}

function WellnessModal({
  mode,
  onClose,
  onSaveScore,
}: {
  mode: 'checkin' | 'breathing'
  onClose: () => void
  onSaveScore: (score: number) => void
}) {
  const [breathing, setBreathing] = useState(false)
  const [duration, setDuration] = useState(2)
  const [scene, setScene] = useState<BreathingScene>('ball')
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={`wellness-modal ${mode}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wellness-title"
      >
        <div className="modal-header">
          <div className={`modal-symbol ${mode === 'breathing' ? 'blue' : ''}`}>
            <Icon name={mode === 'checkin' ? 'heart' : 'breath'} size={20} />
          </div>
          <div>
            <span className="eyebrow">
              {mode === 'checkin' ? 'DAILY HEALTH · SELF-REPORT' : 'GUIDED RESET · PRIVATE'}
            </span>
            <h2 id="wellness-title">
              {mode === 'checkin' ? 'Daily health check-in' : 'Breathing exercise'}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close window">
            <Icon name="plus" size={18} />
          </button>
        </div>
        {mode === 'checkin' ? (
          <DailyCheckInFlow onClose={onClose} onDashboardUpdate={onSaveScore} />
        ) : (
          <>
            <div className="modal-body breathing-body">
              <div className={`breathing-scene scene-${scene} ${breathing ? 'active' : ''}`}>
                {scene === 'forest' && (
                  <div className="forest-layer">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                )}
                {scene === 'waves' && (
                  <div className="wave-layer">
                    <i />
                    <i />
                    <i />
                  </div>
                )}
                {scene === 'galaxy' && (
                  <div className="galaxy-layer">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                )}
                <div className="breathing-orb">
                  <div>
                    <Icon name="breath" size={25} />
                    <strong>{breathing ? 'Breathe slowly' : 'Ready'}</strong>
                    <span>{breathing ? 'Inhale · hold · exhale' : 'Follow the rhythm'}</span>
                  </div>
                </div>
              </div>
              <div className="breathing-copy">
                <h3>Box breathing</h3>
                <p>
                  Inhale for 4 seconds, hold for 4, exhale for 4, then hold for 4. Stop if you feel
                  uncomfortable.
                </p>
                <span>VISUAL ENVIRONMENT</span>
                <div className="scene-options">
                  {(
                    [
                      ['ball', 'Breathing ball'],
                      ['forest', 'Forest'],
                      ['waves', 'Sea waves'],
                      ['galaxy', 'Galaxy'],
                    ] as [BreathingScene, string][]
                  ).map(([value, label]) => (
                    <button
                      className={scene === value ? 'active' : ''}
                      onClick={() => {
                        setScene(value)
                        setBreathing(false)
                      }}
                      key={value}
                    >
                      <i className={`scene-swatch ${value}`} />
                      {label}
                    </button>
                  ))}
                </div>
                <span>SESSION LENGTH</span>
                <div className="duration-options">
                  {[1, 2, 5].map((minutes) => (
                    <button
                      className={duration === minutes ? 'active' : ''}
                      onClick={() => setDuration(minutes)}
                      key={minutes}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={onClose}>
                Close
              </button>
              <button className="primary-button" onClick={() => setBreathing(!breathing)}>
                {breathing ? 'Pause exercise' : `Begin ${duration}-minute exercise`}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function AuthModal({
  onClose,
  onAuthenticated,
}: {
  onClose: () => void
  onAuthenticated: (data: PrivateDashboardData) => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const submit = () => {
    setError('')
    startTransition(async () => {
      const result =
        mode === 'register'
          ? await registerAstronaut({ name, email, password })
          : await loginAstronaut({ email, password })
      if (!result.success) {
        setError(result.message)
        return
      }
      onAuthenticated(result.data)
      onClose()
    })
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="wellness-modal auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <div className="modal-header">
          <div className="modal-symbol">
            <Icon name="lock" size={19} />
          </div>
          <div>
            <span className="eyebrow">PRIVATE ASTRONAUT ACCOUNT</span>
            <h2 id="auth-title">
              {mode === 'login' ? 'Sign in to HEALium' : 'Create astronaut account'}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close sign-in">
            <Icon name="plus" size={18} />
          </button>
        </div>
        <div className="modal-body auth-body">
          <p>
            Your journal, questionnaire responses, and reminder completion records are stored
            privately under this account.
          </p>
          {mode === 'register' && (
            <label>
              <span>Name</span>
              <input
                value={name}
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </label>
          )}
          <label>
            <span>Email</span>
            <input
              value={email}
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <label>
            <span>Password</span>
            <input
              value={password}
              type="password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </label>
          {error && <p className="checkin-error">{error}</p>}
        </div>
        <div className="modal-footer auth-footer">
          <button
            className="checkin-skip"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
          >
            {mode === 'login' ? 'Create an account' : 'I already have an account'}
          </button>
          <button className="primary-button" disabled={isPending} onClick={submit}>
            {isPending ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </section>
    </div>
  )
}

function JournalPage({
  entries,
  signedIn,
  onAuthRequired,
  onEntrySaved,
  onEntryDeleted,
}: {
  entries: JournalEntryView[]
  signedIn: boolean
  onAuthRequired: () => void
  onEntrySaved: (entry: JournalEntryView) => void
  onEntryDeleted: (id: string) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [keyword, setKeyword] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [entryDate, setEntryDate] = useState(today)
  const [mood, setMood] = useState('')
  const [sharedWithMedical, setSharedWithMedical] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const visibleEntries = entries.filter((entry) => {
    const matchesKeyword =
      !keyword ||
      `${entry.title} ${entry.body}`.toLowerCase().includes(keyword.trim().toLowerCase())
    const matchesDate = !dateFilter || entry.entryDate.slice(0, 10) === dateFilter
    return matchesKeyword && matchesDate
  })

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setBody('')
    setEntryDate(today)
    setMood('')
    setSharedWithMedical(false)
    setError('')
  }

  const editEntry = (entry: JournalEntryView) => {
    setEditingId(entry.id)
    setTitle(entry.title)
    setBody(entry.body)
    setEntryDate(entry.entryDate.slice(0, 10))
    setMood(entry.mood ?? '')
    setSharedWithMedical(entry.sharedWithMedical)
    setError('')
  }

  const save = () => {
    if (!signedIn) {
      onAuthRequired()
      return
    }
    startTransition(async () => {
      const result = await saveJournalEntry({
        id: editingId ?? undefined,
        title,
        body,
        entryDate,
        mood: mood || null,
        sharedWithMedical,
      })
      if (!result.success) {
        setError(result.message)
        return
      }
      onEntrySaved(result.data)
      resetForm()
    })
  }

  const remove = (entry: JournalEntryView) => {
    if (!window.confirm(`Delete “${entry.title}”? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteJournalEntry(entry.id)
      if (!result.success) {
        setError(result.message)
        return
      }
      onEntryDeleted(entry.id)
      if (editingId === entry.id) resetForm()
    })
  }

  return (
    <>
      <PageTitle
        kicker="PRIVATE CREW RECORD · MC-01"
        title="My Journal"
        description="Personal reflections remain private unless you explicitly share an entry with crew medical."
        action={
          <span className="journal-privacy-badge">
            <Icon name="lock" size={13} /> Owner-only access
          </span>
        }
      />
      {!signedIn ? (
        <section className="journal-locked">
          <span>
            <Icon name="lock" size={24} />
          </span>
          <h3>Sign in to open your private journal</h3>
          <p>
            Entries are stored in owner-scoped Payload records and are not visible to other
            astronauts.
          </p>
          <button className="primary-button" onClick={onAuthRequired}>
            Sign in
          </button>
        </section>
      ) : (
        <div className="journal-layout">
          <section className="journal-editor">
            <div className="journal-section-head">
              <div>
                <span className="eyebrow">{editingId ? 'EDIT ENTRY' : 'NEW ENTRY'}</span>
                <h3>{editingId ? 'Update reflection' : 'Write a reflection'}</h3>
              </div>
              {editingId && <button onClick={resetForm}>Cancel edit</button>}
            </div>
            <div className="journal-form">
              <label>
                <span>Title</span>
                <input
                  value={title}
                  maxLength={140}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Give this entry a title"
                />
              </label>
              <div className="journal-form-row">
                <label>
                  <span>Date</span>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(event) => setEntryDate(event.target.value)}
                  />
                </label>
                <label>
                  <span>Mood (optional)</span>
                  <select value={mood} onChange={(event) => setMood(event.target.value)}>
                    <option value="">Not recorded</option>
                    <option value="calm">Calm</option>
                    <option value="focused">Focused</option>
                    <option value="tired">Tired</option>
                    <option value="stressed">Stressed</option>
                    <option value="positive">Positive</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Journal entry</span>
                <textarea
                  value={body}
                  maxLength={10000}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="What would you like to record?"
                />
              </label>
              <label className="journal-share">
                <input
                  type="checkbox"
                  checked={sharedWithMedical}
                  onChange={(event) => setSharedWithMedical(event.target.checked)}
                />
                <span>
                  <b>Share this entry with crew medical</b>
                  <small>Off by default. This is the only explicit sharing control.</small>
                </span>
              </label>
              {error && <p className="checkin-error">{error}</p>}
              <button className="primary-button journal-save" disabled={isPending} onClick={save}>
                {isPending ? 'Saving…' : editingId ? 'Save changes' : 'Save journal entry'}
              </button>
            </div>
          </section>
          <section className="journal-history">
            <div className="journal-section-head">
              <div>
                <span className="eyebrow">PREVIOUS ENTRIES</span>
                <h3>{visibleEntries.length} entries</h3>
              </div>
            </div>
            <div className="journal-filters">
              <label>
                <span>Search</span>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Keyword"
                />
              </label>
              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                />
              </label>
            </div>
            <div className="journal-entry-list">
              {visibleEntries.length === 0 ? (
                <div className="journal-empty">
                  <Icon name="journal" size={22} />
                  <p>No journal entries match this search.</p>
                </div>
              ) : (
                visibleEntries.map((entry) => (
                  <article key={entry.id}>
                    <button className="journal-entry-open" onClick={() => editEntry(entry)}>
                      <span>
                        {new Date(entry.entryDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <strong>{entry.title}</strong>
                      <p>{entry.body}</p>
                      <small>
                        {entry.mood ? `Mood: ${entry.mood}` : 'Mood not recorded'}
                        {entry.sharedWithMedical ? ' · Shared with crew medical' : ' · Private'}
                      </small>
                    </button>
                    <button
                      className="journal-delete"
                      onClick={() => remove(entry)}
                      disabled={isPending}
                    >
                      Delete
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default function App({
  emergencySnapshots,
}: {
  emergencySnapshots: EmergencySnapshotView[]
}) {
  const [page, setPage] = useState<Page>('Dashboard')
  const [crew, setCrew] = useState('Cmdr. Maya Chen')
  const [widgets, setWidgets] = useState<WidgetId[]>(defaultWidgets)
  const [chart, setChart] = useState<ChartStyle>('Line')
  const [size, setSize] = useState<WidgetSize>('Medium')
  const [dailyScore, setDailyScore] = useState<number | null>(null)
  const [wellnessModal, setWellnessModal] = useState<'checkin' | 'breathing' | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const emergencyDialog = useRef<HTMLDialogElement>(null)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [privateData, setPrivateData] = useState<PrivateDashboardData>({
    user: null,
    reminders: [],
    journals: [],
  })
  const [privateError, setPrivateError] = useState('')
  const [privatePending, startPrivateTransition] = useTransition()
  const [physicalFocus, setPhysicalFocus] = useState('Cardiovascular Health')

  useEffect(() => {
    if (!emergencyOpen) return
    const dialog = emergencyDialog.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog?.showModal()
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
    }
  }, [emergencyOpen])

  useEffect(() => {
    let active = true
    getPrivateDashboardData()
      .then((data) => {
        if (active) setPrivateData(data)
      })
      .catch(() => {
        if (active) setPrivateError('Private records could not be loaded.')
      })
    return () => {
      active = false
    }
  }, [])

  const go = (next: Page) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const openPhysical = (category: string) => {
    setPhysicalFocus(category)
    go('Physical')
  }
  const openCheckIn = () => {
    if (!privateData.user) {
      setAuthModalOpen(true)
      return
    }
    setWellnessModal('checkin')
  }
  const toggleReminder = (key: string, completed: boolean) => {
    if (!privateData.user) {
      setAuthModalOpen(true)
      return
    }
    setPrivateError('')
    startPrivateTransition(async () => {
      const result = await setReminderCompleted(key, completed)
      if (!result.success) {
        setPrivateError(result.message)
        return
      }
      setPrivateData((current) => ({
        ...current,
        reminders: [
          ...current.reminders.filter((item) => item.reminderKey !== result.data.reminderKey),
          result.data,
        ],
      }))
    })
  }
  const signOut = () => {
    startPrivateTransition(async () => {
      const result = await logoutAstronaut()
      if (result.success) {
        setPrivateData({ user: null, reminders: [], journals: [] })
        setDailyScore(null)
      }
    })
  }
  const upsertJournal = (entry: JournalEntryView) => {
    setPrivateData((current) => ({
      ...current,
      journals: [entry, ...current.journals.filter((item) => item.id !== entry.id)].sort(
        (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
      ),
    }))
  }
  const removeJournal = (id: string) => {
    setPrivateData((current) => ({
      ...current,
      journals: current.journals.filter((entry) => entry.id !== id),
    }))
  }
  const pageNames: Record<Page, string> = {
    Dashboard: 'Crew Health Overview',
    Physical: 'Physical Health Overview',
    Blood: 'Blood Test Results',
    Urine: 'Urine Test Results',
    Environment: 'Environmental Monitoring',
    Trends: 'Trends & Personal Baselines',
    Sources: 'Data Sources & Transparency',
    Customize: 'Dashboard Customization',
    EmergencyData: 'Saved Emergency Data',
    Breathing: 'Breathing Exercise',
    Journal: 'Private Journal',
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span className="orbit" />
            <span className="planet" />
          </div>
          <div>
            <strong>HEALium</strong>
            <small>CREW HEALTH SYSTEM</small>
          </div>
        </div>
        <div className="mission-chip">
          <span />
          <div>
            <small>MISSION DAY</small>
            <strong>
              184 <i>/ 365</i>
            </strong>
          </div>
          <b>51%</b>
        </div>
        <button
          className="sidebar-checkin"
          onClick={() => {
            openCheckIn()
          }}
        >
          <span className="checkin-plus">
            <Icon name={dailyScore === null ? 'plus' : 'check'} size={14} />
          </span>
          <span>
            <small>DAILY HEALTH</small>
            <b>{dailyScore === null ? 'Start check-in' : 'Update check-in'}</b>
          </span>
          <Icon name="chevron" size={14} />
        </button>
        <button className="sidebar-checkin breathing" onClick={() => go('Breathing')}>
          <span className="checkin-plus">
            <Icon name="breath" size={15} />
          </span>
          <span>
            <small>WELLNESS TOOL</small>
            <b>Breathing exercise</b>
          </span>
          <Icon name="chevron" size={14} />
        </button>
        <nav aria-label="Primary navigation">
          <p className="nav-label">MISSION HEALTH</p>
          {navItems.slice(0, 6).map((item) => (
            <button
              className={`nav-item ${page === item.page || (item.page === 'Physical' && ['Blood', 'Urine'].includes(page)) ? 'active' : ''}`}
              onClick={() => go(item.page)}
              key={item.label}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
          <p className="nav-label second">SYSTEM</p>
          {navItems.slice(6).map((item) => (
            <button
              className={`nav-item ${page === item.page ? 'active' : ''}`}
              onClick={() => go(item.page)}
              key={item.label}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="connection">
            <span />
            <div>
              <strong>All systems connected</strong>
              <small>Synced 38 sec ago</small>
            </div>
          </div>
          <div className="mission-name">
            <div className="mission-avatar">A7</div>
            <div>
              <strong>Asteria VII</strong>
              <small>Deep Space Mission</small>
            </div>
            <Icon name="chevron" size={15} />
          </div>
          <button
            className={`account-button ${privateData.user ? 'signed-in' : ''}`}
            onClick={() => (privateData.user ? signOut() : setAuthModalOpen(true))}
            disabled={privatePending}
          >
            <Icon name="lock" size={14} />
            <span>
              <strong>{privateData.user ? privateData.user.name : 'Private data sign-in'}</strong>
              <small>{privateData.user ? 'Sign out' : 'Sync journal & reminders'}</small>
            </span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="title-line">
              <h1>Astronaut Health Monitoring</h1>
              <span className="demo-note">SIMULATED DEMO DATA</span>
            </div>
            <p>
              {pageNames[page]} <span>•</span> Personal-baseline monitoring
            </p>
          </div>
          <div className="top-actions">
            <div className="mission-time">
              <span>MISSION TIME</span>
              <strong>
                09:42:18 <small>UTC</small>
              </strong>
            </div>
            <label className="crew-selector">
              <span className="crew-avatar">MC</span>
              <span className="crew-copy">
                <small>ACTIVE CREW MEMBER</small>
                <select value={crew} onChange={(e) => setCrew(e.target.value)}>
                  <option>Cmdr. Maya Chen</option>
                  <option>Dr. Elias Romero</option>
                  <option>Lt. Anika Patel</option>
                </select>
              </span>
            </label>
            <button className="notification-button" aria-label="Notifications">
              <Icon name="bell" size={20} />
              <span>2</span>
            </button>
            <button
              className="rounded-lg border border-[#FC3D21] bg-[#FC3D21] px-4 py-2 text-xs font-semibold text-white hover:bg-[#dd321a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3D91]"
              aria-label="Help — open emergency mode"
              aria-haspopup="dialog"
              onClick={() => setEmergencyOpen(true)}
            >
              Help
            </button>
          </div>
        </header>
        <div className="dashboard-content">
          {page === 'Dashboard' && (
            <DashboardPage
              go={go}
              widgets={widgets}
              chart={chart}
              size={size}
              dailyScore={dailyScore}
              openPhysical={openPhysical}
              reminderCompletions={privateData.reminders}
              signedIn={Boolean(privateData.user)}
              onToggleReminder={toggleReminder}
              onStartCheckIn={openCheckIn}
            />
          )}
          {page === 'Physical' && <PhysicalPage go={go} initialOpen={physicalFocus} />}
          {page === 'Blood' && <LabPage type="Blood" go={go} />}
          {page === 'Urine' && <LabPage type="Urine" go={go} />}
          {page === 'Environment' && <EnvironmentPage />}
          {page === 'Trends' && <TrendsPage />}
          {page === 'Sources' && <SourcesPage />}
          {page === 'EmergencyData' && <EmergencyDataPage snapshots={emergencySnapshots} />}
          {page === 'Breathing' && <BreathingExercisePage />}
          {page === 'Journal' && (
            <JournalPage
              entries={privateData.journals}
              signedIn={Boolean(privateData.user)}
              onAuthRequired={() => setAuthModalOpen(true)}
              onEntrySaved={upsertJournal}
              onEntryDeleted={removeJournal}
            />
          )}
          {page === 'Customize' && (
            <CustomizePage
              widgets={widgets}
              setWidgets={setWidgets}
              go={go}
              chart={chart}
              setChart={setChart}
              size={size}
              setSize={setSize}
            />
          )}
        </div>
        {privateError && (
          <button className="app-notice" onClick={() => setPrivateError('')}>
            {privateError}
          </button>
        )}
        <footer className="app-footer">
          <span>NASA Space Apps Challenge · Research interface v3.0</span>
          <span>
            Personal baseline: 14-day rolling model <i /> Telemetry nominal
          </span>
        </footer>
      </main>
      {wellnessModal && (
        <WellnessModal
          mode={wellnessModal}
          onClose={() => setWellnessModal(null)}
          onSaveScore={(score) => {
            setDailyScore(score)
            toggleReminder('daily-health', true)
          }}
        />
      )}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onAuthenticated={(data) => {
            setPrivateData(data)
            setPrivateError('')
          }}
        />
      )}
      <dialog
        ref={emergencyDialog}
        aria-label="Emergency mode"
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-[#d9e0ea] p-0 text-[#07173F] backdrop:bg-[#d9e0ea]"
        onCancel={() => setEmergencyOpen(false)}
        onClose={() => setEmergencyOpen(false)}
      >
        {emergencyOpen && (
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-[#cbd5e3] bg-white px-5 py-2 text-xs">
              <strong>HEALium · Emergency mode</strong>
              <button
                autoFocus
                className="rounded-lg border border-[#cbd5e3] bg-white px-4 py-2 font-semibold hover:bg-[#eef2f7] focus-visible:outline-2 focus-visible:outline-[#0B3D91]"
                onClick={() => setEmergencyOpen(false)}
              >
                ← Back to dashboard
              </button>
            </div>
            <iframe
              title="HEALium emergency flow"
              src="/emergency/index.html"
              className="min-h-0 w-full flex-1 border-0"
            />
          </div>
        )}
      </dialog>
    </div>
  )
}
