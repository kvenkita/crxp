/**
 * Map Census tracts to named OSM neighborhoods (approximate, for orientation).
 * Runs AFTER gen-fixture + gen-geo.  node scripts/gen-neighborhoods.mjs [--refresh]
 *
 * 1. Acquire OSM place=neighbourhood|suburb|quarter points (cached, region-filtered).
 * 2. Voronoi area-weight each tract -> ranked neighborhood shares + display label.
 * 3. Write areas/neighborhoods.json and merge neighborhoods/label into areas/tracts.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pointInPolygon } from '../src/lib/geo/pointInPolygon.js';
import { tractShares, tractLabel, DEFAULTS } from '../src/lib/neighborhoods/assign.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'static', 'data');
const CACHE = path.join(__dirname, 'data', 'osm-places-raw.json');
const refresh = process.argv.includes('--refresh');

const read = (rel) => JSON.parse(fs.readFileSync(path.join(OUT, rel), 'utf8'));
const writeJSON = (p, o) => {
	fs.mkdirSync(path.dirname(p), { recursive: true });
	fs.writeFileSync(p, JSON.stringify(o));
};

function fcBbox(fc) {
	let b = [Infinity, Infinity, -Infinity, -Infinity];
	const scan = (r) => { for (const [x, y] of r) { if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; } };
	for (const f of fc.features) {
		const g = f.geometry;
		if (!g) continue;
		(g.type === 'Polygon' ? g.coordinates : g.coordinates.flat()).forEach(scan);
	}
	return b;
}
const centroidOf = (g) => {
	const [x0, y0, x1, y1] = (() => { const fc = { features: [{ geometry: g }] }; return fcBbox(fc); })();
	return [(x0 + x1) / 2, (y0 + y1) / 2];
};

async function getOsmRaw(bbox) {
	if (!refresh && fs.existsSync(CACHE)) {
		console.log('Using cached OSM places:', path.relative(ROOT, CACHE));
		return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
	}
	const [w, s, e, n] = bbox;
	const ql = `[out:json][timeout:180];(node["place"~"^(neighbourhood|suburb|quarter)$"](${s},${w},${n},${e}););out body;`;
	console.log('Querying Overpass…');
	const res = await fetch('https://overpass-api.de/api/interpreter', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json',
			'User-Agent': 'CarolinasRegionalExplorer/1.0 (neighborhood naming; contact: ui.charlotte.edu)'
		},
		body: 'data=' + encodeURIComponent(ql)
	});
	if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
	const json = await res.json();
	writeJSON(CACHE, json);
	console.log('Cached OSM places ->', path.relative(ROOT, CACHE));
	return json;
}

async function main() {
	const tractsFC = read('geo/tracts.geojson');
	const countiesFC = read('geo/counties.geojson');
	const placesFC = read('geo/places.geojson');
	const tractMeta = Object.fromEntries(read('areas/tracts.json').map((t) => [t.geoid, t]));

	const regionBbox = fcBbox(tractsFC); // [w,s,e,n]
	const pad = 0.05;
	const bbox = [regionBbox[0] - pad, regionBbox[1] - pad, regionBbox[2] + pad, regionBbox[3] + pad];

	let raw;
	try {
		raw = await getOsmRaw(bbox);
	} catch (err) {
		console.error('Could not obtain OSM data and no cache present:', err.message);
		console.error('Run with network access (or place a cache at scripts/data/osm-places-raw.json). Aborting without changing outputs.');
		process.exit(1);
	}

	// county lookup for region filter + disambiguation
	const countyName = (lng, lat) => {
		for (const f of countiesFC.features) if (pointInPolygon([lng, lat], f.geometry)) return f.properties.name;
		return null;
	};

	// build region-filtered, deduped points
	const seen = new Set();
	const points = [];
	for (const el of raw.elements || []) {
		if (el.type !== 'node' || !el.tags?.name) continue;
		const name = el.tags.name.trim();
		const cty = countyName(el.lon, el.lat);
		if (!cty) continue; // outside region
		const key = `${name}|${cty}`;
		if (seen.has(key)) continue;
		seen.add(key);
		points.push({ name, lng: el.lon, lat: el.lat, type: el.tags.place, county: cty });
	}
	points.sort((a, b) => a.name.localeCompare(b.name));
	writeJSON(path.join(OUT, 'areas', 'neighborhoods.json'), points);
	console.log(`  ${points.length} neighborhood points in region`);

	// place (city) lookup for fallback labels
	const placeName = (centroid) => {
		for (const f of placesFC.features) if (pointInPolygon(centroid, f.geometry)) return f.properties.name;
		return null;
	};

	// map each tract
	const tractsOut = read('areas/tracts.json').map((t) => {
		const feat = tractsFC.features.find((f) => String(f.id ?? f.properties.geoid) === t.geoid);
		if (!feat) return t;
		const { shares, nearestDistKm } = tractShares(feat.geometry, points);
		const centroid = centroidOf(feat.geometry);
		const isFallback = !shares.length || nearestDistKm > DEFAULTS.distCapKm;
		const label = tractLabel({ shares, nearestDistKm, placeName: placeName(centroid), countyName: t.county });
		// only keep neighborhoods when the label actually uses them (not a city/county fallback)
		return { ...t, neighborhoods: isFallback ? [] : shares, label };
	});
	const labeled = tractsOut.filter((x) => x.neighborhoods?.length).length;
	writeJSON(path.join(OUT, 'areas', 'tracts.json'), tractsOut);
	console.log(`  ${labeled}/${tractsOut.length} tracts labeled with a neighborhood (rest fall back to city/county)`);
	console.log('gen-neighborhoods complete.');
}

main();
