/**
 * Build the comparison series for a trend chart: the selected area, its
 * county average, and the region average — aligned to the value file's years.
 * Pure function.
 */
const COLORS = { area: '#5b2a4e', county: '#1f6f63', region: '#9a9085' };

/**
 * @param {{valueFile:object, aggregates:object, geoid:string, level:'tract'|'county'}} args
 * @returns {{years:number[], series:{label:string,values:(number|null)[],color:string,dash:string,delay:number}[]}}
 */
export function seriesFor({ valueFile, aggregates, geoid, level = 'tract' }) {
	const years = valueFile?.years ?? [];
	const agg = aggregates?.[valueFile?.indicatorId];
	const region = agg?.regionAvg ?? years.map(() => null);

	const series = [];
	if (level === 'county') {
		const county = agg?.countyAvg?.[geoid] ?? years.map(() => null);
		series.push({ label: 'This county', values: county, color: COLORS.area, dash: 'solid', delay: 0 });
	} else {
		const tract = valueFile?.values?.[geoid] ?? years.map(() => null);
		const fips = geoid.slice(0, 5);
		const county = agg?.countyAvg?.[fips] ?? years.map(() => null);
		series.push({ label: 'This tract', values: tract, color: COLORS.area, dash: 'solid', delay: 0 });
		series.push({ label: 'County avg', values: county, color: COLORS.county, dash: 'dash', delay: 150 });
	}
	series.push({ label: 'Region avg', values: region, color: COLORS.region, dash: 'dot', delay: 300 });
	return { years, series };
}
