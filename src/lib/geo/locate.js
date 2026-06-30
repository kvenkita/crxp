// Tract index for address/location lookup: load the region's tract polygons once,
// then test region membership (by geoid) and find the tract containing a point.
import { pointInPolygon } from './pointInPolygon.js';

let _cache = null;

/** Load (and cache) the tract FeatureCollection -> { ids:Set<geoid>, feats:[] }. */
export async function loadTractIndex(basePath = '', fetchFn = fetch) {
	if (_cache) return _cache;
	const r = await fetchFn(`${basePath}/data/geo/tracts.geojson`);
	if (!r.ok) throw new Error('tracts geojson unavailable');
	const fc = await r.json();
	const feats = fc.features ?? [];
	const ids = new Set(feats.map((f) => f.properties?.geoid).filter(Boolean));
	_cache = { ids, feats };
	return _cache;
}

/** True if a tract geoid belongs to the region. */
export function inRegion(index, geoid) {
	return !!geoid && index.ids.has(geoid);
}

/** Geoid of the tract containing [lon,lat], or null if the point is outside the region. */
export function tractAtPoint(index, lon, lat) {
	for (const f of index.feats) {
		if (pointInPolygon([lon, lat], f.geometry)) return f.properties?.geoid ?? null;
	}
	return null;
}

/** Test-only: reset the module cache. */
export function _resetCache() {
	_cache = null;
}
