import fs from 'node:fs';
import path from 'node:path';
import { error } from '@sveltejs/kit';

const DATA = path.resolve('static', 'data');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

export function entries() {
	return read('areas/counties.json').map((c) => ({ fips: c.fips }));
}

export function load({ params }) {
	const counties = read('areas/counties.json');
	const county = counties.find((c) => c.fips === params.fips);
	if (!county) throw error(404, 'County not found');

	const manifest = read('manifest.json');
	const aggregates = read('aggregates.json');

	const indicators = manifest.indicators.map((ind) => {
		const agg = aggregates[ind.id];
		const years = agg?.years ?? [];
		const li = years.length - 1;
		const values = agg?.countyAvg?.[county.fips] ?? [];
		return {
			id: ind.id,
			slug: ind.slug,
			label: ind.label,
			category: ind.category,
			format: ind.format,
			decimals: ind.decimals ?? 1,
			source: ind.source,
			years,
			values,
			value: values[li] ?? null,
			regionValue: agg?.regionAvg?.[li] ?? null,
			firstYear: years[0],
			lastYear: years[li]
		};
	});

	return {
		county,
		indicators,
		categories: manifest.categories,
		region: manifest.region,
		counties: counties.map((c) => ({ fips: c.fips, name: c.name, bbox: c.bbox }))
	};
}
