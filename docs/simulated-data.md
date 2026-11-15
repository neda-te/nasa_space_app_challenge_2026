# Simulated data

HEALium is a prototype. **No health value shown in the application was measured on a
person or a spacecraft.** This document lists every place where simulated data is used,
how it is marked, and what would replace it.

## How simulated data is marked

| Where          | Marker                                                                        |
| -------------- | ----------------------------------------------------------------------------- |
| In the UI      | "SIMULATED DEMO DATA" chip in the top bar, "SIMULATED CREW DATA" banner on the home dashboard, "simulated" in source labels and chart captions; the emergency flow shows "PROTOTYPE · not a medical device · demo data" |
| In the code    | Demo datasets live only in `src/data/simulated/`; every file there starts with a `SIMULATED DATA` notice |
| In the gateway | Readings of the simulated source carry `quality: 'simulated'`                 |
| In the backend | Emergency snapshots have a `simulated` flag; only flagged records are shown   |

## Inventory

### 1. Demo datasets (`src/data/simulated/`)

| File                   | Content                                              | Used by                                   |
| ---------------------- | ---------------------------------------------------- | ----------------------------------------- |
| `health-categories.ts` | Summary value, status and details per health category | Physical Health page                     |
| `lab-results.ts`       | Blood and urine results with trends                  | Tests & Lab Data pages                    |
| `environment.ts`       | Cabin readings (CO₂, pressure, temperature, noise, light, …) | Environmental Monitoring page     |
| `radiation.ts`         | Daily radiation dose for 30 days                     | Radiation exposure chart                  |
| `trends.ts`            | Series for sleep, heart rate, fatigue, reaction time, activity | Trends & Analysis page          |
| `widget-series.ts`     | Mini-chart series of the home widgets and environment cards | Home dashboard, Environment page   |

### 2. Demo values written directly in components

These values are part of the interface text and were left in place to keep the
prototype's appearance unchanged. They are simulated as well.

| File                                        | Demo values                                                   |
| ------------------------------------------- | ------------------------------------------------------------- |
| `src/features/dashboard/HomeWidget.tsx`     | Metric values of all home widgets (heart rate, sleep, reaction time, …) |
| `src/features/dashboard/HealthSummary.tsx`  | Summary texts ("Sleep is 1h 18m below usual …")               |
| `src/features/dashboard/mission-tasks.ts`   | Indicator values behind the task-readiness rules              |
| `src/features/trends/TrendsPage.tsx`        | Correlation example (r value and scatter points)              |
| `src/features/check-in/DailyCheckInFlow.tsx` | "Measured sleep" shown with the morning check-in, check-in history dots |
| `src/features/lab-data/LabPage.tsx`         | Time stamps of the latest samples                             |
| `src/features/environment/EnvironmentPage.tsx` | "8 systems nominal" status chip                            |
| `src/app/App.tsx`                           | Mission day, mission time, crew names, sync status            |

The one value on the home dashboard that is **not** simulated is the fatigue score
after a check-in: it is computed from the answers the user has just given.

### 3. Backend

| Place                                              | Simulated element                                     |
| -------------------------------------------------- | ----------------------------------------------------- |
| `backend/src/collections/DailyHealthCheckins.ts`   | `measuredSleepMinutes` is a fixed value (342)         |
| `backend/src/collections/Users.ts` and others      | `astronautCode` is always `MC-01` (single-crew demo)  |
| `backend/src/collections/EmergencySnapshots.ts`    | Records are demo records flagged `simulated`          |

User accounts, journal entries, reminder states and check-in answers are **real user
input** and are stored as entered.

### 4. Emergency flow (`emergency/`)

| Place                              | Simulated element                                                    |
| ---------------------------------- | -------------------------------------------------------------------- |
| `js/app/vitals.js`                 | "Live vitals": fixed baseline per scenario plus random jitter (`Math.random`) |
| `js/app/assessment.js`             | Vital baselines per scenario                                         |
| `index.html` (screen 1)            | Vitals strip labelled "Live · wrist device" (static values)          |
| `js/data/regions-and-pain.js` (`REC`) | Crew "records" used as priors for the assessment                  |
| `js/app/state.js`, `index.html`    | Mission elapsed time (fixed start value), crew member name           |
| Header                             | "LIVE · BEING SENT TO FLIGHT SURGEON" is a label only; the page sends no data |

The medical content of the flow (questions, likely causes, procedures, red flags) is
a rule-based knowledge base written for the prototype. It is not validated clinical
guidance.

The emergency flow and the Emergency Data page of the dashboard are **not linked**:
the flow does not create snapshot records.

## Replacing simulated data

The route from simulated to real data is the ingestion gateway
([data-ingestion.md](data-ingestion.md)):

1. Connect a source adapter in `src/ingestion/sources/`.
2. Store its readings (database sink).
3. Switch the affected feature from its `src/data/simulated/` module to stored readings.

Until a source is connected, the simulated source delivers the same demo datasets
through the gateway, so the pipeline can be developed and tested without hardware.
