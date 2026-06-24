import { base } from '$app/paths';
import { schemeColors } from '../map/colorScale.js';

const cache = new Map();

/** Lazily fetch + cache a per-indicator value file. */
export async function loadValueFile(id, fetchFn = fetch) {
	if (cache.has(id)) return cache.get(id);
	const p = fetchFn(`${base}/data/values/${id}.json`).then((r) => r.json());
	cache.set(id, p);
	return p;
}

/**
 * Extract a {geoid: value} map for a given year from a value file.
 * @param {{years:number[], values:Record<string,(number|null)[]>}} file
 * @param {number} year
 */
export function valuesForYear(file, year) {
	const yi = file.years.indexOf(year);
	const out = {};
	if (yi < 0) return out;
	for (const [geoid, arr] of Object.entries(file.values)) out[geoid] = arr[yi];
	return out;
}

/**
 * Resolve breaks + colors for a year from the value file's precomputed stats.
 * @returns {{breaks:number[], colors:string[], stats:object}}
 */
export function breaksAndColors(file, year, indicator) {
	const stats = file.stats?.[year] ?? { breaks: [], min: 0, max: 0 };
	const breaks = stats.breaks ?? [];
	const colors = schemeColors(indicator.colorScheme || 'YlGnBu', breaks.length + 1);
	return { breaks, colors, stats };
}
