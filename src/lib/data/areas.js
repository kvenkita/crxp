import { base } from '$app/paths';

let cache = null;

/**
 * Load tract + county + place area manifests once, and derive neighborhood
 * search entries (each neighborhood -> the tracts it labels).
 * @returns {Promise<{tracts:any[], counties:any[], places:any[], neighborhoods:any[], all:any[], byId:Map<string,any>}>}
 */
export async function loadAreas(fetchFn = fetch) {
	if (cache) return cache;
	cache = (async () => {
		const [tracts, counties, places] = await Promise.all([
			fetchFn(`${base}/data/areas/tracts.json`).then((r) => r.json()),
			fetchFn(`${base}/data/areas/counties.json`).then((r) => r.json()),
			fetchFn(`${base}/data/areas/places.json`).then((r) => (r.ok ? r.json() : []))
		]);

		// derive neighborhood search entries from the tract labels
		const nbMap = new Map(); // name -> { geoids:[], bbox:[w,s,e,n], county }
		for (const t of tracts) {
			for (const n of t.neighborhoods ?? []) {
				let e = nbMap.get(n.name);
				if (!e) {
					e = { geoids: [], bbox: [...t.bbox], county: t.county };
					nbMap.set(n.name, e);
				}
				e.geoids.push(t.geoid);
				const b = t.bbox;
				e.bbox = [Math.min(e.bbox[0], b[0]), Math.min(e.bbox[1], b[1]), Math.max(e.bbox[2], b[2]), Math.max(e.bbox[3], b[3])];
			}
		}
		const neighborhoods = [...nbMap.entries()].map(([name, e]) => ({
			geoid: `nb:${name}`,
			name,
			county: e.county,
			level: 'neighborhood',
			tractGeoids: e.geoids,
			bbox: e.bbox
		}));

		const tag = (arr, level) => arr.map((a) => ({ ...a, level }));
		const all = [
			...tag(counties, 'county'),
			...tag(places, 'place'),
			...neighborhoods,
			...tag(tracts, 'tract')
		];
		const byId = new Map(all.map((a) => [a.geoid, a]));
		return { tracts, counties, places, neighborhoods, all, byId };
	})();
	return cache;
}

/** Display name for a geoid: neighborhood label for tracts, else the area name. */
export function areaName(areas, geoid) {
	const a = areas?.byId.get(geoid);
	return a?.label || a?.name || geoid;
}

/** The Census-tract identifier (e.g. "Census Tract 19"), for a secondary line. */
export function tractIdentifier(areas, geoid) {
	const a = areas?.byId.get(geoid);
	return a?.name ?? geoid;
}
