/**
 * Build the comparison series for a trend chart: the selected area, its
 * county average, and the region average — aligned to the value file's years.
 * Pure function.
 */
const COLORS = { area: '#5b2a4e', county: '#1f6f63', region: '#9a9085' };

/** Mean of finite values, or null. */
function mean(vals) {
	const f = vals.filter((v) => v != null && Number.isFinite(v));
	return f.length ? f.reduce((a, b) => a + b, 0) / f.length : null;
}

/**
 * Series for a SET of selected geoids: the area line is the mean across the
 * set; the county line is the mean of the distinct counties involved.
 * @param {{valueFile:object, aggregates:object, geoids:string[], level:'tract'|'county', label?:string}} args
 */
export function seriesForSet({ valueFile, aggregates, geoids, level = 'tract', label }) {
	const years = valueFile?.years ?? [];
	const agg = aggregates?.[valueFile?.indicatorId];
	const region = agg?.regionAvg ?? years.map(() => null);

	const valuesAt = (g, yi) =>
		level === 'county' ? agg?.countyAvg?.[g]?.[yi] : valueFile?.values?.[g]?.[yi];

	const areaVals = years.map((_, yi) => mean(geoids.map((g) => valuesAt(g, yi))));

	const counties = level === 'county' ? [...new Set(geoids)] : [...new Set(geoids.map((g) => g.slice(0, 5)))];
	const countyVals = years.map((_, yi) => mean(counties.map((fips) => agg?.countyAvg?.[fips]?.[yi])));

	const areaLabel = label ?? (geoids.length === 1 ? 'This area' : `Selected (${geoids.length})`);
	const countyLabel = counties.length === 1 ? 'County avg' : `Counties avg (${counties.length})`;
	// a single selected tract carries its margin of error; a multi-tract mean does not
	const single = geoids.length === 1 && level === 'tract' ? geoids[0] : null;
	return {
		years,
		series: [
			{
				label: areaLabel, values: areaVals, color: COLORS.area, dash: 'solid', delay: 0,
				band: single ? valueFile?.moe?.[single] ?? null : null,
				reliability: single ? valueFile?.reliability?.[single] ?? null : null
			},
			{ label: countyLabel, values: countyVals, color: COLORS.county, dash: 'dash', delay: 150 },
			{ label: 'Region avg', values: region, color: COLORS.region, dash: 'dot', delay: 300 }
		]
	};
}

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
		// the selected tract carries margins of error + reliability (uncertainty UI)
		series.push({
			label: 'This tract', values: tract, color: COLORS.area, dash: 'solid', delay: 0,
			band: valueFile?.moe?.[geoid] ?? null, reliability: valueFile?.reliability?.[geoid] ?? null
		});
		series.push({ label: 'County avg', values: county, color: COLORS.county, dash: 'dash', delay: 150 });
	}
	series.push({ label: 'Region avg', values: region, color: COLORS.region, dash: 'dot', delay: 300 });
	return { years, series };
}
