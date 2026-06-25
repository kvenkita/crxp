/**
 * Generate real county polygons (by dissolving tracts) and region city polygons
 * (from NCDOT + GISTANS municipal shapefiles). Overwrites the placeholder
 * county rectangles and the empty places set produced by gen-fixture.
 *
 * Run AFTER gen-fixture:  node scripts/gen-geo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mapshaper from 'mapshaper';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'static', 'data');
const SHP = 'C:/Users/kyle/UNC Charlotte Dropbox/Kailas Venkitasubramanian/Charlotte Regional Explorer/Data';

const NC = new Set(['ANSON', 'CABARRUS', 'CATAWBA', 'CLEVELAND', 'GASTON', 'IREDELL', 'LINCOLN', 'MECKLENBURG', 'ROWAN', 'STANLY', 'UNION']);
const SC = new Set(['YORK', 'CHESTER', 'LANCASTER']);

const read = (rel) => JSON.parse(fs.readFileSync(path.join(OUT, rel), 'utf8'));
const round = (n) => Math.round(n * 1e5) / 1e5;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function bboxOf(geom) {
	let b = [Infinity, Infinity, -Infinity, -Infinity];
	const scan = (r) => { for (const [x, y] of r) { if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; } };
	if (geom.type === 'Polygon') geom.coordinates.forEach(scan);
	else if (geom.type === 'MultiPolygon') geom.coordinates.forEach((p) => p.forEach(scan));
	return b.map(round);
}

// ---------- counties: dissolve tracts ----------
console.log('Dissolving tracts into counties…');
const countyMeta = Object.fromEntries(read('areas/counties.json').map((c) => [c.fips, c]));
const dis = await mapshaper.applyCommands(
	`-i "${path.join(OUT, 'geo', 'tracts.geojson')}" -each 'cty=geoid.substring(0,5)' -dissolve cty -simplify 12% keep-shapes -clean -o precision=0.00001 format=geojson out.json`,
	{}
);
const countiesFC = JSON.parse(dis['out.json']);
const countyAreas = [];
for (const f of countiesFC.features) {
	const fips = f.properties.cty;
	const meta = countyMeta[fips] || {};
	f.id = fips;
	f.properties = { geoid: fips, name: meta.name ?? fips };
	const bbox = bboxOf(f.geometry);
	countyAreas.push({ geoid: fips, fips, name: meta.name ?? fips, state: meta.state ?? '', slug: slug(meta.name ?? fips), tractCount: meta.tractCount ?? 0, bbox });
}
fs.writeFileSync(path.join(OUT, 'geo', 'counties.geojson'), JSON.stringify(countiesFC));
fs.writeFileSync(path.join(OUT, 'areas', 'counties.json'), JSON.stringify(countyAreas));
console.log(`  ${countiesFC.features.length} counties`);

// ---------- cities: from municipal shapefiles ----------
async function shpToFC(file) {
	const out = await mapshaper.applyCommands(`-i "${SHP}/${file}" -proj wgs84 -simplify 8% keep-shapes -clean -o precision=0.00001 format=geojson out.json`, {});
	return JSON.parse(out['out.json']);
}

console.log('Reading municipal boundaries…');
const ncFC = await shpToFC('NCDOT_City_Boundaries.shp');
const scFC = await shpToFC('GISTANS.MUNICIPAL_AREAS.shp');

const placeFeatures = [];
const placeAreas = [];
const seen = new Set();

function addPlace(name, countyName, geom) {
	if (!name || !geom) return;
	const key = slug(name) + '|' + slug(countyName || '');
	if (seen.has(key)) return;
	seen.add(key);
	const geoid = 'pl-' + slug(name) + (countyName ? '-' + slug(countyName) : '');
	placeFeatures.push({ type: 'Feature', id: geoid, properties: { geoid, name }, geometry: geom });
	placeAreas.push({ geoid, name, slug: slug(name), county: titleCase(countyName), bbox: bboxOf(geom) });
}
const titleCase = (s) => (s ? s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase()) : '');

for (const f of ncFC.features) {
	const cty = String(f.properties.CountyName || '').toUpperCase();
	if (NC.has(cty)) addPlace(f.properties.MunicipalB, cty, f.geometry);
}
for (const f of scFC.features) {
	const cty = String(f.properties.COUNTY_NAM || '').toUpperCase();
	if (SC.has(cty)) addPlace(f.properties.CITY_NAME, cty, f.geometry);
}

fs.writeFileSync(path.join(OUT, 'geo', 'places.geojson'), JSON.stringify({ type: 'FeatureCollection', features: placeFeatures }));
fs.writeFileSync(path.join(OUT, 'areas', 'places.json'), JSON.stringify(placeAreas));
console.log(`  ${placeFeatures.length} cities/towns in region`);
console.log('gen-geo complete.');
