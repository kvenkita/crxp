/**
 * One-time / reproducible fixture generator for CRXP Phase 1.
 *
 * Reads the existing Charlotte Regional Explorer source assets (tract geometry
 * GeoJSON + multi-year ACS CSV) and emits the static data contract under
 * static/data/. This stands in for the Phase 2 pipeline, which will later
 * produce the same contract from a wider set of sources.
 *
 * Run:  node scripts/gen-fixture.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zScores, summarize, knnWeights, localMoran } from '../src/lib/analytics/spatial.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'static', 'data');

const DROPBOX = 'C:/Users/kyle/UNC Charlotte Dropbox/Kailas Venkitasubramanian/Charlotte Regional Explorer';
const GEOJSON = path.join(DROPBOX, 'Charlotte Regional Explorer', 'UICharlotteReg_FeaturesToJSO.geojson');
const ACS_CSV = path.join(DROPBOX, 'Data', 'RegionalExplorerACS_all_years.csv');

const CLASSES = 5;
const COORD_PRECISION = 5; // ~1.1 m
const DP_EPSILON = 0.00018; // ~20 m simplification tolerance (degrees)

/** Indicator definitions: maps app indicators to ACS CSV columns. */
const INDICATORS = [
	{ id: 1, slug: 'older-adults', label: 'Older adults (65+)', category: 'character', field: 'PercentOver65', higherIsBetter: null, colorScheme: 'BuPu', desc: 'Share of residents aged 65 and older', metaTitle: 'Older Adults', metaWhy: 'The share of residents aged 65 and older shapes demand for healthcare, accessible housing, transportation, and senior services.' },
	{ id: 2, slug: 'youth', label: 'Youth (under 18)', category: 'character', field: 'PercentUnder18', higherIsBetter: null, colorScheme: 'YlGn', desc: 'Share of residents under age 18', metaTitle: 'Youth', metaWhy: 'The share of residents under 18 signals demand for schools, childcare, parks, and family services.' },
	{ id: 3, slug: 'black-residents', label: 'Black residents', category: 'character', field: 'PercentBlack', higherIsBetter: null, colorScheme: 'PuBu', desc: 'Share of residents who are Black or African American', metaTitle: 'Black Residents', metaWhy: 'Understanding the racial and ethnic composition of neighborhoods helps assess equity and target services.' },
	{ id: 4, slug: 'hispanic-residents', label: 'Hispanic or Latino residents', category: 'character', field: 'PercentHispanic', higherIsBetter: null, colorScheme: 'OrRd', desc: 'Share of residents who are Hispanic or Latino', metaTitle: 'Hispanic or Latino Residents', metaWhy: 'Tracking the Hispanic or Latino population supports language access, outreach, and equitable service delivery.' },
	{ id: 5, slug: 'bachelors-or-higher', label: "Bachelor's degree or higher", category: 'education', field: 'PercentAdultsWithAtLeastBachelors', higherIsBetter: true, colorScheme: 'YlGnBu', desc: "Adults 25+ with a bachelor's degree or higher", metaTitle: "Adults with a Bachelor's Degree or Higher", metaWhy: 'Educational attainment is strongly associated with earnings, health, and economic mobility.' },
	{ id: 6, slug: 'high-school-diploma', label: 'High school diploma or higher', category: 'education', field: 'PercentHighSchoolDiploma', higherIsBetter: true, colorScheme: 'GnBu', desc: 'Adults 25+ with at least a high school diploma', metaTitle: 'Adults with a High School Diploma or Higher', metaWhy: 'High school completion is a foundational measure of opportunity and workforce readiness.' },
	{ id: 7, slug: 'employment', label: 'Employment rate', category: 'economy', field: 'PercentEmployed', higherIsBetter: true, colorScheme: 'Greens', desc: 'Share of the labor force that is employed', metaTitle: 'Employment Rate', metaWhy: 'The share of the labor force that is employed reflects local economic health and household stability.' },
	{ id: 8, slug: 'owner-occupied', label: 'Owner-occupied homes', category: 'housing', field: 'PercentOwnerOccupied', higherIsBetter: true, colorScheme: 'BuGn', desc: 'Occupied homes that are owner-occupied', metaTitle: 'Owner-Occupied Homes', metaWhy: 'Homeownership is associated with wealth-building and neighborhood stability, though high rates can also signal limited rental options.' },
	{ id: 9, slug: 'no-vehicle', label: 'Households without a vehicle', category: 'transportation', field: 'PercentNoVehicle', higherIsBetter: false, colorScheme: 'YlOrRd', desc: 'Households with no vehicle available', metaTitle: 'Households Without a Vehicle', metaWhy: 'Vehicle access affects how easily residents reach jobs, food, and care — especially where transit is limited.' },
	{ id: 10, slug: 'internet-access', label: 'Households with internet access', category: 'connectivity', field: 'PercentInternetAccess', higherIsBetter: true, colorScheme: 'PuBuGn', desc: 'Households with a broadband internet subscription', metaTitle: 'Households with Internet Access', metaWhy: 'Home internet is essential for school, work, healthcare, and civic participation in a digital economy.' }
];

