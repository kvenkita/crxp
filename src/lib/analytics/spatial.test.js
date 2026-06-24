import { describe, it, expect } from 'vitest';
import { zScores, quantileBreaks, summarize, knnWeights, localMoran, LISA } from './spatial.js';

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

describe('localMoran', () => {
	it('labels a clear high-high cluster as HH', () => {
		// 5x5 grid; high values clustered in the top-left corner.
		const pts = [];
		const obs = [];
		for (let r = 0; r < 5; r++) {
			for (let c = 0; c < 5; c++) {
				const id = `${r}_${c}`;
				pts.push({ id, x: c, y: r });
				const high = r < 2 && c < 2;
				obs.push({ id, value: high ? 100 + r + c : 1 + r + c });
			}
		}
		const w = knnWeights(pts, 4);
		const res = localMoran(obs, w, { perms: 99, rng: mulberry32(42) });
		// the inner corner cell should be a significant HH cluster
		expect(res.get('0_0').quadrant).toBe(LISA.HH);
	});
});

// deterministic RNG for stable tests
function mulberry32(seed) {
	let a = seed >>> 0;
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
