# Carolinas Regional Explorer (CRXP) — Phase 1 App Redesign — Design Spec

_Date: 2026-06-24 · Status: approved · Supersedes: `ui-map-app` (Angular + ArcGIS)_

## 1. Context & goal

The **Carolinas Regional Explorer (CRXP)** is an extensible community-data platform for the 14-county
Charlotte region (NC: Anson, Cabarrus, Catawba, Cleveland, Gaston, Iredell, Lincoln, Mecklenburg, Rowan,
Stanly, Union; SC: York, Chester, Lancaster), modeled on the Charlotte-Mecklenburg **Quality of Life
Explorer**. Where QoL uses NPAs (clusters of block groups), CRXP uses **Census tracts** (~752). Audience:
residents, researchers, planners, policymakers. The platform is built to grow as more counties and partners
contribute data.

This is a **complete redesign**, replacing `ui-map-app` (Angular 19 + proprietary ArcGIS JS API, hardcoded
mocks, a 350-line `MapService` god object, and analytical tools buried in a low-discoverability sidebar).

This spec covers **Phase 1 (the application)**. Phase 2 (the data pipeline) is a separate effort; this spec
defines the **data contract** Phase 2 must produce.

### Locked decisions
- **Stack:** SvelteKit (Svelte 5 runes) + Vite, `@sveltejs/adapter-static`, deployed on Netlify.
- **Map engine:** MapLibre GL JS (open-source vector tiles + feature-state interactivity).
- **Data:** static prerendered files served from CDN — no live API/DB.
- **Geo levels:** tract = core map unit; county & city (Census place) as selectable overlay/aggregation levels.
- **Reports:** hybrid — prebuilt shareable county/city profiles (build-time OG cards) + custom build-your-own
  report (print/PDF). Reports phased: profiles v1, custom builder v2.
- **Design:** warm, light, accessible (WCAG AA), print-friendly, brand-aligned, responsive.
- **Scope:** full vision spec'd; shipped in phases (v1 MVP → v2+).

### Reference apps (reuse proven patterns)
- `mobility-explorer` (SvelteKit): prerendered profile pages, build-time OG images (`@napi-rs/canvas`),
  Fuse.js search, design-token CSS (Fraunces/DM Sans), `ComparePanel`, `PercentileStrip`, `DumbbellChart`,
  `MetroMapSnapshot`, build chain `build-data → build-og → build-sitemap → vite build`.
- `metrolina-mobility` (MapLibre): feature-state painting, animated SVG sparkline (staggered
  `stroke-dashoffset` draw-in), collapsible sidebar, glass floating panels, `OnboardingTour`.
- `quality-of-life-explorer`: data contract to emulate (`data.json` manifest, per-metric value files,
  `geography.geojson`) and **markdown metadata `m<id>.md`** (reuse format + portable content).

## 2. Architecture principle

**No god service.** All imperative MapLibre code is quarantined in one `MapController` class. Everything else
is dumb presentational components fed by small, single-purpose Svelte 5 rune state modules. Data flow is
**one-directional**: rune state → `$effect` → `controller.method()`. Map events flow up via callback props;
the page decides what state to set. The controller never writes back into rune state.

## 3. Routes (all prerendered; `adapter-static`)

| Route | Purpose | Notes |
|---|---|---|
| `/` | Landing: hero, region map, search, CTAs | |
| `/explore` | The explorer (map + browser + panels + analysis modes) | URL params = deep-linkable state |
| `/indicators` | Indicator catalog (categories → grid) | |
| `/indicators/[slug]` | Shareable indicator page | `entries()` over manifest |
| `/county/[fips]` | Prebuilt county profile + OG card | `entries()` over 14 counties |
| `/place/[fips]` | Prebuilt city/place profile + OG card | `entries()` over place manifest |
| `/report` | Custom report builder (client state) | **v2** |
| `/report/print` | Print-CSS target; state via `?config=` base64 | **v2** |
| `/methods` | Methodology (z-scores, LISA, sources, vintages) | |
| `/about` | About | |
| `/data` | Data download hub + dictionary | |

