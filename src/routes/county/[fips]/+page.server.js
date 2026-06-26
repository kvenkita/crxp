import fs from 'node:fs';
import path from 'node:path';
import { error } from '@sveltejs/kit';

const DATA = path.resolve('static', 'data');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

export function entries() {
	return read('areas/counties.json').map((c) => ({ fips: c.fips }));
}

// --- Douglas-Peucker line simplification (for the lightweight inset/locator polygons) ---
function segDist(p, a, b) {
	const [px, py] = p, [ax, ay] = a, [bx, by] = b;
	const dx = bx - ax, dy = by - ay;
	if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
	const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
	return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function simplify(points, eps) {
	if (points.length < 3) return points;
	let idx = 0, max = 0;
	for (let i = 1; i < points.length - 1; i++) {
		const d = segDist(points[i], points[0], points[points.length - 1]);
		if (d > max) { max = d; idx = i; }
	}
	if (max > eps) {
		const left = simplify(points.slice(0, idx + 1), eps);
		const right = simplify(points.slice(idx), eps);
		return left.slice(0, -1).concat(right);
	}
	return [points[0], points[points.length - 1]];
}
const round = (ring) => ring.map(([x, y]) => [Math.round(x * 1e4) / 1e4, Math.round(y * 1e4) / 1e4]);

/** Simplified outline polygons for the 14 counties, for the locator/inset map. */
function locatorShapes(nameByFips) {
	const fc = read('geo/counties.geojson');
	const EPS = 0.004; // ~400 m; plenty for a ~280px inset
	return fc.features.map((f) => {
		const fips = f.id != null ? String(f.id) : f.properties?.geoid || f.properties?.GEOID;
		const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
		const rings = polys.map((poly) => round(simplify(poly[0], EPS))); // outer ring of each polygon
		return { fips, name: nameByFips[fips] || fips, rings };
	});
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

	const nameByFips = Object.fromEntries(counties.map((c) => [c.fips, c.name]));

	return {
		county,
		indicators,
		categories: manifest.categories,
		region: manifest.region,
		counties: counties.map((c) => ({ fips: c.fips, name: c.name, bbox: c.bbox })),
		shapes: locatorShapes(nameByFips)
	};
}
