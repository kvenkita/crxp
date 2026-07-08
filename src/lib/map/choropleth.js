/**
 * Choropleth derivation shared by the explore page and the /embed route.
 * Pure: pages own the data loading; this owns turning (indicator, year, geo level,
 * loaded data) into the values/breaks/colors the MapController consumes.
 */
import { valuesForYear, reliabilityForYear, breaksAndColors } from '$lib/data/values.js';
import { themeRamp } from './colorScale.js';

/**
 * @param {{indicator: any, year: number|null, geoLevel: string, aggregates: any, valueFile: any, accent: string}} inputs
 * @returns {{valuesByGeoid: Record<string, number|null>, reliabilityByGeoid?: Record<string, string>, breaks: number[], colors: string[], stats: {min:number, max:number, breaks:number[]}}|null}
 */
export function buildChoropleth({ indicator, year, geoLevel, aggregates, valueFile, accent }) {
	if (!indicator || year == null) return null;
	if (geoLevel === 'county') {
		const agg = aggregates?.[indicator.id];
		if (!agg) return null;
		const yi = agg.years.indexOf(year);
		/** @type {Record<string, number|null>} */
		const valuesByGeoid = {};
		// yi < 0: the selected year has no county data; render an EMPTY choropleth (clears the map)
		if (yi >= 0) for (const fips of Object.keys(agg.countyAvg)) valuesByGeoid[fips] = agg.countyAvg[fips][yi];
		const breaks = agg.breaks ?? [];
		const colors = themeRamp(accent, breaks.length + 1);
		const stats = { min: agg.domain?.min ?? 0, max: agg.domain?.max ?? 0, breaks };
		return { valuesByGeoid, breaks, colors, stats };
	}
	if (!valueFile || valueFile.indicatorId !== indicator.id) return null;
	const { breaks, colors, stats } = breaksAndColors(valueFile, accent);
	return {
		valuesByGeoid: valuesForYear(valueFile, year),
		reliabilityByGeoid: reliabilityForYear(valueFile, year),
		breaks,
		colors,
		stats
	};
}
