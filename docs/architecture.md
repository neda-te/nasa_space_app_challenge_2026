# Architecture

This document explains how the code is organised, which part is responsible for what,
and the rules that keep it that way.

## 1. Parts of the system

| Part            | Folder       | Technology                          | Runs where                         |
| --------------- | ------------ | ----------------------------------- | ---------------------------------- |
| Dashboard       | `src/`       | React 19, TypeScript, Vite          | Browser                            |
| Emergency flow  | `emergency/` | Plain HTML / CSS / JavaScript, Three.js | Browser (iframe inside the dashboard) |
| Backend         | `backend/`   | Next.js, Payload CMS                | Server                             |
| Ingestion gateway | `src/ingestion/` | TypeScript, no framework        | Anywhere (browser, server, tests)  |

The dashboard can run in two hosts:

- **Local preview** (`npm run dev`): Vite serves the dashboard as a static site.
  No server exists, so nothing can be saved.
- **Server host** (`backend/`): Next.js renders the same dashboard and connects it
  to the Payload backend.

Both hosts mount the same `<App>` component. They differ only in the backend
implementation they hand to it (section 4).

## 2. Layers of the dashboard (`src/`)

```
app/         shell, navigation, global state         may import: features, shared, services
features/    one folder per page / function          may import: shared, data, services
shared/      reusable UI parts and types             may import: nothing above it
data/        simulated demo datasets                 may import: types only
services/    contract to the backend                 may import: nothing above it
ingestion/   data-source gateway                     may import: data (simulated source only)
styles/      stylesheets
```

Rules:

1. **Dependencies point downwards.** `shared/`, `data/`, `services/` and `ingestion/`
   never import from `features/` or `app/` (type-only imports are the one exception:
   `data/simulated/trends.ts` uses the types of `features/trends`).
2. **A feature owns its code.** Components, configuration and types that are used by
   one feature live in that feature's folder. Only code used by several features moves
   to `shared/`.
3. **Features are composed by the shell.** Pages are wired together in `app/App.tsx`.
   Imports from one feature into another are the exception; there are exactly three:
   `lab-data` uses the tab bar of `physical-health` (the lab pages are sub-pages of it),
   `customize` edits the widget catalogue of `dashboard`, and `check-in/WellnessModal`
   uses the scene type of `breathing`.
4. **No direct backend imports.** Components reach the backend through `useBackend()`.
5. **Simulated values are marked.** Every file in `data/simulated/` carries a
   `SIMULATED DATA` notice, see [simulated-data.md](simulated-data.md).

### Naming

| Kind of file                | Convention                 | Example                              |
| --------------------------- | -------------------------- | ------------------------------------ |
| React component             | `PascalCase.tsx`, named export | `features/journal/JournalPage.tsx` |
| Logic, configuration, data  | `kebab-case.ts`            | `features/dashboard/mission-tasks.ts` |
| Types of a feature          | `types.ts`                 | `features/trends/types.ts`           |
| Tests                       | `*.test.ts` next to the code | `ingestion/ingestion.test.ts`      |

Every file starts with a comment that states its purpose; exported components,
functions and types are documented with JSDoc.

## 3. App shell, state and navigation

`app/App.tsx` is the only stateful hub:

| State                         | Meaning                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `page`                        | Which feature page is shown (`Page` in `shared/types.ts`) |
| `widgets`, `chart`, `size`    | Layout of the home dashboard (edited in `customize/`)    |
| `privateData`                 | Signed-in user, reminder completions, journal entries    |
| `dailyScore`                  | Fatigue score from today's check-in                      |
| `wellnessModal`, `authModalOpen`, `emergencyOpen` | Which overlay is open                |

Navigation is state-based (`setPage`); there is no URL router. Pages receive what
they need as props (`go`, data, callbacks) and keep purely local UI state themselves.

The sidebar entries are defined in `app/navigation.ts`. To add a page:

1. Create `features/<name>/<Name>Page.tsx`.
2. Add its id to `Page` in `shared/types.ts`.
3. Add a navigation entry in `app/navigation.ts` and a title in `pageNames` (`App.tsx`).
4. Render it in `App.tsx` (`{page === '<Id>' && <NamePage />}`).
5. Put its styles in `styles/features/<name>.css` and import the file at the end of
   `styles/index.css`.

## 4. Backend contract (`src/services/backend/`)

| File                 | Role                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `contract.ts`        | Types of all exchanged data and the `BackendActions` interface      |
| `BackendContext.tsx` | `<BackendProvider>` and the `useBackend()` hook                     |
| `local-preview.ts`   | Implementation without a server: every action reports "unavailable" |

The server implementation is `backend/src/actions/` (`serverBackend`).

```
local preview:  src/main.tsx                       -> <BackendProvider actions={localPreviewBackend}>
server host:    backend/src/app/(frontend)/page.tsx -> <BackendProvider actions={serverBackend}>
```

Because both implementations satisfy the same interface, the UI code is identical
in both hosts, and the TypeScript compiler reports any mismatch between UI and server.

Every action returns a result object (`{ success: true, data }` or
`{ success: false, message }`) instead of throwing, so the UI can always show a
message to the user.

## 5. Backend (`backend/`)

```
backend/src/
├── payload.config.ts     Payload configuration: registers the collections
├── collections/          Data model and access rules, one file per collection
├── actions/              Server actions (implementation of BackendActions)
├── lib/                  Server helpers: Payload client, session, queries
└── app/
    ├── (frontend)/       Dashboard page rendered on the server
    └── (payload)/        Payload admin panel and REST / GraphQL API (generated)
```

Security principles:

- Every query runs with `overrideAccess: false` and the acting user, so the access
  rules of the collection are always applied.
- Private records (journal, check-ins, reminders) are readable only by their owner.
- Fields the server owns (owner, timestamps, astronaut code) are set in collection
  hooks and cannot be set by the client.
- The session token is kept in an http-only cookie.

Details and the runtime status: [backend/README.md](../backend/README.md).

## 6. Data ingestion (`src/ingestion/`)

The gateway is the single, prepared entry point for external data:

```
source adapter -> raw measurements -> normalise + validate -> readings -> sink
```

It is independent of React and of the backend, fully typed and covered by unit tests.
It is **not wired into the UI yet**. See [data-ingestion.md](data-ingestion.md).

## 7. Emergency flow (`emergency/`)

A self-contained static page without a build step: knowledge base in `js/data/`,
logic in `js/app/`. The dashboard shows it in an iframe inside a dialog, which keeps
its styles, global scripts, 3D canvas and keyboard shortcuts separate from the
dashboard. See [emergency/README.md](../emergency/README.md).

## 8. Styles (`src/styles/`)

`index.css` imports one file per concern. **The import order is the cascade order
and must not be changed**: the light theme in `theme/` overrides the base component
styles before it.

```
base/      design tokens, base element styles
layout/    app shell, footer, responsive rules
shared/    buttons, tags, badges, page elements
features/  one file per feature
theme/     light "HEALium workspace" theme (overrides)
```

Tailwind CSS is loaded for its reset and a few utility classes; components are
styled with the semantic classes of these files.

## 9. Build and quality checks

| Check       | Command             | What it covers                                    |
| ----------- | ------------------- | ------------------------------------------------- |
| Types       | `npm run typecheck` | `src/`, strict mode                              |
| Unit tests  | `npm test`          | Ingestion gateway (validation, units, file import) |
| Build       | `npm run build`     | Dashboard bundle plus a copy of `emergency/`      |

`vite.config.js` contains one small plugin that serves `emergency/` in development
and copies it to `dist/emergency/` on build.
