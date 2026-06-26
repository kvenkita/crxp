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
 * Pearson product-moment correlation of two equal-length numeric arrays. Null if undefined.
 * @param {number[]} xs @param {number[]} ys
 */
export function pearson(xs, ys) {
	const n = xs.length;
	if (n < 2 || ys.length !== n) return null;
	let ma = 0, mb = 0;
	for (let i = 0; i < n; i++) {
		ma += xs[i];
		mb += ys[i];
	}
	ma /= n;
	mb /= n;
	let sab = 0, saa = 0, sbb = 0;
	for (let i = 0; i < n; i++) {
		const da = xs[i] - ma;
		const db = ys[i] - mb;
		sab += da * db;
		saa += da * da;
		sbb += db * db;
	}
	return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : null;
}

/** Fractional ranks (1-based), averaging ties. @param {number[]} xs */
function rankAverage(xs) {
	const order = xs.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
	const ranks = new Array(xs.length);
	let i = 0;
	while (i < order.length) {
		let j = i;
		while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
		const avg = (i + j) / 2 + 1;
		for (let k = i; k <= j; k++) ranks[order[k][1]] = avg;
		i = j + 1;
	}
	return ranks;
}

/**
 * Spearman rank correlation — more robust to skew/outliers and consistent with rank-tercile coloring.
 * @param {number[]} xs @param {number[]} ys
 */
export function spearman(xs, ys) {
	if (xs.length < 2 || ys.length !== xs.length) return null;
	return pearson(rankAverage(xs), rankAverage(ys));
}

// NOTE: LISA (Local Moran's I) is computed once in the data pipeline (crxp-data `spatial.py`,
// with a without-replacement conditional-permutation null + Benjamini-Hochberg FDR) and shipped as
// precomputed `analytics/lisa/<id>.json`. The app consumes those quadrants directly (see
// `lib/data/analytics.js`), so there is intentionally no client-side LISA/kNN here — that avoids a
// duplicated statistical implementation drifting from the pipeline's source of truth.
