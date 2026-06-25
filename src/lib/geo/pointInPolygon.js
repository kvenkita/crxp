/**
 * Point-in-polygon tests (ray casting). Pure, no deps.
 * Coordinates are [lng, lat] pairs; rings are arrays of coords.
 */

/** @param {[number,number]} pt @param {[number,number][]} ring */
export function ringContains(pt, ring) {
	const [x, y] = pt;
	let inside = false;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const [xi, yi] = ring[i];
		const [xj, yj] = ring[j];
		const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}
	return inside;
}

/** A single GeoJSON Polygon coords array: [outer, hole1, hole2, ...]. */
export function polygonContains(pt, polygon) {
	if (!polygon.length || !ringContains(pt, polygon[0])) return false;
	for (let i = 1; i < polygon.length; i++) if (ringContains(pt, polygon[i])) return false; // in a hole
	return true;
}

/** GeoJSON geometry (Polygon | MultiPolygon). @param {[number,number]} pt */
export function pointInPolygon(pt, geometry) {
	if (!geometry) return false;
	if (geometry.type === 'Polygon') return polygonContains(pt, geometry.coordinates);
	if (geometry.type === 'MultiPolygon') return geometry.coordinates.some((poly) => polygonContains(pt, poly));
	return false;
}
