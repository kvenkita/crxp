# CRXP Phase 1 App Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the v1 (MVP) Carolinas Regional Explorer: a SvelteKit + MapLibre static web app for exploring Census-tract quality-of-life indicators across the 14-county Charlotte region, with interactive legend filtering, animated trend charts, rich metadata, integrated bivariate + spatial-cluster analysis, and prebuilt county/city profile pages.

**Architecture:** SvelteKit (Svelte 5 runes) static site. One `MapController` class owns all imperative MapLibre code; dumb components are fed by single-purpose rune state slices; data flows one-way (state → `$effect` → controller). Indicator data is served as static files (manifest + lazy per-indicator value/analytics files + PMTiles/GeoJSON geometry); geometry is value-free and values join via MapLibre feature-state.

**Tech Stack:** SvelteKit, Svelte 5, Vite, `@sveltejs/adapter-static`, `maplibre-gl`, `pmtiles`, `fuse.js`, `d3-scale`/`d3-scale-chromatic`/`d3-geo`/`d3-array`, `marked` + `dompurify`, `@napi-rs/canvas` (build-time OG), Vitest + Testing Library, Playwright (via MCP) for interaction checks.

## Global Constraints

- Node 20+; SvelteKit 2.x; Svelte 5 (runes mode). `adapter-static`, `prerender = true` globally.
- No live API/DB. All data static under `static/data/`. Geometry value-free; values via feature-state.
- MapLibre must never run during SSR/prerender: dynamic `import('maplibre-gl')` inside `onMount`, `browser`-guarded.
- Region = NC FIPS 37007,37025,37035,37045,37071,37097,37109,37119,37159,37167,37179 + SC 45023,45057,45091.
- Design: warm light theme, WCAG AA, print-friendly, responsive. Fonts: Fraunces (display) + DM Sans (body).
- Metadata files use QoL `m<id>.md` convention. Manifest is the single source of truth.
- Frequent commits; conventional-commit messages. TDD for logic units.

---

### Task 0: Scaffold project, tooling, design system, base shell

**Files:**
- Create: `crxp/` SvelteKit project (`package.json`, `svelte.config.js`, `vite.config.js`, `.gitignore`, `tsconfig`/`jsconfig`).
- Create: `src/routes/+layout.svelte`, `src/routes/+layout.js`, `src/routes/+page.svelte`, `src/app.css`, `src/app.html`.
- Create: `static/fonts/` (Fraunces, DM Sans), `netlify.toml`.
- Test: `vitest.config.js` + `src/lib/_smoke.test.js`.

**Interfaces:**
- Produces: design tokens in `app.css` (CSS custom props: `--c-*` color, `--t-*` type scale, `--sp-*` spacing, `--r-*` radii, `--shadow-*`); `+layout.js` exports `export const prerender = true;`.

- [ ] **Step 1:** `npm create svelte@latest crxp` (skeleton, Svelte 5, JS w/ JSDoc, Vitest, Playwright). `cd crxp && git init && npm i`.
- [ ] **Step 2:** Install deps: `npm i maplibre-gl pmtiles fuse.js d3-scale d3-scale-chromatic d3-geo d3-array marked dompurify` and dev `@sveltejs/adapter-static @napi-rs/canvas @testing-library/svelte`.
- [ ] **Step 3:** Configure `adapter-static` in `svelte.config.js` (`fallback: '404.html'`), `+layout.js` global `prerender = true`.
- [ ] **Step 4:** Author `app.css` design tokens (warm palette ramp + neutrals, Fraunces/DM Sans @font-face, type/space/radii/shadow scales, focus-visible styles, `.sr-only`, print base). Brand shell in `+layout.svelte` (header w/ logo + nav: Explore/Indicators/Reports/Methods/About; skip-link; footer).
- [ ] **Step 5:** Landing `+page.svelte` placeholder hero + CTA to `/explore`. Add `netlify.toml` (build `npm run build`, publish `build`).
- [ ] **Step 6:** Smoke test (`expect(1+1).toBe(2)`); `npm run test` passes; `npm run dev` renders shell. Commit `chore: scaffold SvelteKit shell + design tokens`.

---

### Task 1: Sample data fixture + data-contract validator

Bootstraps the app before Phase 2 exists. Produce a small but real fixture and a build-time validator that enforces the contract.

