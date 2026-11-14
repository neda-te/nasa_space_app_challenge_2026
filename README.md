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
- `index.html` and `img/` remain the original emergency prototype sources.
  The launcher serves them in an iframe to isolate their CSS, scripts, canvas,
  and keyboard controls. The build copies them into `dist/emergency/`.
- `local/main.tsx` mounts the existing dashboard without the Figma server runtime.
- `local/local-actions.ts` provides explicit availability errors for features
  that require Figma Make: sign-in, private journal, reminders, and saved health
  check-ins. It does not simulate authentication or store private health data.
  Emergency Data starts empty locally; connecting or importing records is a
  separate backend integration.
- The original Next.js/Payload configuration and backend files are retained.
  This local launcher does not need their platform-owned credentials.

Fonts and the emergency prototype's Three.js library load from their existing
external providers, so internet access is needed for the original fonts and 3D
body display. The prototype includes a region-button fallback when Three.js is
unavailable. This remains a simulated research prototype.
