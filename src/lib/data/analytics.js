import { base } from '$app/paths';

const zCache = new Map();
const lisaCache = new Map();

export async function loadZ(id, fetchFn = fetch) {
	if (zCache.has(id)) return zCache.get(id);
	const p = fetchFn(`${base}/data/analytics/z/${id}.json`).then((r) => r.json());
	zCache.set(id, p);
	return p;
}

export async function loadLisa(id, fetchFn = fetch) {
	if (lisaCache.has(id)) return lisaCache.get(id);
	const p = fetchFn(`${base}/data/analytics/lisa/${id}.json`).then((r) => r.json());
	lisaCache.set(id, p);
	return p;
}

/** {geoid: quadrant} for a year from a lisa file. */
export function quadForYear(file, year) {
	const yi = file.years.indexOf(year);
	const out = {};
	if (yi < 0) return out;
	for (const [geoid, arr] of Object.entries(file.quadrants)) out[geoid] = arr[yi];
	return out;
}
