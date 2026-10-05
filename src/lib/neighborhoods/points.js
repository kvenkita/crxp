// Neighborhood point acquisition for gen-neighborhoods.mjs: OpenStreetMap (default) or a local
// GeoJSON points file. Both produce the same {name, lng, lat, type} shape for tractShares().

/** Named OSM nodes from an Overpass response. */
export function pointsFromOsm(raw) {
	const out = [];
	for (const el of raw.elements || []) {
		if (el.type !== 'node' || !el.tags?.name) continue;
		out.push({ name: el.tags.name.trim(), lng: el.lon, lat: el.lat, type: el.tags.place });
	}
	return out;
}

/** Named Point features from a GeoJSON FeatureCollection. */
export function pointsFromGeoJSON(fc, nameField = 'name') {
	if (fc?.type !== 'FeatureCollection' || !Array.isArray(fc.features)) {
		throw new Error('points file must be a GeoJSON FeatureCollection of Point features');
	}
	const points = [];
	let skipped = 0;
	for (const f of fc.features) {
		const name = String(f.properties?.[nameField] ?? '').trim();
		if (f.geometry?.type !== 'Point' || !name) {
			skipped++;
			continue;
		}
		const [lng, lat] = f.geometry.coordinates;
		points.push({ name, lng, lat, type: f.properties.place ?? 'neighbourhood' });
	}
	return { points, skipped };
}

/** Keep in-region points, dedupe by name+county, sort by name. */
export function regionPoints(points, countyName) {
	const seen = new Set();
	const out = [];
	for (const p of points) {
		const county = countyName(p.lng, p.lat);
		if (!county) continue;
		const key = `${p.name}|${county}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push({ name: p.name, lng: p.lng, lat: p.lat, type: p.type, county });
	}
	return out.sort((a, b) => a.name.localeCompare(b.name));
}
