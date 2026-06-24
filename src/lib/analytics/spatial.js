/**
 * Spatial + descriptive statistics used by the data pipeline and the
 * in-app analytics modes (bivariate z-scores, LISA spatial clusters).
 * Pure functions — no fs, no DOM. Safe to import from Node scripts and the browser.
 */

/** @param {number[]} xs */
export function mean(xs) {
	if (!xs.length) return NaN;
	return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample standard deviation. @param {number[]} xs */
export function std(xs) {
	if (xs.length < 2) return 0;
	const m = mean(xs);
	const v = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1);
	return Math.sqrt(v);
}

/**
 * Standardize values to mean 0, sd 1. Non-finite inputs map to null.
 * @param {(number|null|undefined)[]} values
 * @returns {(number|null)[]}
 */
export function zScores(values) {
	const finite = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
	const m = mean(finite);
	const s = std(finite);
	return values.map((v) =>
		typeof v === 'number' && Number.isFinite(v) && s > 0 ? (v - m) / s : null
	);
}

/**
 * Linear-interpolated percentile of a value array (p in [0,1]).
 * @param {number[]} sorted ascending-sorted finite values
 * @param {number} p
 */
export function percentileSorted(sorted, p) {
	if (!sorted.length) return NaN;
	if (p <= 0) return sorted[0];
	if (p >= 1) return sorted[sorted.length - 1];
	const idx = p * (sorted.length - 1);
	const lo = Math.floor(idx);
	const hi = Math.ceil(idx);
	if (lo === hi) return sorted[lo];
	return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * Quantile class breaks: returns the (n-1) interior break values for n classes.
 * @param {(number|null|undefined)[]} values
 * @param {number} n number of classes (default 5)
 * @returns {number[]}
 */
export function quantileBreaks(values, n = 5) {
	const sorted = values
		.filter((v) => typeof v === 'number' && Number.isFinite(v))
		.sort((a, b) => a - b);
	if (sorted.length === 0) return [];
	const breaks = [];
	for (let i = 1; i < n; i++) {
		breaks.push(percentileSorted(sorted, i / n));
	}
	// de-duplicate degenerate breaks (e.g. many identical values)
	return breaks.filter((b, i) => i === 0 || b > breaks[i - 1]);
}

/**
 * Summary stats for a year's values.
 * @param {(number|null|undefined)[]} values
 * @param {number} classes
 */
export function summarize(values, classes = 5) {
	const sorted = values
		.filter((v) => typeof v === 'number' && Number.isFinite(v))
		.sort((a, b) => a - b);
	if (!sorted.length) return { min: 0, max: 0, p1: 0, p99: 0, breaks: [] };
	return {
		min: sorted[0],
		max: sorted[sorted.length - 1],
		p1: percentileSorted(sorted, 0.01),
		p99: percentileSorted(sorted, 0.99),
		breaks: quantileBreaks(values, classes)
	};
}

/**
 * k-nearest-neighbour spatial weights (row-standardized) from points.
 * @param {{id:string, x:number, y:number}[]} points
 * @param {number} k
 * @returns {Map<string, {id:string, w:number}[]>}
 */
export function knnWeights(points, k = 8) {
	const weights = new Map();
	for (const a of points) {
		const dists = [];
		for (const b of points) {
			if (a.id === b.id) continue;
			const dx = a.x - b.x;
			const dy = a.y - b.y;
			dists.push({ id: b.id, d: dx * dx + dy * dy });
		}
		dists.sort((p, q) => p.d - q.d);
		const nn = dists.slice(0, Math.min(k, dists.length));
		const w = nn.length ? 1 / nn.length : 0;
		weights.set(
			a.id,
			nn.map((n) => ({ id: n.id, w }))
		);
	}
	return weights;
}

// LISA quadrant codes (align with LisaLegend colors)
export const LISA = { NS: 0, HH: 1, LH: 2, LL: 3, HL: 4 };

/**
 * Local Moran's I (LISA) with conditional-permutation pseudo significance.
 * @param {{id:string, value:(number|null)}[]} obs
 * @param {Map<string, {id:string,w:number}[]>} weights
 * @param {{perms?:number, alpha?:number, rng?:()=>number}} [opts]
 * @returns {Map<string, {quadrant:number, I:number, sig:boolean}>}
 */
export function localMoran(obs, weights, opts = {}) {
	const perms = opts.perms ?? 199;
	const alpha = opts.alpha ?? 0.05;
	const rng = opts.rng ?? Math.random;

	const ids = obs.map((o) => o.id);
	const raw = obs.map((o) => o.value);
	const z = zScores(raw); // standardized, null where missing
	const zById = new Map();
	ids.forEach((id, i) => zById.set(id, z[i]));

	const result = new Map();

	// pool of valid z-values for permutation
	const pool = z.filter((v) => v !== null);

	for (let i = 0; i < ids.length; i++) {
		const id = ids[i];
		const zi = zById.get(id);
		const nbrs = weights.get(id) || [];
		if (zi === null || nbrs.length === 0) {
			result.set(id, { quadrant: LISA.NS, I: 0, sig: false });
			continue;
		}
		// observed spatial lag (row-standardized over valid neighbours)
		let lag = 0;
		let wsum = 0;
		for (const nb of nbrs) {
			const zj = zById.get(nb.id);
			if (zj === null || zj === undefined) continue;
			lag += nb.w * zj;
			wsum += nb.w;
		}
		if (wsum === 0) {
			result.set(id, { quadrant: LISA.NS, I: 0, sig: false });
			continue;
		}
		lag = lag / wsum;
		const Ii = zi * lag;

		// quadrant
		let quadrant;
		if (zi >= 0 && lag >= 0) quadrant = LISA.HH;
		else if (zi < 0 && lag < 0) quadrant = LISA.LL;
		else if (zi >= 0 && lag < 0) quadrant = LISA.HL;
		else quadrant = LISA.LH;

		// conditional permutation: resample neighbour z's from the pool
		const kEff = nbrs.length;
		let geCount = 0;
		for (let p = 0; p < perms; p++) {
			let permLag = 0;
			for (let m = 0; m < kEff; m++) {
				const zj = pool[Math.floor(rng() * pool.length)];
				permLag += zj;
			}
			permLag = permLag / kEff;
			const permI = zi * permLag;
			if (Math.abs(permI) >= Math.abs(Ii)) geCount++;
		}
		const pseudoP = (geCount + 1) / (perms + 1);
		const sig = pseudoP <= alpha;
		result.set(id, { quadrant: sig ? quadrant : LISA.NS, I: Ii, sig });
	}
	return result;
}
