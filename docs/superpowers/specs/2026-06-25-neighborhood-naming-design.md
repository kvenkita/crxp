# Neighborhood Naming for Census Tracts — Design Spec

_Date: 2026-06-25 · Status: approved · Project: CRXP (crxp/)_

## 1. Problem & goal

Census tract numbers ("Census Tract 9") are not intuitive for residents trying to locate their
neighborhood. OpenStreetMap (OSM) contains named neighborhoods for the region. This feature derives a
**consistent, approximate mapping from each Census tract to one or more named neighborhoods** and uses those
names to **label** tracts in the UI, make them **searchable by neighborhood name**, and show them in
**reports**.

**Scope (locked):** neighborhood names are *labels/orientation only* — tracts remain the analytical unit.
- No new analytical/choropleth geography (neighborhood-level aggregation is out of scope; it overlaps the
  future community-defined NPA idea).
- No live OSM fetching at runtime; the mapping is a committed, deterministic pipeline output.
- No curated/editable name overrides in v1 (possible later addition).

**Feasibility (assessed):** OSM has ~362 `place=neighbourhood`/`suburb` nodes across the 14-county region with
rich, recognizable coverage in the urban core (Plaza Midwood, Myers Park, Elizabeth, Wilmore, …). In the US
these are **points** (name + location, no boundary), so the mapping associates points (via Voronoi area-
weighting) with tract polygons.

## 2. Mapping method — Voronoi area-weighting (sampling implementation)

Chosen because it directly yields "neighborhoods ranked by share of a tract's area," deterministically and
consistently region-wide, using only point-in-polygon + nearest-point (no polygon-clipping libraries).

For each tract:
1. Generate a **fixed, deterministic grid** of sample points over the tract's bbox (target ≈ 300 samples;
   grid step derived from bbox so it's reproducible). Keep only samples **inside** the tract polygon
   (ray-casting point-in-polygon).
2. Assign each interior sample to its **nearest** neighborhood point (Euclidean on lng/lat is acceptable at
   this scale) — i.e., the Voronoi cell it falls in.
3. A neighborhood's **share** of the tract = (its sample count) / (total interior samples).
4. Keep the **top ≤3** neighborhoods with `share ≥ SHARE_MIN` (e.g., 0.15), ordered by share.
5. **Rural fallback:** if the dominant neighborhood's point lies beyond `DIST_CAP` (e.g., ~8 km) from the
   tract centroid — i.e., no genuinely local neighborhood — drop neighborhood labels for that tract and fall
   back to its city/township (Census `place`) if available, else its county.

Determinism: fixed grid + fixed thresholds + a stable tie-break (alphabetical on equal share) → identical
output across runs. Tunable constants (`SAMPLE_TARGET`, `SHARE_MIN`, `DIST_CAP`, `MAX_NAMES`) defined once.

## 3. Data contract additions (`static/data/`)

- **`areas/neighborhoods.json`** — OSM points, region-filtered + deduped:
  `[{ name, lng, lat, type: 'neighbourhood'|'suburb'|'quarter', county }]`. Same-name points in different
  counties are kept distinct (disambiguated by county). Used for search and reference.
- **`areas/tracts.json`** — each tract gains:
  - `neighborhoods: [{ name, share }]` — ranked, ≤3, `share` rounded to 2 decimals (empty for rural-fallback
    tracts).
  - `label: string` — derived display label:
    - 1 name → `"Plaza Midwood area"`
    - 2–3 names → `"Plaza Midwood / Elizabeth"`
    - fallback → `"Concord"` (city) or `"Cabarrus County"` (county)
  - existing `name` ("Census Tract 9") is **kept** as the identifier.

The data-contract validator (`scripts/build-data.mjs`) does not require these fields (additive, non-breaking);
no change needed, but it must continue to pass.

## 4. Pipeline (`scripts/gen-neighborhoods.mjs`)

