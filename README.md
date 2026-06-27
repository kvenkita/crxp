# Carolinas Regional Explorer (CRXP)

An open, uncertainty-aware platform for exploring **small-area (census-tract) community indicators**
across the 14-county Charlotte region (11 NC + 3 SC counties; ~752 2020 census tracts). The app renders
interactive choropleths, trends, and spatial analyses entirely in the browser from a static, versioned
data contract.

**Stack:** SvelteKit (Svelte 5 runes) · MapLibre GL · static prerendered data · `@sveltejs/adapter-static`.

## Features

- **Choropleth explorer** with quantile class breaks held consistent across years, an interactive legend
  that filters the map, and a year slider.
- **Uncertainty, first-class.** Estimates carry a 90% **margin of error** (band on the trend), a
  **reliability** flag (ok / caution / unreliable from the coefficient of variation), and an optional
  on-map hatch for unreliable tracts. County/region lines are labeled "avg of tracts" with their MOE
  propagated.
- **Comparable-period change.** 5- and 10-year change between **non-overlapping** ACS periods, with a
  significance test (so noise isn't read as change).
- **Bivariate analysis** — a 3×3 tercile choropleth plus a **correlation scatter** of standardized values
  (marginal distributions, regression line, **Pearson + Spearman**, two-way map↔dot hover), shown as
  descriptive only.
- **Spatial clusters (LISA)** — Local Moran's I with a without-replacement conditional-permutation null and
  **Benjamini–Hochberg FDR** control (computed in the data pipeline, shipped precomputed).
- **Researched briefs** — every indicator has a plain-language, cited *"why this matters"* brief with
  verified "Learn more" resources, plus an "About the data" provenance note.
- **County profiles** — one per county, with a real-polygon **inset/locator map**, a seamless **14-county
  switcher**, metric cards, social sharing, and a standard attribution footer.
- **Custom reports** — a printable multi-tract report, **shareable on social media** (selection encoded in
  the URL), with the same attribution footer. Approximate OpenStreetMap neighborhood names aid orientation.
- **Open-data downloads** — per-indicator **CSV** and **JSON**, or the complete dataset as a prebuilt
  **`.zip`** (refreshed on every build).
- **Navigation** — indicators are listed **alphabetically within each theme** (Character separated from the
  Quality-of-Life dimensions); dropdowns are grouped into **theme-colored** sections.
- **Provenance in context** — source vintage plus *model-based* and *pre-2020 harmonized* badges.

## Indicators

52 indicators across **7 active themes** — Character, Economy, Education, Environment, Health, Housing,
Transportation (Engagement, Safety, and Arts & Culture are planned). Data come from the U.S. Census
**ACS 5-Year** estimates (annual 2014–2024), **CDC PLACES**, the USGS **National Land Cover Database**
(incl. Tree Canopy Cover), and **EOG VIIRS** nighttime lights.

The data is produced by a separate, open data pipeline and delivered to this app as the static contract in
`static/data/` (see below). This repository contains the **application only**.

## Develop

```sh
npm install
npm run dev          # http://localhost:5173
npm run test         # vitest
npm run check        # svelte-check
```

## Build & deploy

```sh
npm run build        # validate the data contract + prebuild downloads + prerender
npm run build:full   # + OG cards + sitemap (production)
npm run preview
```

`build` runs `build:data` (contract validation) and `build:zip` (prebuilds the per-indicator CSVs and the
`crxp-data.zip` download artifact under `static/downloads/`, git-ignored) before the Vite prerender.

Deployed as a static site on **Netlify** (`netlify.toml`: `npm run build:full`, publish dir `build/`).
No server or database at runtime. Non-prerendered routes fall back to `404.html` (adapter-static).

## Documentation

Architecture and maintenance details live in `docs/app-technical-documentation.qmd` (Quarto). On push,
a GitHub Actions workflow renders it and publishes it to **GitHub Pages** (Settings → Pages → Source:
"GitHub Actions").

## Architecture

- **No god component.** All imperative MapLibre code lives in `src/lib/map/MapController.js`; UI components
  are presentational; small rune state slices (`src/lib/state/*.svelte.js`) hold app state; `/explore`
  composes them and drives the controller one-directionally (state → `$effect` → controller method).
- **Geometry is value-free.** Tract/county geometry carries only `geoid`; indicator values join at runtime
  via MapLibre feature-state, so one geometry serves every indicator and year.
- **Lazy data.** The manifest loads once; per-indicator value/analytics files load on demand.
- **Analytics are precomputed.** z-scores and LISA come from the pipeline (single statistical source of
  truth); the app does not recompute them.

## Data contract (`static/data/`)

The app consumes static files validated by `scripts/build-data.mjs` (the build fails on any violation):

| Path | Purpose |
|---|---|
| `manifest.json` | indicator catalog + theme categories + `schemaVersion` |
| `geo/tracts.geojson`, `geo/counties.geojson` | geometry (geoid only) |
| `values/<id>.json` | per-indicator values + **MOE / CV / reliability** + per-year breaks/stats |
| `analytics/z/<id>.json`, `analytics/lisa/<id>.json` | bivariate z-scores, FDR-controlled LISA quadrants |
| `aggregates.json` | county + region averages (and their MOE) by year |
| `areas/{tracts,counties,places}.json` | area manifests (drive prerender + search) |
| `meta/m<id>.md` | indicator metadata (what / how / why / source) |
| `provenance.json` | library + GDAL/PROJ versions that produced the data |

## Tests

`vitest` covers the analytics helpers (z-scores, quantile breaks, Pearson/Spearman), the trend-series
builder, and the data-contract gate. Run `npm run test`.

## Roadmap

Broaden data breadth (jobs/LODES, housing affordability/CHAS, life expectancy, air quality, food access);
activate the Engagement, Safety, and Arts & Culture themes; add a composite equity index, demographic
disaggregation, data export, and accessibility improvements.

---

*A research project in the UNC Charlotte Urban Institute lineage (Charlotte-Mecklenburg Quality of Life
Explorer). Indicator data is public-domain (U.S. Census, CDC, USGS, EOG); neighborhood names © OpenStreetMap
contributors (ODbL). Application license to be finalized.*
