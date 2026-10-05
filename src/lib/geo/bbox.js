/** [w, s, e, n] of every Polygon/MultiPolygon ring in a FeatureCollection. */
export function fcBbox(fc) {
	const b = [Infinity, Infinity, -Infinity, -Infinity];
	const scan = (ring) => {
		for (const [x, y] of ring) {
			if (x < b[0]) b[0] = x;
			if (y < b[1]) b[1] = y;
			if (x > b[2]) b[2] = x;
			if (y > b[3]) b[3] = y;
		}
	};
	for (const f of fc.features) {
		const g = f.geometry;
		if (!g) continue;
		(g.type === 'Polygon' ? g.coordinates : g.coordinates.flat()).forEach(scan);
	}
	return b;
}

/** "w,s,e,n" rounded to `decimals` (the Geoapify rect filter format). */
export function bboxRect(b, decimals = 4) {
	return b.map((v) => Number(v.toFixed(decimals))).join(',');
}
