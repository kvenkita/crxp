/**
 * Map Census tracts to named OSM neighborhoods (approximate, for orientation).
 * Runs AFTER gen-fixture + gen-geo.  node scripts/gen-neighborhoods.mjs [--refresh]
 *
 * 1. Acquire neighborhood points: OSM place=neighbourhood|suburb|quarter (cached, region-filtered),
 *    or a local GeoJSON file via --points <file> [--name-field name] [--attribution "..."]
 *    [--attribution-url URL].
 * 2. Voronoi area-weight each tract -> ranked neighborhood shares + display label.
 * 3. Write areas/neighborhoods.json + areas/neighborhoods-source.json (attribution) and merge
 *    neighborhoods/label into areas/tracts.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pointInPolygon } from '../src/lib/geo/pointInPolygon.js';
import { tractShares, tractLabel, DEFAULTS } from '../src/lib/neighborhoods/assign.js';
import { fcBbox } from '../src/lib/geo/bbox.js';
import { pointsFromOsm, pointsFromGeoJSON, regionPoints } from '../src/lib/neighborhoods/points.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'static', 'data');
const CACHE = path.join(__dirname, 'data', 'osm-places-raw.json');
const refresh = process.argv.includes('--refresh');
const argVal = (flag) => {
	const i = process.argv.indexOf(flag);
	return i > -1 ? process.argv[i + 1] : undefined;
};
const pointsFile = argVal('--points');
const nameField = argVal('--name-field') ?? 'name';
const attribution = argVal('--attribution');
const attributionUrl = argVal('--attribution-url');

const read = (rel) => JSON.parse(fs.readFileSync(path.join(OUT, rel), 'utf8'));
const writeJSON = (p, o) => {
	fs.mkdirSync(path.dirname(p), { recursive: true });
	fs.writeFileSync(p, JSON.stringify(o));
};

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

	let candidates;
	if (pointsFile) {
		const fc = JSON.parse(fs.readFileSync(path.resolve(pointsFile), 'utf8'));
		const { points: pts, skipped } = pointsFromGeoJSON(fc, nameField);
		console.log(`Using local points file ${pointsFile}: ${pts.length} named points (${skipped} skipped)`);
		if (!attribution) console.warn('  warn: pass --attribution "<source>" to credit the points file');
		candidates = pts;
	} else {
		let raw;
		try {
			raw = await getOsmRaw(bbox);
		} catch (err) {
			console.error('Could not obtain OSM data and no cache present:', err.message);
			console.error('Run with network access (or place a cache at scripts/data/osm-places-raw.json). Aborting without changing outputs.');
			process.exit(1);
		}
		candidates = pointsFromOsm(raw);
	}

	// county lookup for region filter + disambiguation
	const countyName = (lng, lat) => {
		for (const f of countiesFC.features) if (pointInPolygon([lng, lat], f.geometry)) return f.properties.name;
		return null;
	};
	const points = regionPoints(candidates, countyName);
	if (!points.length) {
		console.error('No neighborhood points fall inside the region. Aborting without changing outputs.');
		process.exit(1);
	}
	writeJSON(path.join(OUT, 'areas', 'neighborhoods.json'), points);
	const source = pointsFile
		? { source: 'file', file: path.basename(pointsFile), attribution: attribution ?? path.basename(pointsFile), attributionUrl: attributionUrl ?? null }
		: { source: 'osm', attribution: 'OpenStreetMap contributors (ODbL)', attributionUrl: 'https://www.openstreetmap.org/copyright' };
	writeJSON(path.join(OUT, 'areas', 'neighborhoods-source.json'), source);
	console.log(`  ${points.length} neighborhood points in region (source: ${source.attribution})`);

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
