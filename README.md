# HEALium – local dashboard and emergency mode

## Run locally

From this folder, using Node.js 22.12+ (or 24):

```powershell
npm install
npm run dev
```

Open the local URL printed in the terminal (normally http://127.0.0.1:5173/).
The launcher opens the dashboard automatically. Click **Help** beside Notifications
for the full-screen emergency flow. **Back to dashboard** returns to the same
page, crew selection, and dashboard settings. Closing emergency mode resets its
prototype flow the next time it is opened.

## Production build

```powershell
npm run build
npm run preview
```

Open the URL printed by the preview server. The `dist` folder contains the
combined app. The dashboard is available at `/` and `/dashboard.html`, and the
original emergency prototype is available at `/emergency/index.html`.

## What is preserved

- The dashboard components and styles remain in
  `Astronaut Health Dashboard/Astronaut Health Dashboard/src/app/(frontend)`.
- `index.html` and `img/` contain the emergency prototype sources.
  The launcher serves them in an iframe to isolate their CSS, scripts, canvas,
  and keyboard controls. The build copies them into `dist/emergency/`.
- `local/main.tsx` mounts the existing dashboard without the Figma server runtime.
- Sign-in has been removed from the app. Legacy `/login`, `/signin`, `/sign-in`,
  `/register`, and `/signup` URLs redirect to the dashboard in the local servers.
- `local/local-actions.ts` supports reminders and journal entries in memory for
  the current session. Reloading clears these records. Check-ins and sharing
  are explicitly simulated; no authentication or delivery service is implied.
  Emergency Data starts empty locally; connecting or importing records is a
  separate backend integration.
- The original Next.js/Payload configuration and backend files are retained.
  This local launcher does not need their platform-owned credentials.

`shared/tokens.css` defines both modes' typography and palette. Responsive layout
styles live in `shared/dashboard.css` and `shared/emergency.css`. Three.js is
bundled locally; fonts still load from Google Fonts. The prototype includes a
region-button fallback when Three.js is unavailable.

The shared theme uses `#F4F6FB` for the background, `#FFFFFF` for cards,
`#D83933` for emergency states, `#0032A0` for primary controls, and `#14234A`
for primary text. Headings use Inter, body text uses Public Sans, and technical
readings and timestamps use DM Mono. Warning and success states keep distinct
semantic colors.

Dashboard Settings also saves dark mode, height (cm), weight (kg), and the
female/male schematic body model selection in this browser's local storage.
These preferences restore after reload and synchronize across same-origin tabs
and the emergency iframe. They are separate from session-only journals and
check-ins; they are not sent to a backend. If browser storage is unavailable,
the settings form reports a save error.

The dashboard's body preview and emergency mode share the same interactive 3D
renderer. Breathing opens a full-screen view with a reserved safety toolbar for
Emergency and Go back; opening emergency mode pauses the exercise. The alerts
panel and CO₂ history show explicitly labeled sample data. Circled information
icons support hover, keyboard focus, and tap, with viewport-bounded tooltips.

The emergency assessment has a **Simulate sending data** button. The requested
confirmation appears only after the simulated response succeeds, alongside an
explicit **Simulation only · no data transmitted** status. No report reaches a
flight surgeon. Failed submissions show an error and allow a retry.

## Browser verification

```powershell
npm run test:e2e
```

This builds the production app and tests it in headless Google Chrome (Chrome
must be installed). Tests cover desktop, tablet, mobile, narrow mobile, and
landscape sizes, including navigation, text overflow, actual WebGL body alignment
and resizing, and simulated submission success/failure. Screenshots and failure
traces are written to `.cache/browser-tests/`.
