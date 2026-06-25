# Neighborhood Naming — Implementation Plan (record)

> Status: **implemented** (2026-06-25, commits up to `b455cd1`). This plan documents the work as executed,
> for the record. Spec: `docs/superpowers/specs/2026-06-25-neighborhood-naming-design.md`.

**Goal:** Label each Census tract with one or more nearby OSM-named neighborhoods (approximate, orientation
only) and surface those names in tract naming, search, and reports.

**Architecture:** A deterministic offline pipeline step maps tracts → neighborhoods via Voronoi
area-weighting (grid sampling + nearest-point), emitting static data the app already consumes. Pure logic
lives in `src/lib` (importable by the Node script and Vitest); the app reads the augmented `areas/*.json`.

**Tech stack:** Node ESM scripts, Overpass API (one-time, cached), SvelteKit app, Vitest. No new runtime
dependencies (no clipping/Voronoi libraries — sampling realizes the method).

## Global constraints
- Labels are approximate / orientation only; tracts remain the analytical unit (no neighborhood aggregation).
- No runtime OSM fetching — the mapping is committed static data; refresh by re-running the generator.
- Deterministic output (fixed grid + thresholds + alphabetical tie-break).
- OSM attribution required (ODbL); shown on Methods/Data.
- Additive data contract (validator unaffected); `npm run test` + `npm run build` stay green.

---

### Task 1: Pure geometry + assignment helpers (TDD)

**Files:**
- Create `src/lib/geo/pointInPolygon.js` + `src/lib/geo/pointInPolygon.test.js`
- Create `src/lib/neighborhoods/assign.js` + `src/lib/neighborhoods/assign.test.js`

**Interfaces (produced):**
- `pointInPolygon([lng,lat], geometry)` — ray casting; `ringContains`, `polygonContains` (handles holes + MultiPolygon).
- `haversineKm(a,b)`.
- `tractShares(tractGeom, points, opts)` → `{ shares:[{name,share}], nearestName, nearestDistKm }` — deterministic grid sample of the tract interior, each sample assigned to nearest point; shares = sample fraction, ranked, `share ≥ shareMin`, top `maxNames`.
- `tractLabel({shares, nearestDistKm, placeName, countyName}, opts)` → display string: `"X area"` (1), `"X / Y"` (2–3), or `placeName||countyName` when `shares` empty or `nearestDistKm > distCapKm`.
- `DEFAULTS = { grid:24, shareMin:0.15, maxNames:3, distCapKm:8 }`.

- [x] Tests written first (inside/outside/hole/MultiPolygon; single/split/far/threshold shares; label formats + fallbacks).
- [x] Implemented; `npx vitest run src/lib/geo src/lib/neighborhoods` → 11 passing.

### Task 2: Pipeline — `scripts/gen-neighborhoods.mjs`

**Files:** Create `scripts/gen-neighborhoods.mjs`; output `scripts/data/osm-places-raw.json` (cache, committed),
`static/data/areas/neighborhoods.json`, and augmented `static/data/areas/tracts.json`.

**Interfaces (consumed):** `geo/tracts.geojson`, `geo/counties.geojson`, `geo/places.geojson`,
`areas/{tracts,counties,places}.json`; helpers from Task 1.

Steps (as built):
- [x] **Acquire:** Overpass POST for `node["place"~"^(neighbourhood|suburb|quarter)$"]` in the region bbox
  (with `User-Agent`/`Accept` headers — Overpass 406s without them). Cache raw JSON; reuse cache unless `--refresh`.
  Abort cleanly (no output clobber) if no network and no cache.
- [x] **Filter + dedupe:** keep nodes whose point falls inside a county polygon (region filter + county tag);
  dedupe by `(name, county)`. Write `areas/neighborhoods.json` (304 points).
- [x] **Map:** per tract → `tractShares`; city fallback via `placeName(centroid)` over `places.geojson`, else county.
  Clear `neighborhoods` to `[]` on city/county fallback so search never maps a far neighborhood.
- [x] **Merge:** rewrite `areas/tracts.json` adding `neighborhoods:[{name,share}]` + `label`. (599/752 labeled.)
- [x] Ran generator; `node scripts/build-data.mjs` still ✓.

> Not added to the `npm run build` chain — it's a one-time generator like `gen-fixture`/`gen-geo`; outputs are committed.

### Task 3: App integration

**Files:** Modify `src/lib/data/areas.js`, `src/lib/components/AreaSearch.svelte`,
`src/routes/explore/+page.svelte`, `src/routes/methods/+page.svelte`, `src/routes/data/+page.svelte`.

- [x] `areas.js`: `loadAreas` derives neighborhood search entries from tract labels (`{geoid:'nb:Name', name, level:'neighborhood', tractGeoids, bbox}`); `areaName()` returns `label || name`; add `tractIdentifier()`.
- [x] `AreaSearch`: add `neighborhood → "Neighborhood"` to the result type labels (Fuse already indexes `name`).
- [x] `explore` `pickArea`: `level==='neighborhood'` → select the neighborhood's tracts (`clearTracts` + `addTract` each) and fit bounds to its combined bbox.
- [x] Reports inherit labels via `areaName()` (no change needed).
- [x] Methods page: "Neighborhood names" section (method + approximate caveat + OSM/ODbL attribution); Data page: list `neighborhoods.json` with attribution.

### Task 4: Verify

- [x] `npm run test` → 57 passing (13 files). `npm run build` → green.
- [x] Playwright: search "Plaza Midwood" → selects + zooms its 2 tracts; single tract header reads
  "Chantilly / Plaza Midwood"; spot-checked Mecklenburg labels (Myers Park, Derita, Concord Mills/Cox Mill)
  and rural fallback (Anson County).

## Notes / future
Curated name overrides, live OSM refresh, and neighborhood-level aggregation remain out of scope (see spec §8).
The derived crosswalk is an ODbL derived database (published openly).