const CATEGORIES = [
	{ key: 'character', label: 'People & Character', order: 1, color: '#8c62aa' },
	{ key: 'economy', label: 'Economy', order: 2, color: '#1f8a5b' },
	{ key: 'education', label: 'Education', order: 3, color: '#2f6fb0' },
	{ key: 'housing', label: 'Housing', order: 4, color: '#b07a2a' },
	{ key: 'transportation', label: 'Transportation', order: 5, color: '#1f6f63' },
	{ key: 'connectivity', label: 'Connectivity', order: 6, color: '#5b6cc4' }
];

// ---------- helpers ----------
function ensureDir(p) {
	fs.mkdirSync(p, { recursive: true });
}
function writeJSON(file, obj) {
	ensureDir(path.dirname(file));
	fs.writeFileSync(file, JSON.stringify(obj));
}

function round(n, p = COORD_PRECISION) {
	const f = 10 ** p;
	return Math.round(n * f) / f;
}

/** Douglas-Peucker on a ring of [lng,lat]. */
function simplifyRing(ring, eps) {
	if (ring.length <= 4) return ring;
	const keep = new Uint8Array(ring.length);
	keep[0] = keep[ring.length - 1] = 1;
	const stack = [[0, ring.length - 1]];
	while (stack.length) {
		const [a, b] = stack.pop();
		let maxD = 0;
		let idx = -1;
		const [ax, ay] = ring[a];
		const [bx, by] = ring[b];
		const dx = bx - ax;
		const dy = by - ay;
		const len2 = dx * dx + dy * dy || 1e-12;
		for (let i = a + 1; i < b; i++) {
			const [px, py] = ring[i];
			const t = ((px - ax) * dx + (py - ay) * dy) / len2;
			const cx = ax + t * dx;
			const cy = ay + t * dy;
			const d = (px - cx) ** 2 + (py - cy) ** 2;
			if (d > maxD) {
				maxD = d;
				idx = i;
			}
		}
		if (Math.sqrt(maxD) > eps && idx !== -1) {
			keep[idx] = 1;
			stack.push([a, idx], [idx, b]);
		}
	}
	const out = [];
	for (let i = 0; i < ring.length; i++) if (keep[i]) out.push([round(ring[i][0]), round(ring[i][1])]);
	if (out.length < 4) return ring.map((p) => [round(p[0]), round(p[1])]);
	return out;
}

function simplifyGeometry(geom) {
	if (geom.type === 'Polygon') {
		return { type: 'Polygon', coordinates: geom.coordinates.map((r) => simplifyRing(r, DP_EPSILON)) };
	}
	if (geom.type === 'MultiPolygon') {
		return {
			type: 'MultiPolygon',
			coordinates: geom.coordinates.map((poly) => poly.map((r) => simplifyRing(r, DP_EPSILON)))
		};
	}
	return geom;
}

