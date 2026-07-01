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
  on-map hatch for unreliable tracts. County values are the authoritative published county estimate
  (ACS county tables / CDC PLACES county / county zonal); the region is correctly pooled (sum, pooled
  rate, or population-weighted), with MOE carried through.
- **Comparable-period change.** 5- and 10-year change between **non-overlapping** ACS periods, with a
  significance test (so noise isn't read as change).
- **Bivariate analysis** — a 3×3 tercile choropleth plus a **correlation scatter** of standardized values
  (marginal distributions, regression line, **Pearson + Spearman**, two-way map↔dot hover), shown as
  descriptive only.
- **Spatial clusters (LISA)** — Local Moran's I with a without-replacement conditional-permutation null and
  **Benjamini–Hochberg FDR** control (computed in the data pipeline, shipped precomputed).
- **Researched briefs** — every indicator has a plain-language, cited *"why this matters"* brief with
  verified "Learn more" resources, plus an "About the data" provenance note.
- **County profiles** — one per county, with a real-polygon **inset/locator map**, a **14-county
  switcher**, metric cards, social sharing, and a standard attribution footer.
- **Custom reports** — a printable multi-tract report, **shareable on social media** (selection encoded in
  the URL), with the same attribution footer. Approximate OpenStreetMap neighborhood names aid orientation.
- **Find your neighborhood** — search by **street address** (region-filtered typeahead) or **use your
  current location** to jump straight to your tract. Address lookup goes through a small serverless
  geocoding function; geolocation is resolved in the browser by point-in-polygon.
- **Open-data downloads** — per-indicator **CSV** and **JSON**, or the complete dataset as a prebuilt
  **`.zip`** (refreshed on every build).
- **Navigation** — indicators are listed **alphabetically within each theme** (Character separated from the
  Quality-of-Life dimensions); dropdowns are grouped into **theme-colored** sections.
- **Provenance in context** — source vintage plus *model-based* and *pre-2020 harmonized* badges.

## Indicators

65 indicators across **8 active themes** — Character, Economy, Education, Engagement, Environment, Health,
Housing, Transportation (Safety and Arts & Culture are not yet populated). Data come from the U.S. Census
**ACS 5-Year** estimates (annual 2014–2024, 42 indicators), **CDC PLACES** (16 model-based health measures,
including health-related social needs), the USGS **National Land Cover Database** (incl. Tree Canopy Cover),
and **EOG VIIRS** nighttime lights.

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

Two Quarto documents are rendered and published to **GitHub Pages** by a GitHub Actions workflow on push:

- **Application technical documentation** (`docs/app-technical-documentation.qmd`) — architecture,
  components, routes, the data contract, and maintenance.
- **Methodology guide** (`docs/methodology-guide.qmd`) — how each indicator is computed, uncertainty
  handling, boundary harmonization, and the spatial methods (kept in sync with the `crxp-data` pipeline).

(Enable once in Settings → Pages → Source: "GitHub Actions".)

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

## License, attribution & citation

- **Code:** MIT (`LICENSE`). Copyright (c) 2026 Kailas Venkitasubramanian.
- **Data:** the produced dataset (`static/data/` and the downloads) is **CC BY 4.0** (`LICENSE-data.md`);
  please credit *"Carolinas Regional Explorer, UNC Charlotte Urban Institute."*
- **Trademarks:** "UNC Charlotte" and the crown logo are marks of The University of North Carolina at
  Charlotte and are **not** licensed for reuse; remove or replace them in derivatives.
- **Citation:** please cite the working paper — see `CITATION.cff`, which powers GitHub's
  "Cite this repository."

Upstream data are public-domain (U.S. Census / ACS, CDC PLACES, USGS NLCD, EOG VIIRS); neighborhood names
are © OpenStreetMap contributors (ODbL).

---

*A research project of the UNC Charlotte Urban Institute, in the lineage of the Charlotte-Mecklenburg
Quality of Life Explorer.*
