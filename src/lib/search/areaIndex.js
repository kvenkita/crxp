import Fuse from 'fuse.js';

/**
 * Build a fuzzy search index over areas (tracts, places, counties).
 * @param {{geoid:string,name:string,level:string}[]} areas
 */
export function buildAreaIndex(areas) {
	return new Fuse(areas, {
		keys: [
			{ name: 'name', weight: 0.8 },
			{ name: 'county', weight: 0.2 }
		],
		threshold: 0.4,
		ignoreLocation: true
	});
}

/** @param {import('fuse.js').default} index */
export function searchAreas(index, query, limit = 8) {
	if (!index || !query.trim()) return [];
	return index.search(query.trim()).slice(0, limit).map((r) => r.item);
}
