import { base } from '$app/paths';
import { themeRamp } from '../map/colorScale.js';

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
 * Resolve the indicator's CONSISTENT breaks (shared across years) + a theme-color
 * ramp. @param {object} file value file @param {string} baseColor theme hex
 * @returns {{breaks:number[], colors:string[], stats:{min:number,max:number,breaks:number[]}}}
 */
export function breaksAndColors(file, baseColor) {
	const breaks = file.breaks ?? [];
	const domain = file.domain ?? { min: 0, max: 0 };
	const colors = themeRamp(baseColor, breaks.length + 1);
	return { breaks, colors, stats: { min: domain.min, max: domain.max, breaks } };
}
