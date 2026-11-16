# HEALium

Link: https://github.com/neda-te/nasa_space_app_challenge_2026
Demo: https://drive.google.com/file/d/1m9H6MrEr5AyhFo0CfGU89dtGyAsCJG-C/view

### Astronaut health monitoring and emergency support prototype

HEALium brings routine crew health monitoring and guided emergency assessment into one browser experience. It combines a customizable dashboard, interactive 3D body models, procedure guides, and a synchronized telemetry scenario to explore how astronauts could review their health and respond to concerns during a mission.

The current application runs without a database, sign-in, sensor connection, or API key.

> **Prototype status:** Health readings and alerts are fictional or labeled sample data. Assessments, check-ins, and report sharing are demonstrations. HEALium is not a validated medical device or a substitute for professional medical care. Simulated reports are not transmitted to a flight surgeon.

## Features

- **Crew health dashboard:** Explore physical health, blood and urine results, cabin environment, trends, and data sources, with customizable dashboard widgets.
- **Live telemetry demo:** Follow heart rate, oxygen saturation, blood pressure, skin temperature, respiratory rate, and cabin CO₂ during a five-minute scenario. Live charts include a readable values table.
- **Emergency assessment:** Open **Help** beside Notifications for a full-screen flow with body-region selection, symptom review, and simulated report submission. Return with the dashboard page, crew selection, and settings preserved.
- **Interactive body models:** Dashboard previews and emergency mode share a Three.js renderer and female/male schematic model preferences. Region buttons provide a fallback when Three.js is unavailable.
- **Procedure guides:** Browse step-by-step instructions, including 18 blood draw photos and four illustrations each for ECG and eye exams. Guides without supplied images, including ultrasound, use text-only steps.
- **Voice assistance:** Use English symptom dictation and spoken guidance in supported browsers. Keyword-based symptom suggestions are presented for user review.
- **Wellbeing tools:** Try guided breathing scenes, daily check-ins, journal entries, and reminder completion. Opening emergency mode pauses the breathing exercise.
- **Personal preferences:** Save dark mode, height, weight, and body model selection in browser storage.
- **Responsive interface:** Layouts and browser tests cover desktop, tablet, mobile, narrow mobile, and landscape viewports.

## Getting started

### Requirements

- Node.js **22.12+** or **24**, with npm.
- A modern browser; WebGL support enables the interactive 3D body model.
- Google Chrome installed locally to run the configured end-to-end tests.

From the repository root:

```bash
npm ci
npm run dev
```