Runs **after** `gen-fixture` and `gen-geo` (needs `geo/tracts.geojson` + `areas/{tracts,places,counties}.json`).
Order: `gen-fixture → gen-geo → gen-neighborhoods`.

1. **Acquire OSM points:** Overpass query for `node["place"~"^(neighbourhood|suburb|quarter)$"]` within the
   region bbox. Cache the raw response to `scripts/data/osm-places-raw.json` (committed) so re-runs are
   reproducible/offline; if that cache exists, use it instead of re-querying (a `--refresh` flag forces a new
   query). Filter to points inside the region (within a county bbox), dedupe by `(name, county)`. Write
   `areas/neighborhoods.json`.
   - If the network/Overpass is unavailable and no cache exists, the script exits with a clear message and
     does **not** clobber existing outputs.
2. **Compute mapping:** load `geo/tracts.geojson`; for each tract run the §2 algorithm against the points;
   determine `neighborhoods` + `label` (using `areas/places.json` / `areas/counties.json` for fallback).
3. **Merge:** rewrite `areas/tracts.json` adding `neighborhoods` + `label` per tract.

Pure, testable helpers live in `src/lib/` (importable by the Node script and Vitest):
- `src/lib/geo/pointInPolygon.js` → `pointInPolygon([lng,lat], ring|polygon)` (ray casting).
- `src/lib/neighborhoods/assign.js` →
  - `tractShares(tractGeom, points, opts)` → `[{name, share}]` (sampling + nearest, ranked, thresholded).
  - `tractLabel({ shares, placeName, countyName }, opts)` → display `label` string.

## 5. App integration

- **Naming (`src/lib/data/areas.js`):** `areaName(areas, geoid)` returns the tract's `label` when present
  (else the existing name). A `tractIdentifier()` helper returns "Census Tract 9" for the secondary line.
  Used by the explore trend-panel header, the selection strip, and the report.
- **Search (`src/lib/search/areaIndex.js` + `AreaSearch.svelte`):** build neighborhood search entries from
  `neighborhoods.json`, each resolving to the **set of tracts** where that neighborhood appears in
  `neighborhoods` (top match). Picking a neighborhood selects those tracts and fits the map to their combined
  bounds. Fuse index gains `name` for neighborhood items; results show a "Neighborhood" type label.
- **Reports (`src/routes/report/+page.svelte`):** the area list / header shows each selected tract's `label`
  (with the tract number as secondary).
- **Honesty:** Methods + Data pages state names are approximate, OSM/community-sourced, for orientation; the
  "… area" phrasing reinforces it. Attribution: "Neighborhood names © OpenStreetMap contributors (ODbL)" on
  Data/Methods. (Derived crosswalk is an ODbL derived database under share-alike — fine, published openly.)

## 6. Edge cases

- Same neighborhood name in multiple counties → kept distinct, disambiguated by county in search.
- Points just outside a tract → handled by nearest-assignment (samples still pick the closest point).
- Very large rural tracts → `DIST_CAP` fallback to city/township → county.
- A neighborhood whose name equals its city → still shown; acceptable.
- Tracts with zero interior samples (degenerate geometry) → fallback to city/county label.

## 7. Verification

- **Unit (Vitest):** `pointInPolygon` (inside/outside/edge); `tractShares` (a known cluster yields expected
  ranked shares; far-only points trigger empty + fallback); `tractLabel` (1 / 2–3 / fallback formats).
- **Pipeline:** `node scripts/gen-neighborhoods.mjs` runs; `build-data` still passes; spot-check that a
  Myers Park / Plaza Midwood tract gets the expected names and a rural tract falls back to its city.
- **App (Playwright):** select a Charlotte tract → trend header shows the neighborhood label; search
  "Myers Park" → selects/zooms the mapped tract(s); a custom report lists neighborhood labels.
- `npm run test` green; `npm run build` green.

## 8. Out of scope / future
Neighborhood-level analytical aggregation; live OSM refresh; curated name overrides / local corrections;
multi-language names. These can build on the committed crosswalk later.
