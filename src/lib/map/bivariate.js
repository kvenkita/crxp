/**
 * Bivariate choropleth helpers (3×3). Pure functions.
 * Rows = variable A (low→high), columns = variable B (low→high).
 */
import { quantileBreaks } from '../analytics/spatial.js';

// Classic GeoViz bivariate palette (teal axis × purple axis).
export const BIVARIATE_MATRIX = [
	['#e8e8e8', '#dfb0d6', '#be64ac'],
	['#ace4e4', '#a5add3', '#8c62aa'],
	['#5ac8c8', '#5698b9', '#3b4994']
];

/** @param {number} ca 0..2 @param {number} cb 0..2 */
export function bivariateColor(ca, cb, matrix = BIVARIATE_MATRIX) {
	const a = Math.max(0, Math.min(2, ca));
	const b = Math.max(0, Math.min(2, cb));
	return matrix[a][b];
}

/**
 * Assign each geoid a tercile class 0/1/2 based on its value.
 * @param {Record<string, number|null>} valuesByGeoid
 * @returns {Record<string, number|null>}
 */
export function terciles(valuesByGeoid) {
	const breaks = quantileBreaks(Object.values(valuesByGeoid), 3); // up to 2 interior breaks
	const out = {};
	for (const [geoid, v] of Object.entries(valuesByGeoid)) {
		if (v == null || !Number.isFinite(v)) {
			out[geoid] = null;
			continue;
		}
		let c = 0;
		for (const b of breaks) if (v >= b) c++;
		out[geoid] = Math.min(c, 2);
	}
	return out;
}

/**
 * MapLibre paint expression for the 3×3 bivariate matrix, reading
 * feature-state "za" and "zb" (tercile classes 0/1/2).
 */
export function buildBivariatePaint(matrix = BIVARIATE_MATRIX) {
	const colExpr = (a) => [
		'match',
		['coalesce', ['feature-state', 'zb'], 0],
		0, matrix[a][0],
		1, matrix[a][1],
		2, matrix[a][2],
		matrix[a][0]
	];
	return [
		'match',
		['coalesce', ['feature-state', 'za'], 0],
		0, colExpr(0),
		1, colExpr(1),
		2, colExpr(2),
		colExpr(0)
	];
}