**Files:**
- Create: `scripts/build-data.mjs` (validator/normalizer), `src/lib/data/contract.js` (shape constants + JS validators), `static/data/manifest.json`, `static/data/values/*.json`, `static/data/analytics/{z,lisa}/*.json`, `static/data/aggregates.json`, `static/data/areas/{counties,places,tracts}.json`, `static/data/meta/m*.md`, `static/data/geo/{counties,places}.geojson`, `static/data/geo/tracts.simplified.geojson` (+ `tracts.pmtiles` if available; else simplified GeoJSON fallback).
- Test: `src/lib/data/contract.test.js`, `scripts/build-data.test.mjs`.

**Interfaces:**
- Produces: `validateManifest(manifest)`, `validateValueFile(file, manifest)`, `crossCheck(dataDir)` → `{ok:boolean, errors:string[]}`. Manifest indicator shape per spec §7.

- [ ] **Step 1 (test):** `validateManifest` rejects missing `id/slug/category/format/years`, dup slugs; accepts a valid manifest. Run → fail.
- [ ] **Step 2:** Implement `contract.js` validators (pure functions, no fs). Run → pass.
- [ ] **Step 3 (test):** `validateValueFile` rejects geoid not in tracts area manifest, missing per-year `breaks`/`p99`; accepts valid. `crossCheck` flags dangling `metaPath`/value/analytics refs. Run → fail.
- [ ] **Step 4:** Implement; `build-data.mjs` reads `static/data`, runs validators, exits non-zero on error. Run → pass.
- [ ] **Step 5:** Hand-build fixture: pick ~8 indicators across ≥4 categories (e.g. median household income, % over 65, % bachelor's+, % owner-occupied, % no internet, % uninsured, % below poverty, life expectancy). Real tract geometry for the 14 counties (download TIGER 2022 tracts, filter to region FIPS, simplify with mapshaper to `tracts.simplified.geojson`; build `tracts.pmtiles` via tippecanoe if available). Real counties/places GeoJSON. Synthesize value files from the existing CRXP ACS CSVs where present, else plausible values; precompute per-year quantile `breaks`, `p1/p99`, z-scores, LISA quadrants (use the analytics builder from Task 8 prep), county/region aggregates. Author `m<id>.md` for each (port from QoL where the indicator matches).
- [ ] **Step 6:** `node scripts/build-data.mjs` exits 0. Commit `feat(data): sample fixture + contract validator`.

---

### Task 2: Manifest loader + rune state slices + URL sync

**Files:**
- Create: `src/lib/state/manifest.svelte.js`, `explorer.svelte.js`, `selection.svelte.js`, `pins.svelte.js`, `analysis.svelte.js`, `urlSync.js`.
- Test: `src/lib/state/explorer.test.js`, `pins.test.js`, `urlSync.test.js`.

**Interfaces:**
- Produces: `explorer` ($state {indicatorId, year, geoLevel, basemap}) + setters; `selection` {hover, selected, legendFilter}; `pins` {items[], MAX_PINS=6, togglePin(area), isPinned(geoid)}; `analysis` {mode:'explore'|'bivariate'|'lisa', biA, biB, lisaId, lisaQuadrants:Set}; `manifest` {load(), categories, indicators, byId(id), bySlug(slug)}; `urlSync` `stateToParams(state)`/`paramsToState(searchParams)`.

- [ ] **Step 1 (test):** `pins.togglePin` adds/removes, caps at MAX_PINS, `isPinned` correct. `urlSync` round-trips `{i,y,geo,mode,pins}`. Run → fail.
- [ ] **Step 2:** Implement slices + urlSync (pure). Run → pass.
- [ ] **Step 3:** `manifest.load()` fetches `/data/manifest.json` once (idempotent), exposes lookups. Commit `feat(state): rune slices + url sync + manifest loader`.

---

### Task 3: MapController logic + MapView + choropleth on /explore

**Files:**
- Create: `src/lib/map/colorScale.js` (expression + breaks/legend builders), `src/lib/map/MapController.js`, `src/lib/components/MapView.svelte`, `src/lib/components/MapControls.svelte`, `src/lib/components/GeoLevelToggle.svelte`, `src/lib/components/YearSlider.svelte`, `src/routes/explore/+page.svelte`, `src/routes/explore/+page.js`.
- Test: `src/lib/map/colorScale.test.js`.

**Interfaces:**
- Consumes: state slices (Task 2), value files (Task 1).
- Produces: `buildStepExpression(breaks, colors, noDataColor)` (MapLibre paint array reading `["feature-state","v"]`); `legendClasses(breaks, colors, format)` → `[{min,max,color,label}]`; `MapController` methods per spec §2/§6 + `applyValues(valuesByGeoid)`, `setMode(mode)`.

- [ ] **Step 1 (test):** `buildStepExpression` returns valid `["step",["coalesce",["feature-state","v"],-1], color0, b1, color1, ...]`; `legendClasses` formats `$`/`%`/decimals + min/max labels. Run → fail.
- [ ] **Step 2:** Implement `colorScale.js` (d3-scale-chromatic ramps by `colorScheme`). Run → pass.
- [ ] **Step 3:** `MapController.js`: dynamic-imported maplibre + pmtiles protocol; add tracts (PMTiles or GeoJSON)/counties/places sources w/ `promoteId:'geoid'`; fill/outline/highlight layers (fills below first symbol layer, highlight above); `applyValues` sets feature-state `v`; `setLegendFilter` sets `dim`; hover/select feature-state; `flyToArea`. No state imports.
- [ ] **Step 4:** `MapView.svelte`: `browser`-guard, `onMount` builds controller, `$effect`s bridge props→controller methods, emits `onHover`/`onSelect` callback props. `MapControls`, `GeoLevelToggle`, `YearSlider` (debounced commit). `/explore/+page.js` parses URL→initial state; `/explore/+page.svelte` composes MapView + controls, wires state, lazy-loads value file on indicator/year change, opacity cross-fade on year change.
- [ ] **Step 5 (verify):** `npm run dev`; Playwright MCP: load `/explore`, switch indicator, move year slider, confirm choropleth repaint + hover. Commit `feat(map): MapController + choropleth explorer`.

---

### Task 4: Interactive legend

**Files:**
- Create: `src/lib/components/Legend.svelte`, `src/lib/components/PercentileStrip.svelte`. Modify: `src/routes/explore/+page.svelte`.
- Test: covered by `colorScale.test.js` (legendClasses) + Playwright.

**Interfaces:**
- Consumes: `legendClasses` (Task 3), `selection` slice.
- Produces: `Legend` props `{classes, format, activeRange}` + callbacks `onClassHover(range|null)`, `onClassSelect(range|null)`.

- [ ] **Step 1:** `Legend.svelte` renders swatches w/ labels; hover→`onClassHover`, click→toggle `onClassSelect`; active class visually marked; keyboard-operable (role=button, arrow/enter). `PercentileStrip` shows hovered/selected tract position.
- [ ] **Step 2:** Wire in `/explore`: `onClassHover/Select` set `selection.legendFilter`; `$effect` → `controller.setLegendFilter(range)` (dims non-matching tracts).
- [ ] **Step 3 (verify):** Playwright: hover a legend class → only matching tracts highlighted; click → sticky; click again → clear. Commit `feat(legend): interactive class filtering`.

---

### Task 5: Indicator browser + metadata + markdown + indicator pages

**Files:**
- Create: `src/lib/components/IndicatorBrowser.svelte`, `IndicatorSearch.svelte`, `MetricInfoPanel.svelte`, `MarkdownBlock.svelte`, `src/lib/util/markdown.js`, `src/routes/indicators/+page.svelte`, `src/routes/indicators/[slug]/+page.server.js`, `+page.svelte`.
- Test: `src/lib/util/markdown.test.js`.

**Interfaces:**
- Produces: `renderMarkdown(md)` → sanitized HTML (marked+dompurify); `IndicatorBrowser` props `{manifest, selectedId, variant}` + `onSelect`; `MetricInfoPanel` props `{indicator, metaHtml}`.

- [ ] **Step 1 (test):** `renderMarkdown` renders headings/links, strips `<script>`. Run → fail → implement → pass.
- [ ] **Step 2:** `IndicatorBrowser` (accordion by category, panel|grid variants), `IndicatorSearch` (Fuse over indicator labels), `MarkdownBlock`, `MetricInfoPanel` (title/source/vintage/format + rendered `m<id>.md`).
- [ ] **Step 3:** `/indicators` catalog (grid). `/indicators/[slug]`: `entries()` from manifest, `+page.server.js` reads manifest + `m<id>.md` from disk via `node:fs`; page shows MetricInfoPanel + mini snapshot + region trend.
- [ ] **Step 4:** Wire browser + info panel into `/explore`. Commit `feat(indicators): browser + metadata + indicator pages`.

---

### Task 6: Animated trend charts

**Files:**
- Create: `src/lib/components/TrendChart.svelte`, `Sparkline.svelte`, `src/lib/data/aggregates.js`. Modify: `/explore/+page.svelte`.
- Test: `src/lib/data/aggregates.test.js`.

**Interfaces:**
- Produces: `loadAggregates()` cached fetch of `/data/aggregates.json`; `seriesFor(indicatorId, geoid, valueFile, aggregates)` → `[{label,values,color,dash,delay}]` (tract/county/region); `TrendChart` props `{series, years, currentYearIndex, format}`.

- [ ] **Step 1 (test):** `seriesFor` returns three aligned series with correct county (by geoid prefix) + region arrays. Run → fail → implement → pass.
- [ ] **Step 2:** `TrendChart.svelte`: SVG polylines, staggered `stroke-dashoffset` draw-in (`$effect` keyed on geoid; delays 0/150/300ms), current-year guide, mini legend. `Sparkline` one-series.
- [ ] **Step 3:** Show TrendChart on tract hover/select in `/explore` (debounced). Commit `feat(charts): animated trend + sparkline`.

---

### Task 7: Area search + compare/pins

**Files:**
- Create: `src/lib/components/AreaSearch.svelte`, `ComparePanel.svelte`, `PinButton.svelte`, `DumbbellChart.svelte`, `src/lib/search/areaIndex.js`. Modify: `/explore/+page.svelte`.
- Test: `src/lib/search/areaIndex.test.js`.

**Interfaces:**
- Produces: `buildAreaIndex(areas)` Fuse instance over tracts/places/counties; `ComparePanel` props `{pinned, indicator, year}` + `onUnpin`; `PinButton` props `{area}` (uses `pins` slice).

- [ ] **Step 1 (test):** `buildAreaIndex` finds a county by partial name, returns typed results. Run → fail → implement → pass.
- [ ] **Step 2:** `AreaSearch` (Fuse, keyboard nav, on pick → `controller.flyToArea` + select). `ComparePanel` (rows w/ Sparkline + value, unpin). `PinButton`, `DumbbellChart`.
- [ ] **Step 3:** Wire into `/explore`. Commit `feat(explore): area search + compare panel`.

---

### Task 8: Analysis modes — bivariate + spatial clusters

**Files:**
- Create: `src/lib/components/AnalysisModeBar.svelte`, `BivariatePanel.svelte`, `BivariateLegend.svelte`, `LisaPanel.svelte`, `LisaLegend.svelte`, `src/lib/map/bivariate.js`, `src/lib/analytics/build-analytics.mjs` (reused by Task 1 fixture). Modify: `MapController.js`, `/explore/+page.svelte`.
- Test: `src/lib/map/bivariate.test.js`, `src/lib/analytics/build-analytics.test.mjs`.

**Interfaces:**
- Produces: `bivariateColor(classA, classB, scheme)` → color (3×3 matrix); `buildBivariatePaint(scheme)` reading feature-state `za`,`zb`; `computeZScores(values)`, `computeLisa(values, neighbors)` (queen contiguity) → quadrant 0–4 + sig.
- Consumes: `analysis` slice; z/lisa files (Task 1).

- [ ] **Step 1 (test):** `bivariateColor` maps 3×3 to 9 colors; `computeZScores` mean0/sd1; `computeLisa` labels a known HH cluster. Run → fail → implement → pass.
- [ ] **Step 2:** `MapController.setBivariateMode(idA,idB)` (load z files, set `za/zb` feature-state, swap to bivariate paint), `setLisaMode(id, quadrants)` (load lisa, set `quadrant` state, dim deselected), `setExploreMode()` (full reset). `AnalysisModeBar` (Explore|Bivariate|Spatial clusters, always visible). `BivariatePanel`+`BivariateLegend` (interactive 3×3). `LisaPanel`+`LisaLegend` (quadrant toggles).
- [ ] **Step 3:** Wire `analysis` slice ↔ controller mode methods in `/explore`. URL-syncable.
- [ ] **Step 4 (verify):** Playwright: switch to Bivariate (two pickers → 3×3 map), switch to Spatial clusters (quadrant toggles filter), back to Explore (clean reset). Commit `feat(analysis): integrated bivariate + LISA modes`.

---

### Task 9: County & city profile pages + map snapshot

**Files:**
- Create: `src/routes/county/[fips]/+page.server.js`, `+page.svelte`; `src/routes/place/[fips]/+page.server.js`, `+page.svelte`; `src/lib/components/ProfileHero.svelte`, `MetricCardGrid.svelte`, `MapSnapshot.svelte`, `ShareButtons.svelte`, `Seo.svelte`.
- Test: Playwright route render.

**Interfaces:**
- Consumes: area manifests, value files, aggregates, OG paths (Task 10).
- Produces: profile pages composing ProfileHero + MetricCardGrid (Sparkline per indicator) + MapSnapshot (static PNG) + ShareButtons + Seo/JSON-LD.

- [ ] **Step 1:** `entries()` from counties/places area manifests; `+page.server.js` reads (disk, `node:fs`) the area + its indicator slices, trims payload to that area.
- [ ] **Step 2:** Build profile components; county page shows constituent places; place page shows "within county X". `MapSnapshot` references `/og/...` PNG (or `tracts.simplified.geojson` locator drawn client-side as fallback).
- [ ] **Step 3 (verify):** Playwright render `/county/37119` + a place; check headings, cards, share, no live map errors. Commit `feat(reports): county + city profile pages`.

---

### Task 10: Build pipeline (OG + sitemap), data download, methods/about, landing polish

**Files:**
- Create: `scripts/build-og.mjs`, `scripts/build-sitemap.mjs`, `src/routes/data/+page.svelte`, `src/routes/methods/+page.svelte`, `src/routes/about/+page.svelte`. Modify: `package.json` build script, landing `+page.svelte`.
- Test: build smoke (scripts exit 0; files emitted).

**Interfaces:**
- Produces: `static/og/{county,place}/<fips>.png`; `static/sitemap.xml` + `robots.txt`; build = `build-data && build-og && build-sitemap && vite build`.

- [ ] **Step 1:** `build-og.mjs` (`@napi-rs/canvas`, `d3-geo` path from simplified GeoJSON, shared color scale, brand fonts) → 1200×630 per county & place. Content-hash cache to skip unchanged.
- [ ] **Step 2:** `build-sitemap.mjs` enumerates static + county/place/indicator URLs.
- [ ] **Step 3:** `/data` download hub (links + generated dictionary from manifest), `/methods` (z-scores, LISA, sources, vintages), `/about`. Landing hero w/ animated region map background + search.
- [ ] **Step 4:** Wire build script order. `npm run build` succeeds end-to-end (validator + prerender all profiles/indicators + OG + sitemap). Commit `feat(build): OG + sitemap + data/methods/about + landing`.

---

### Task 11: Accessibility, responsive, build verification

**Files:** Modify across components; Create: `src/lib/components/OnboardingHint.svelte` (lightweight v1 hint; full tour deferred to v2).
- Test: axe + Playwright; Lighthouse.

- [ ] **Step 1:** Keyboard traversal for map controls, legend, browser, search; visible focus; ARIA labels; color-contrast audit of palette/ramps; `prefers-reduced-motion` disables chart/transition animation.
- [ ] **Step 2:** Responsive: collapsible explorer panels → bottom sheet on mobile; topbar stacks; profile/print layouts.
- [ ] **Step 3 (verify):** axe clean on `/explore`, a profile, an indicator page; Lighthouse a11y ≥ 95; `npm run build` green. Commit `feat(a11y): keyboard, ARIA, responsive, reduced-motion`.

---

## v2+ (out of scope for this plan — separate plan later)
Custom report builder (`/report` + `/report/print`) + print/PDF; full onboarding tour; data-download CSV bundles; true value-tween transitions; satellite basemap; indicator-page OG cards; two-year comparison; mobile-optimized analysis panels.

## Self-review notes
- **Spec coverage:** map/choropleth (T3), year slider+transition (T3), indicator browser (T5), interactive legend (T4), metadata+indicator pages (T5), animated trends (T6), analysis modes (T8), compare/search (T7), profiles+OG+sitemap (T9/T10), data contract+validator (T1), state architecture (T2), a11y/responsive (T11). Reports custom-builder + tour correctly deferred to v2 per spec §8.
- **Type consistency:** feature-state keys `v/dim/hover/selected/za/zb/quadrant` used consistently across T3/T4/T8; `legendClasses`/`buildStepExpression` names stable T3→T4.
- **Bootstrapping:** T1 fixture lets the app build before Phase 2 pipeline exists (spec §11).
