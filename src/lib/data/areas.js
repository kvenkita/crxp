import { base } from '$app/paths';

let cache = null;

/**
 * Load tract + county + place area manifests once.
 * @returns {Promise<{tracts:any[], counties:any[], places:any[], byId:Map<string,any>}>}
 */
export async function loadAreas(fetchFn = fetch) {
	if (cache) return cache;
	cache = (async () => {
		const [tracts, counties, places] = await Promise.all([
			fetchFn(`${base}/data/areas/tracts.json`).then((r) => r.json()),
			fetchFn(`${base}/data/areas/counties.json`).then((r) => r.json()),
			fetchFn(`${base}/data/areas/places.json`).then((r) => (r.ok ? r.json() : []))
		]);
		const tag = (arr, level) => arr.map((a) => ({ ...a, level }));
		const all = [...tag(counties, 'county'), ...tag(places, 'place'), ...tag(tracts, 'tract')];
		const byId = new Map(all.map((a) => [a.geoid, a]));
		return { tracts, counties, places, all, byId };
	})();
	return cache;
}

export function areaName(areas, geoid) {
	return areas?.byId.get(geoid)?.name ?? geoid;
}
