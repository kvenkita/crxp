import { base } from '$app/paths';

let cache = null;

/** Load + cache the precomputed county/region aggregates file. */
export async function loadAggregates(fetchFn = fetch) {
	if (cache) return cache;
	cache = fetchFn(`${base}/data/aggregates.json`).then((r) => r.json());
	return cache;
}

/** Region average for an indicator at a given year. */
export function regionAvgAt(aggregates, indicatorId, year) {
	const a = aggregates?.[indicatorId];
	if (!a) return null;
	const yi = a.years.indexOf(year);
	return yi < 0 ? null : a.regionAvg[yi];
}

/** County average (by county FIPS) for an indicator at a given year. */
export function countyAvgAt(aggregates, indicatorId, year, fips) {
	const a = aggregates?.[indicatorId];
	if (!a || !a.countyAvg[fips]) return null;
	const yi = a.years.indexOf(year);
	return yi < 0 ? null : a.countyAvg[fips][yi];
}