function geomBbox(geom) {
	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	const scan = (ring) => {
		for (const [x, y] of ring) {
			if (x < minX) minX = x;
			if (y < minY) minY = y;
			if (x > maxX) maxX = x;
			if (y > maxY) maxY = y;
		}
	};
	if (geom.type === 'Polygon') geom.coordinates.forEach(scan);
	else if (geom.type === 'MultiPolygon') geom.coordinates.forEach((p) => p.forEach(scan));
	return [minX, minY, maxX, maxY];
}

function centroidOf(bbox) {
	return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
}

function slugify(s) {
	return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------- parse CSV ----------
function parseCsv(text) {
	const rows = [];
	let i = 0;
	const n = text.length;
	let field = '';
	let row = [];
	let inQuotes = false;
	while (i < n) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
				i++;
				continue;
			}
			field += c;
			i++;
			continue;
		}
		if (c === '"') {
			inQuotes = true;
			i++;
			continue;
		}
		if (c === ',') {
			row.push(field);
			field = '';
			i++;
			continue;
		}
		if (c === '\r') {
			i++;
			continue;
		}
		if (c === '\n') {
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
			i++;
			continue;
		}
		field += c;
		i++;
	}
	if (field.length || row.length) {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

// ---------- main ----------
console.log('Reading geometry…');
const geo = JSON.parse(fs.readFileSync(GEOJSON, 'utf8'));

const tracts = new Map(); // geoid -> {geoid, name, county, state, geom, bbox}
for (const f of geo.features) {
	const p = f.properties;
	const geoid = String(p.GEOID);
	const nameParts = String(p.NAME || '').split(';').map((s) => s.trim());
	const county = nameParts[1] || `County ${geoid.slice(0, 5)}`;
	const state = nameParts[2] || '';
	const simp = simplifyGeometry(f.geometry);
	const bbox = geomBbox(simp);
	tracts.set(geoid, { geoid, name: nameParts[0] || `Tract ${geoid}`, county, state, geom: simp, bbox });
}
console.log(`  ${tracts.size} tracts`);

console.log('Reading ACS values…');
const rows = parseCsv(fs.readFileSync(ACS_CSV, 'utf8'));
const header = rows[0];
const colIdx = Object.fromEntries(header.map((h, i) => [h, i]));
const yearsSet = new Set();
// records[geoid][field][year] = value
const records = new Map();
for (let r = 1; r < rows.length; r++) {
	const row = rows[r];
	if (!row || row.length < header.length) continue;
	const year = Number(row[colIdx['Year']]);
	const geoid = String(row[colIdx['GEOID']]);
	if (!tracts.has(geoid)) continue;
	yearsSet.add(year);
	if (!records.has(geoid)) records.set(geoid, {});
	const rec = records.get(geoid);
	for (const ind of INDICATORS) {
		const raw = row[colIdx[ind.field]];
		const v = raw === '' || raw == null ? null : Number(raw);
		if (!rec[ind.field]) rec[ind.field] = {};
		rec[ind.field][year] = Number.isFinite(v) ? v : null;
	}
}
const YEARS = [...yearsSet].sort((a, b) => a - b);
console.log(`  years: ${YEARS.join(', ')}`);

const tractIds = [...tracts.keys()];

// KNN spatial weights from tract centroids (shared across indicators/years)
console.log('Building spatial weights…');
const points = tractIds.map((id) => {
	const c = centroidOf(tracts.get(id).bbox);
	return { id, x: c[0], y: c[1] };
});
const weights = knnWeights(points, 8);

// ---------- emit geometry ----------
console.log('Writing tract geometry…');
const tractFeatures = tractIds.map((id) => ({
	type: 'Feature',
	id,
	properties: { geoid: id },
	geometry: tracts.get(id).geom
}));
writeJSON(path.join(OUT, 'geo', 'tracts.geojson'), {
	type: 'FeatureCollection',
	features: tractFeatures
});

// ---------- counties ----------
const counties = new Map(); // fips -> {fips,name,state,geoids[]}
for (const id of tractIds) {
	const fips = id.slice(0, 5);
	const t = tracts.get(id);
	if (!counties.has(fips)) counties.set(fips, { fips, name: t.county, state: t.state, geoids: [] });
	counties.get(fips).geoids.push(id);
}

// county bbox from member tracts
for (const c of counties.values()) {
	let bb = [Infinity, Infinity, -Infinity, -Infinity];
	for (const id of c.geoids) {
		const b = tracts.get(id).bbox;
		bb = [Math.min(bb[0], b[0]), Math.min(bb[1], b[1]), Math.max(bb[2], b[2]), Math.max(bb[3], b[3])];
	}
	c.bbox = bb;
}

// ---------- per-indicator value + analytics files ----------
console.log('Writing indicator values + analytics…');
const aggregates = {}; // id -> {countyAvg:{fips:[byYear]}, regionAvg:[byYear]}

for (const ind of INDICATORS) {
	const values = {};
	const stats = {};
	// collect per-year arrays aligned to tractIds
	const perYearArrays = {};
	for (const y of YEARS) perYearArrays[y] = [];
	for (const id of tractIds) {
		const rec = records.get(id);
		const arr = YEARS.map((y) => {
			const v = rec?.[ind.field]?.[y];
			return v == null ? null : Math.round(v * 100) / 100;
		});
		values[id] = arr;
		YEARS.forEach((y, yi) => perYearArrays[y].push(arr[yi]));
	}
	for (const y of YEARS) stats[y] = summarize(perYearArrays[y], CLASSES);

	writeJSON(path.join(OUT, 'values', `${ind.id}.json`), {
		indicatorId: ind.id,
		geoLevel: 'tract',
		years: YEARS,
		values,
		stats
	});

	// z-scores per year
	const zByYear = {}; // year -> [zAligned to tractIds]
	for (const y of YEARS) zByYear[y] = zScores(perYearArrays[y]);
	const zOut = {};
	tractIds.forEach((id, i) => {
		zOut[id] = YEARS.map((y) => {
			const z = zByYear[y][i];
			return z == null ? null : Math.round(z * 1000) / 1000;
		});
	});
	writeJSON(path.join(OUT, 'analytics', 'z', `${ind.id}.json`), { indicatorId: ind.id, years: YEARS, z: zOut });

	// LISA per year
	const lisaOut = {};
	tractIds.forEach((id) => (lisaOut[id] = []));
	for (let yi = 0; yi < YEARS.length; yi++) {
		const y = YEARS[yi];
		const obs = tractIds.map((id) => ({ id, value: values[id][yi] }));
		const res = localMoran(obs, weights, { perms: 199 });
		for (const id of tractIds) {
			const r = res.get(id);
			lisaOut[id].push(r.quadrant);
		}
	}
	writeJSON(path.join(OUT, 'analytics', 'lisa', `${ind.id}.json`), {
		indicatorId: ind.id,
		years: YEARS,
		quadrants: lisaOut
	});

	// aggregates: region + county averages (unweighted mean of tract values)
	const regionAvg = YEARS.map((y, yi) => {
		const vals = tractIds.map((id) => values[id][yi]).filter((v) => v != null);
		return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
	});
	const countyAvg = {};
	for (const c of counties.values()) {
		countyAvg[c.fips] = YEARS.map((y, yi) => {
			const vals = c.geoids.map((id) => values[id][yi]).filter((v) => v != null);
			return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
		});
	}
	aggregates[ind.id] = { years: YEARS, regionAvg, countyAvg };
}
writeJSON(path.join(OUT, 'aggregates.json'), aggregates);

// ---------- manifest ----------
console.log('Writing manifest + areas + meta…');
const manifest = {
	region: 'Charlotte 14-county region',
	years: YEARS,
	categories: CATEGORIES,
	indicators: INDICATORS.map((ind) => ({
		id: ind.id,
		slug: ind.slug,
		label: ind.label,
		description: ind.desc,
		category: ind.category,
		format: 'percent',
		decimals: 1,
		higherIsBetter: ind.higherIsBetter,
		colorScheme: ind.colorScheme,
		classMethod: 'quantile',
		years: YEARS,
		geoLevels: ['tract', 'county'],
		source: 'U.S. Census Bureau, American Community Survey 5-Year Estimates',
		vintage: `${YEARS[0]}–${YEARS[YEARS.length - 1]}`,
		metaPath: `/data/meta/m${ind.id}.md`,
		related: INDICATORS.filter((o) => o.category === ind.category && o.id !== ind.id).map((o) => o.id).slice(0, 3),
		hasZ: true,
		hasLisa: true
	}))
};
writeJSON(path.join(OUT, 'manifest.json'), manifest);

// ---------- area manifests ----------
writeJSON(
	path.join(OUT, 'areas', 'tracts.json'),
	tractIds.map((id) => {
		const t = tracts.get(id);
		return { geoid: id, name: t.name, county: t.county, slug: id, bbox: t.bbox.map((n) => round(n, 4)) };
	})
);
writeJSON(
	path.join(OUT, 'areas', 'counties.json'),
	[...counties.values()].map((c) => ({
		geoid: c.fips,
		fips: c.fips,
		name: c.name,
		state: c.state,
		slug: slugify(c.name),
		tractCount: c.geoids.length,
		bbox: c.bbox.map((n) => round(n, 4))
	}))
);
writeJSON(path.join(OUT, 'areas', 'places.json'), []); // populated by Phase 2 (municipal boundaries)

// county overlay geometry (rectangles from bbox — replaced by dissolved polygons in Phase 2)
writeJSON(path.join(OUT, 'geo', 'counties.geojson'), {
	type: 'FeatureCollection',
	features: [...counties.values()].map((c) => {
		const [x0, y0, x1, y1] = c.bbox;
		return {
			type: 'Feature',
			id: c.fips,
			properties: { geoid: c.fips, name: c.name },
			geometry: { type: 'Polygon', coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]] }
		};
	})
});

