import { describe, it, expect } from 'vitest';
import { bivariateColor, terciles, buildBivariatePaint, BIVARIATE_MATRIX } from './bivariate.js';

describe('bivariateColor', () => {
	it('maps the 3×3 corners', () => {
		expect(bivariateColor(0, 0)).toBe(BIVARIATE_MATRIX[0][0]);
		expect(bivariateColor(2, 2)).toBe(BIVARIATE_MATRIX[2][2]);
		expect(bivariateColor(2, 0)).toBe(BIVARIATE_MATRIX[2][0]);
	});
	it('clamps out-of-range classes', () => {
		expect(bivariateColor(5, -1)).toBe(BIVARIATE_MATRIX[2][0]);
	});
});

describe('terciles', () => {
	it('splits values into three classes', () => {
		const vals = {};
		for (let i = 0; i < 9; i++) vals['g' + i] = i; // 0..8
		const t = terciles(vals);
		expect(t['g0']).toBe(0);
		expect(t['g8']).toBe(2);
		const classes = new Set(Object.values(t));
		expect(classes.has(0) && classes.has(1) && classes.has(2)).toBe(true);
	});
	it('passes through nulls', () => {
		expect(terciles({ a: null, b: 5 }).a).toBeNull();
	});
});

describe('buildBivariatePaint', () => {
	it('returns a match expression on za/zb', () => {
		const expr = buildBivariatePaint();
		expect(expr[0]).toBe('match');
		expect(expr[1]).toEqual(['coalesce', ['feature-state', 'za'], 0]);
	});
});
