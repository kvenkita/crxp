# Carolinas Regional Explorer (CRXP)

An extensible community-data platform for the 14-county Charlotte region. Explore quality-of-life
indicators across Census tracts, with interactive legend filtering, animated trend charts, integrated
bivariate and spatial-cluster (LISA) analysis, and prebuilt county profiles.

**Stack:** SvelteKit (Svelte 5 runes) · MapLibre GL · static prerendered data · `adapter-static`.

See the design spec in [`docs/superpowers/specs/`](docs/superpowers/specs/) and the implementation plan in
[`docs/superpowers/plans/`](docs/superpowers/plans/).

## Develop

```sh
npm install
npm run dev          # http://localhost:5173
npm run test         # vitest
```

## Build

```sh
npm run build        # validate data + prerender (fast)
npm run build:full   # + OG cards + sitemap (production)
npm run preview
```

Deployed as a static site (Netlify config in `netlify.toml`, publish dir `build/`).

## Architecture

- **No god service.** All imperative MapLibre code lives in `src/lib/map/MapController.js`. Components are
  presentational; small rune state slices (`src/lib/state/*.svelte.js`) hold app state; the `/explore` page
  composes them and drives the controller one-directionally (state → `$effect` → controller method).
- **Geometry is value-free.** Tract/county geometry carries only `geoid`; indicator values join at runtime
  via MapLibre feature-state, so one geometry serves every indicator/year.
- **Lazy data.** The manifest loads once; per-indicator value/analytics files load on demand.

## Data contract (`static/data/`)

The app consumes static files — this is the **build target for the Phase 2 pipeline**:

| Path | Purpose |
|---|---|
| `manifest.json` | indicator catalog + config (single source of truth) |
| `geo/tracts.geojson`, `geo/counties.geojson` | geometry (geoid only) |
| `values/<id>.json` | per-indicator values + precomputed per-year breaks/stats |
| `analytics/z/<id>.json`, `analytics/lisa/<id>.json` | bivariate z-scores, LISA quadrants |
| `aggregates.json` | county + region averages by year |
| `areas/{tracts,counties,places}.json` | area manifests (drive prerender + search) |
| `meta/m<id>.md` | indicator metadata (what / how / why / source) |

`scripts/build-data.mjs` validates this contract and fails the build on any violation.

## Bootstrapping fixture

`scripts/gen-fixture.mjs` builds the current `static/data/` from existing Charlotte Regional Explorer
source assets (ACS 2018–2023 + tract geometry). It stands in for the Phase 2 pipeline, which will replace
it by producing the same contract from a broader set of sources (CDC Places, FCC, USDA, HUD, USALEEP,
Opportunity Atlas, SVI, Eviction Lab) plus dissolved county and municipal boundaries.

## Known v1 limitations

- County boundaries are simplified bounding-box extents (Phase 2 will publish dissolved polygons).
- City/place profiles are routed/architected but **data-pending** (no municipal boundaries in the fixture yet).
- Year transitions cross-fade opacity; per-feature value tweening is a v2 item.

## v2+ roadmap

Custom report builder + print/PDF · onboarding tour · richer data downloads · true value-tween transitions ·
satellite basemap · indicator-page OG cards · two-year comparison.
