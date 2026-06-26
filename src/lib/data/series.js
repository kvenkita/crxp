/**
 * Build the comparison series for a trend chart: the selected area, its
 * county average, and the region average — aligned to the value file's years.
 * Pure function.
 */
const COLORS = { area: '#5b2a4e', county: '#1f6f63', region: '#9a9085' };

/**
 * Comparable-period changes for one tract: each NON-overlapping pair (latest−5 → latest and
 * latest−10 → latest, i.e. 5- and 10-year ACS windows) that is present in the value file, with
 * the Census 90% significance test. Derives the periods from the latest year, so it updates
 * automatically as new years are added. Returns [] if none are computable.
 * @param {object} valueFile
 * @param {string} geoid
 * @returns {{y1:number,y2:number,delta:number,significant:boolean|null,span:number}[]}
 */
export function comparableChanges(valueFile, geoid) {
	const years = valueFile?.years ?? [];
	if (years.length < 2) return [];
	const latest = Math.max(...years);
	const out = [];
	for (const span of [5, 10]) {
		const y1 = latest - span;
		const i1 = years.indexOf(y1);
		const i2 = years.indexOf(latest);
		if (i1 < 0 || i2 < 0) continue;
		const v1 = valueFile.values?.[geoid]?.[i1];
		const v2 = valueFile.values?.[geoid]?.[i2];
		if (v1 == null || v2 == null || !Number.isFinite(v1) || !Number.isFinite(v2)) continue;
		const m1 = valueFile.moe?.[geoid]?.[i1];
		const m2 = valueFile.moe?.[geoid]?.[i2];
		const delta = v2 - v1;
		let significant = null;
		if (m1 != null && m2 != null && Number.isFinite(m1) && Number.isFinite(m2)) {
			const se1 = m1 / 1.645;
			const se2 = m2 / 1.645;
			const denom = Math.sqrt(se1 * se1 + se2 * se2);
			significant = denom > 0 ? Math.abs(delta) / denom > 1.645 : null;
		}
		out.push({ y1, y2: latest, v1, v2, delta, significant, span });
	}
	return out;
}

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
	const countyLabel = counties.length === 1 ? 'County (avg of tracts)' : `Counties (avg of tracts, ${counties.length})`;
	// a single selected tract carries its margin of error; a multi-tract mean does not
	const single = geoids.length === 1 && level === 'tract' ? geoids[0] : null;
	// aggregate MOE bands (MOE of the unweighted mean); only for a single county, and for the region
	const countyBand = counties.length === 1 ? agg?.countyMoe?.[counties[0]] ?? null : null;
	return {
		years,
		series: [
			{
				label: areaLabel, values: areaVals, color: COLORS.area, dash: 'solid', delay: 0,
				band: single ? valueFile?.moe?.[single] ?? null : null,
				reliability: single ? valueFile?.reliability?.[single] ?? null : null
			},
			{ label: countyLabel, values: countyVals, color: COLORS.county, dash: 'dash', delay: 150, band: countyBand },
			{ label: 'Region (avg of tracts)', values: region, color: COLORS.region, dash: 'dot', delay: 300, band: agg?.regionMoe ?? null }
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
		series.push({
			label: 'This county', values: county, color: COLORS.area, dash: 'solid', delay: 0,
			band: agg?.countyMoe?.[geoid] ?? null
		});
	} else {
		const tract = valueFile?.values?.[geoid] ?? years.map(() => null);
		const fips = geoid.slice(0, 5);
		const county = agg?.countyAvg?.[fips] ?? years.map(() => null);
		// the selected tract carries margins of error + reliability (uncertainty UI)
		series.push({
			label: 'This tract', values: tract, color: COLORS.area, dash: 'solid', delay: 0,
			band: valueFile?.moe?.[geoid] ?? null, reliability: valueFile?.reliability?.[geoid] ?? null
		});
		series.push({
			label: 'County (avg of tracts)', values: county, color: COLORS.county, dash: 'dash', delay: 150,
			band: agg?.countyMoe?.[fips] ?? null
		});
	}
	series.push({
		label: 'Region (avg of tracts)', values: region, color: COLORS.region, dash: 'dot', delay: 300,
		band: agg?.regionMoe ?? null
	});
	return { years, series };
}