Profile/indicator pages use `+page.server.js` reading data **from disk via `node:fs` (not `fetch`)** so
SvelteKit does not inline the full dataset into every prerendered HTML file (mobility-explorer's pattern).
County and place are **separate route trees** (different layouts + `entries()` sources).

## 4. Components (single-responsibility)

- **Map:** `MapView.svelte` (owns lifecycle; only DOM/MapLibre toucher) → `lib/map/MapController.js` (plain
  class: `setIndicator`, `setGeoLevel`, `setHover`, `setSelected`, `setLegendFilter`, `setBivariate`,
  `setLisa`, `flyToArea`, `destroy`). `MapControls.svelte`, `GeoLevelToggle.svelte`.
- **Indicators:** `IndicatorBrowser.svelte` (variant `panel|grid`), `IndicatorSearch.svelte` (Fuse.js),
  `MetricInfoPanel.svelte` (renders `m<id>.md` — reused as indicator-page body), `MarkdownBlock.svelte`.
- **Legend (interactive — req #3):** `Legend.svelte` (discrete swatches; `onClassHover`/`onClassSelect` drive
  map feature-state dim/highlight), `LegendGradient.svelte`, `PercentileStrip.svelte`.
- **Charts (custom SVG, animated):** `TrendChart.svelte` (tract vs county avg vs region avg; staggered
  draw-in), `Sparkline.svelte`, `DumbbellChart.svelte`.
- **Compare:** `ComparePanel.svelte` (pin ≤ MAX_PINS), `PinButton.svelte`.
- **Search:** `AreaSearch.svelte` (Fuse.js over tracts/places/counties).
- **Analysis modes (discoverability fix):** `AnalysisModeBar.svelte` (`Explore | Bivariate | Spatial clusters`,
  always visible), `BivariatePanel.svelte` + `BivariateLegend.svelte` (3×3 from precomputed z-score terciles),
  `LisaPanel.svelte` + `LisaLegend.svelte` (HH/HL/LH/LL toggles from precomputed LISA).
- **Reports:** `ProfileHero`, `MetricCardGrid`, `MapSnapshot.svelte` (build-time PNG), `ShareButtons.svelte`,
  `Seo.svelte`; `ReportBuilder.svelte` + `ReportPrintLayout.svelte` (v2); `DataDownload.svelte`.

`MetricInfoPanel`, `TrendChart`, `Sparkline`, `MapSnapshot` are shared across explorer, profiles, and report
builder to stay in visual lockstep.

## 5. State (Svelte 5 runes — `lib/state/*.svelte.js`)

Small independent slices; the **page** composes them (no slice imports another):
`explorer` (indicatorId, year, geoLevel, basemap), `selection` (hover, selected, legendFilter),
`pins` (pinned areas + MAX_PINS), `analysis` (mode + bivariate/LISA params), `manifest` (load-once),
`urlSync` (state ↔ URL, e.g. `?i=median-income&y=2022&geo=tract&mode=lisa`). No store touches MapLibre.
`$derived` for computed values (e.g. breaks); never stored.

## 6. MapLibre integration

- **Geometry value-free; values join via feature-state.** Geometry carries only `geoid` (`promoteId`); on
  indicator/year change the controller fetches the per-indicator value file and `setFeatureState({v})` per
  feature; paint reads `["coalesce",["feature-state","v"], noDataColor]`.
- **Three composable feature-state keys:** `hover`, `selected`, `dim` (legend filter) — independent. Legend
  hover = transient dim; click = sticky.
- **Year transitions (v1):** `fill-opacity` cross-fade (~300ms) masking the value swap. Value-tween = v2.
- **Bivariate/LISA** reuse the same sources with alternate paint; `MapController.set*Mode()` fully resets paint
  + clears stale feature-state (no incremental expression mutation).
- **SSR guard:** dynamic `import('maplibre-gl')` inside `onMount`, `browser`-gated. Profiles use static PNG
  snapshots, never a live map at build.

## 7. Data contract (Phase 2 build target)

All static under `static/data/`. Goals: tiny initial payload, lazy per-indicator load, geometry decoupled
from values.

- **Geometry:** tracts as **PMTiles** (tippecanoe; carries only `geoid`); counties (14) + places (~100) as
  simplified GeoJSON (`mapshaper`); `tracts.simplified.geojson` for build-time OG/snapshot only.
  _Fallback:_ low-precision simplified tract GeoJSON if PMTiles proves fiddly.
- **Per-indicator values (lazy):** `/data/values/<id>.json` = `{ years[], values:{geoid:[byYear]},
  stats:{year:{min,max,p1,p99,breaks[]}} }` — breaks precomputed; client only paints.
- **Analytics (lazy):** `/data/analytics/z/<id>.json` (z + tercile class); `/data/analytics/lisa/<id>.json`
  (`{geoid:[{year,quadrant 0-4,sig}]}`).
- **Aggregates (load-once):** `/data/aggregates.json` = per-indicator `{countyAvg, regionAvg}` by year.
- **Manifest (eager):** `/data/manifest.json` — categories + per-indicator `{id, slug, label, category,
  format, decimals, higherIsBetter, colorScheme, classMethod, years[], geoLevels[], source, vintage,
  metaPath, related[], hasZ, hasLisa}`. Single source of truth.
- **Metadata:** `/data/meta/m<id>.md` — QoL convention (what/how/why/source/resources).
- **Area manifests:** `/data/areas/{counties,places,tracts}.json` = `{geoid,name,slug,bbox,population}`.

### Build-time generation (mirror mobility-explorer)
`build` = `node scripts/build-data.mjs && node scripts/build-og.mjs && node scripts/build-sitemap.mjs && vite build`
- `build-data.mjs`: validate/normalize Phase-2 outputs into the contract; fail on schema violations / missing
  breaks / geoid mismatches / dangling references.
- `build-og.mjs`: `@napi-rs/canvas` — 1200×630 PNG per county & place (`d3-geo` path + shared color scale +
  brand fonts) → `static/og/{county,place}/<fips>.png`.
- `build-sitemap.mjs`: static + canonical county/place/indicator URLs → `sitemap.xml` + `robots.txt`.

## 8. Phasing

**v1 (MVP):** `/`, `/explore`, `/indicators` + `/indicators/[slug]`, `/county/[fips]`, `/place/[fips]`,
`/methods`, `/about`, `/data`. Choropleth (PMTiles tracts + GeoJSON counties/places), year slider, indicator
browser, **interactive legend filtering**, `MetricInfoPanel` (markdown), `TrendChart` (animated), area +
indicator search, compare/pins, URL deep-linking. **Analysis mode bar with Bivariate + LISA from day one.**
Prebuilt county/place profiles + OG cards + sitemap. Opacity cross-fade year transitions.

**v2+:** custom report builder + PDF export; onboarding tour (localStorage-gated); data-download enrichment;
true value-tween transitions; satellite basemap; indicator-page OG cards; two-year comparison; mobile-optimized
analysis panels.

## 9. Risks & tradeoffs

1. **752 tracts:** PMTiles, not single-blob GeoJSON; values via feature-state (load-bearing decoupling).
2. **~115 prerendered profiles + OG images:** manageable; gate OG to major areas first; content-hash cache.
3. **MapLibre + SSR:** dynamic import + `browser` guard mandatory; profiles use static PNGs.
4. **Print/PDF:** client `window.print()` against `/report/print` (config in URL) — no backend.
5. **Year-slider thrash:** debounce commits; single `v` key + opacity cross-fade.
6. **Two analytics modes, one map:** explicit `set*Mode()` resets, never incremental paint mutation.
7. **Manifest single-point-of-failure:** `build-data.mjs` schema-validates + cross-checks referenced files.

## 10. Verification

- Per-stage: `npm run dev`, exercise feature in-browser (Playwright MCP for map interactivity).
- Vitest unit tests for state slices, `MapController` paint/break builders, markdown parsing.
- `npm run build` must succeed (validates contract + prerenders profiles/OG/sitemap) before deploy.
- Lighthouse/axe pass for WCAG AA; print preview of report layout.

## 11. Bootstrapping note

Because Phase 2 (pipeline) does not exist yet, Phase 1 ships with a **sample data fixture** conforming to the
contract above (a handful of real indicators + real tract geometry for the region), so the app builds and runs
before the pipeline lands. Phase 2 later replaces the fixture by producing the same contract.