// ---------- metadata markdown ----------
for (const ind of INDICATORS) {
	const dir = ('higherIsBetter' in ind && ind.higherIsBetter === true) ? 'A higher value is generally more favorable.'
		: ind.higherIsBetter === false ? 'A higher value generally signals greater need.'
		: 'This indicator describes neighborhood composition; higher and lower values are not inherently better or worse.';
	const md = `## ${ind.metaTitle}
Share of ${ind.label.toLowerCase()} by Census tract.

### Why is this important?
${ind.metaWhy} ${dir}

### About the Data
This indicator is calculated from the U.S. Census Bureau's American Community Survey (ACS) 5-Year Estimates for ${YEARS[0]}–${YEARS[YEARS.length - 1]}, aggregated to 2020 Census tract boundaries. Values are expressed as percentages. Because ACS figures are survey estimates, small tracts carry larger margins of error; interpret year-to-year changes with care.

_**Source**: U.S. Census Bureau, American Community Survey 5-Year Estimates._

### Additional Resources
- [American Community Survey](https://www.census.gov/programs-surveys/acs)
- [UNC Charlotte Urban Institute](https://ui.charlotte.edu/)
`;
	const file = path.join(OUT, 'meta', `m${ind.id}.md`);
	ensureDir(path.dirname(file));
	fs.writeFileSync(file, md);
}

console.log('Fixture generation complete →', path.relative(ROOT, OUT));
