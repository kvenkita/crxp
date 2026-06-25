/**
 * Assign tracts to OSM neighborhood points via Voronoi area-weighting
 * (deterministic grid sampling + nearest-point). Pure, no deps.
 */
import { pointInPolygon } from '../geo/pointInPolygon.js';

export const DEFAULTS = { grid: 24, shareMin: 0.15, maxNames: 3, distCapKm: 8 };

function bboxOf(geometry) {
	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	const scan = (ring) => {
		for (const [x, y] of ring) {
			if (x < minX) minX = x;
			if (y < minY) minY = y;
			if (x > maxX) maxX = x;
			if (y > maxY) maxY = y;
		}
	};
	if (geometry.type === 'Polygon') geometry.coordinates.forEach(scan);
	else if (geometry.type === 'MultiPolygon') geometry.coordinates.forEach((p) => p.forEach(scan));
	return [minX, minY, maxX, maxY];
}

/** Great-circle distance in km between [lng,lat] points. */
export function haversineKm(a, b) {
	const R = 6371;
	const toRad = (d) => (d * Math.PI) / 180;
	const dLat = toRad(b[1] - a[1]);
	const dLng = toRad(b[0] - a[0]);
	const la1 = toRad(a[1]);
	const la2 = toRad(b[1]);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function nearestPoint(coord, points) {
	let best = null;
	let bestD = Infinity;
	for (const p of points) {
		const dx = coord[0] - p.lng;
		const dy = coord[1] - p.lat;
		const d = dx * dx + dy * dy;
		if (d < bestD) {
			bestD = d;
			best = p;
		}
	}
	return best;
}

/**
 * Compute a tract's neighborhood shares by grid-sampling its interior and
 * assigning each sample to the nearest neighborhood point.
 * @param {object} tractGeom GeoJSON geometry
 * @param {{name:string,lng:number,lat:number}[]} points
 * @param {Partial<typeof DEFAULTS>} [opts]
 * @returns {{shares:{name:string,share:number}[], nearestName:string|null, nearestDistKm:number}}
 */
export function tractShares(tractGeom, points, opts = {}) {
	const { grid, shareMin, maxNames } = { ...DEFAULTS, ...opts };
	const [minX, minY, maxX, maxY] = bboxOf(tractGeom);
	const centroid = [(minX + maxX) / 2, (minY + maxY) / 2];

	if (!points.length) return { shares: [], nearestName: null, nearestDistKm: Infinity };

	const np = nearestPoint(centroid, points);
	const nearestDistKm = haversineKm(centroid, [np.lng, np.lat]);

	// deterministic grid of sample points across the bbox; keep interior ones
	const counts = new Map();
	let total = 0;
	const stepX = (maxX - minX) / grid || 1;
	const stepY = (maxY - minY) / grid || 1;
	for (let i = 0; i < grid; i++) {
		for (let j = 0; j < grid; j++) {
			const pt = [minX + (i + 0.5) * stepX, minY + (j + 0.5) * stepY];
			if (!pointInPolygon(pt, tractGeom)) continue;
			total++;
			const n = nearestPoint(pt, points);
			counts.set(n.name, (counts.get(n.name) || 0) + 1);
		}
	}
	if (total === 0) {
		// degenerate/tiny tract: fall back to the nearest point alone
		return { shares: [{ name: np.name, share: 1 }], nearestName: np.name, nearestDistKm };
	}

	const shares = [...counts.entries()]
		.map(([name, c]) => ({ name, share: c / total }))
		.sort((a, b) => b.share - a.share || a.name.localeCompare(b.name))
		.filter((s) => s.share >= shareMin)
		.slice(0, maxNames)
		.map((s) => ({ name: s.name, share: Math.round(s.share * 100) / 100 }));

	return { shares, nearestName: np.name, nearestDistKm };
}

/**
 * Build the display label for a tract.
 * @param {{shares:{name:string,share:number}[], nearestDistKm:number, placeName?:string, countyName?:string}} info
 * @param {Partial<typeof DEFAULTS>} [opts]
 * @returns {string}
 */
export function tractLabel(info, opts = {}) {
	const { distCapKm } = { ...DEFAULTS, ...opts };
	const { shares = [], nearestDistKm = Infinity, placeName, countyName } = info;
	if (!shares.length || nearestDistKm > distCapKm) {
		return placeName || countyName || '';
	}
	const names = shares.map((s) => s.name);
	if (names.length === 1) return `${names[0]} area`;
	return names.join(' / ');
}
