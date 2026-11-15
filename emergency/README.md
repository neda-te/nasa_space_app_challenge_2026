# HEALium emergency flow (prototype)

A guided assistant for medical emergencies: choose the type of emergency, answer a
few questions (where relevant, select the body region on a 3D model),
and get a rule-based assessment with likely causes, recommended on-board procedures,
step-by-step guides and red flags.

> **Prototype – not a medical device.** The vitals and crew records are demo data and
> the medical content is not validated clinical guidance. The page sends no data
> anywhere. See [../docs/simulated-data.md](../docs/simulated-data.md).

## How it is run

The folder is a static page without a build step. `vite.config.js` in the repository
root serves it at `/emergency/` during development and copies it to `dist/emergency/`
on build. The dashboard embeds it in an iframe (Help button). It can also be opened on
its own at `/emergency/index.html`.

## Structure

```
emergency/
├── index.html        Markup of the three screens; loads the stylesheet and the scripts
├── css/emergency.css Styles (fixed 16:9 stage, scaled with rem units)
├── img/              Photos for the step-by-step guides
└── js/
    ├── data/         Knowledge base (no logic)
    │   ├── regions-and-pain.js   Body regions, pain causes, crew records
    │   ├── flows.js              Questions per emergency type
    │   ├── procedures.js         On-board procedures and their guides
    │   ├── bleeding.js · injury.js · breathing.js · other.js · unconscious.js
    │   └── tooltips.js           Texts of the info tooltips
    ├── app/          Logic
    │   ├── state.js              State, DOM helpers, layout scaling, mission clock
    │   ├── navigation.js         Step route, stepper, footer buttons
    │   ├── screen-questions.js   Screen 2: questions and region selection
    │   ├── assessment.js         Screen 3: assessment rules and rendering
    │   ├── vitals.js             Live vitals strip (SIMULATED)
    │   ├── guide.js              Procedure guide dialog
    │   ├── interaction.js        Tooltips and the central click handler
    │   └── body-3d.js            3D body model (Three.js)
    └── main.js       Start-up call
```

## Important: script order

The files in `js/` are **classic scripts, not ES modules**. They share one global
scope, exactly like the single script block they were split from, and are loaded in
the order given in `index.html`: data first, then logic, `main.js` last. Changing the
order breaks the page. Converting them to ES modules (explicit imports and exports) is
a possible next step; it was not done so that the behaviour of the prototype stays
unchanged.

## External dependencies

- Three.js 0.149 from the jsDelivr CDN (3D body). Without it the flow falls back to
  region buttons.
- Google Fonts.
