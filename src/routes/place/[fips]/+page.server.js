import fs from 'node:fs';
import path from 'node:path';
import { error } from '@sveltejs/kit';

const DATA = path.resolve('static', 'data');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

// Places (municipal boundaries) are produced by the Phase 2 pipeline.
// Until then areas/places.json is empty, so no place pages are prerendered.
export function entries() {
	return read('areas/places.json').map((p) => ({ fips: p.fips ?? p.geoid }));
}

export function load({ params }) {
	const places = read('areas/places.json');
	const place = places.find((p) => (p.fips ?? p.geoid) === params.fips);
	if (!place) throw error(404, 'Place not found');

	const manifest = read('manifest.json');
	const aggregates = read('aggregates.json');
	const indicators = manifest.indicators.map((ind) => {
		const agg = aggregates[ind.id];
		const years = agg?.years ?? [];
		const li = years.length - 1;
		const values = agg?.placeAvg?.[place.geoid] ?? [];
		return {
			id: ind.id, slug: ind.slug, label: ind.label, category: ind.category,
			format: ind.format, decimals: ind.decimals ?? 1, source: ind.source,
			years, values, value: values[li] ?? null, regionValue: agg?.regionAvg?.[li] ?? null,
			firstYear: years[0], lastYear: years[li]
		};
	});

	return { place, indicators, categories: manifest.categories, region: manifest.region };
}
