import { describe, it, expect } from 'vitest';
import { zScores, quantileBreaks, summarize } from './spatial.js';
// LISA/kNN live in the data pipeline (crxp-data spatial.py) and ship precomputed; not tested here.

describe('zScores', () => {
	it('produces mean 0 sd 1 and passes through nulls', () => {
		const z = zScores([1, 2, 3, 4, 5]);
		const m = z.reduce((a, b) => a + b, 0) / z.length;
		expect(Math.abs(m)).toBeLessThan(1e-9);
		expect(z[0]).toBeLessThan(0);
		expect(z[4]).toBeGreaterThan(0);
	});
	it('maps non-finite to null', () => {
		const z = zScores([1, null, 3, NaN, 5]);
		expect(z[1]).toBeNull();
		expect(z[3]).toBeNull();
	});
});

describe('quantileBreaks / summarize', () => {
	it('returns n-1 increasing breaks', () => {
		const b = quantileBreaks([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
		expect(b.length).toBe(4);
		for (let i = 1; i < b.length; i++) expect(b[i]).toBeGreaterThan(b[i - 1]);
	});
	it('summarize reports min/max/p1/p99', () => {
		const s = summarize([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], 5);
		expect(s.min).toBe(0);
		expect(s.max).toBe(100);
		expect(s.p99).toBeGreaterThan(90);
	});
});