Open the URL printed in the terminal, normally [http://127.0.0.1:5173](http://127.0.0.1:5173). The development server opens the dashboard automatically.

Collaborators need access to the private GitHub repository to clone it. No application credentials or environment variables are required for the local launcher.

### Production build

```bash
npm run build
npm run preview
```

The combined application is written to `dist/`. Open the preview URL printed in the terminal.

| Route | Purpose |
| --- | --- |
| `/` | Main dashboard |
| `/dashboard.html` | Explicit dashboard entry point |
| `/emergency/index.html` | Standalone emergency prototype |

For the integrated experience, enter emergency mode from the dashboard. The local development and preview servers redirect legacy sign-in and registration URLs to the dashboard.

## Try the five-minute demo

1. Open the dashboard and review the telemetry readings.
2. Use **Pause demo**, **Resume demo**, or **Restart demo** to control playback.
3. Watch the readings progress through the scenario stages below.
4. Open **Help** to explore emergency assessment with the same telemetry clock.
5. Complete an assessment and select **Simulate sending data** to see the demonstration confirmation.
6. Return to the dashboard or select **Replay demo** after playback ends.

The fixture contains **60 fictional samples at five-second intervals** in `data/demo-telemetry.json`. Playback stops at **5:00** and does not loop automatically.

| Time | Scenario stage |
| --- | --- |
| 0:00–1:00 | Stable |
| 1:00–2:00 | Rising readings |
| 2:00–3:00 | Scripted alert |
| 3:00–4:00 | Recovery |
| 4:00–5:00 | Stable again |

The alert is a presentation event, not a clinical threshold or diagnosis. Live charts reveal captured samples as playback advances. Lab results, sleep records, readiness context, and long-term charts remain separate sample history.

## Data and persistence

| Data or action | Current behavior |
| --- | --- |
| Live telemetry | Replayed from the bundled JSON fixture; no live sensor feed |
| Demo clock | Shared between dashboard and emergency mode; synchronized across reloads and same-origin tabs through browser storage |
| Appearance and body preferences | Saved in this browser's local storage and synchronized across same-origin tabs and the emergency frame |
| Journal entries and reminder completion | Kept in memory for the current page session; cleared on reload |
| Daily check-ins | Validated locally with a simulated submission response |
| Emergency report sharing | Simulated success or failure; no report delivery |
| Emergency Data | Starts empty; connecting or importing records requires backend integration |

If storage is blocked, the current page and its emergency frame can still share an in-memory demo clock. Preference save failures are reported in Settings. If telemetry cannot load, the interface offers a retry instead of inventing readings. Closing emergency mode resets its assessment flow for the next opening.

Google Fonts requires network access. Voice recognition availability, microphone permission, and speech processing depend on the browser and its speech service; voice features should not be assumed to work offline. HEALium does not store recorded audio.

## Technology and architecture

The local app uses **React 19**, **TypeScript/JavaScript**, **Vite 7**, **Tailwind CSS 4**, and **Three.js**. Tests use **Vitest** and **Playwright**. CSV ingestion uses **csv-parse**.

```text
.
├── local/                       # React launcher and session-only action adapters
├── shared/                      # Telemetry, preferences, voice, body integration, styles
├── data/demo-telemetry.json      # Fictional telemetry fixture
├── index.html                   # Emergency prototype source document
├── dashboard.html               # Vite dashboard entry document
├── img/                         # Branding and procedure guide images
├── src/ingestion/               # Source adapters, validation, units, reading sinks
├── tests/                       # Browser tests and voice unit tests
├── Astronaut Health Dashboard/
│   └── Astronaut Health Dashboard/
│       └── src/                 # Original dashboard and Next.js/Payload sources
└── vite.config.js               # Local routing, action aliases, build packaging
```

`local/main.tsx` mounts the existing dashboard components from `Astronaut Health Dashboard/Astronaut Health Dashboard/src/app/(frontend)`. Vite aliases the dashboard's action imports to `local/local-actions.ts`, allowing the interface to run without the original backend credentials.

The emergency document runs in an iframe to isolate scripts, styles, canvas, and keyboard controls. Shared modules coordinate telemetry and preferences between both modes. The production build packages the emergency document, images, data, shared assets, and Three.js alongside the dashboard.

`shared/tokens.css` defines the common typography and palette; `shared/dashboard.css` and `shared/emergency.css` adapt the two interfaces. Three.js is bundled locally.

The original Next.js/Payload configuration is retained. **Use the root Vite launcher for local development.**

### Ingestion module

`src/ingestion` provides a separate gateway for reading validation, unit handling, source adapters, and an in-memory sink. Its simulated adapter reads the same fixture but does not drive the browser playback clock. Other source adapters remain explicitly disconnected; there is no connected sensor service or file-upload interface.

Programmatic CSV imports require `metric,value,unit,recordedAt` headers, with optional `subject,location,sensorId` fields. Reading identity includes source, metric, subject, location, sensor, and timestamp to support idempotent imports.

See the [ingestion documentation](src/ingestion/README.md) for the integration boundary and import details.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Build the combined dashboard and emergency app |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run ingestion regression tests and voice unit tests |
| `npm run test:e2e` | Build the app and run Playwright tests in installed Google Chrome |

Browser coverage includes navigation, responsive overflow, WebGL body alignment and resizing, procedure images and fallbacks, telemetry, voice controls, and simulated submission success and failure. Screenshots and retained failure traces are written to `.cache/browser-tests/`.

## Current limits

The prototype demonstrates interface behavior and a fictional mission scenario. Production use would require authenticated access, persistent health records, connected and validated data sources, a real report delivery service, and clinical review of assessment logic and procedure content.

Procedure imagery includes prototype illustrations and should not be treated as validated placement diagrams. Voice keyword suggestions require user confirmation and do not diagnose symptoms.

The repository's private visibility controls access to the source; it does not add authentication or health-data security to the running application.
