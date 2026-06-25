import { describe, it, expect } from 'vitest';
import { tractShares, tractLabel } from './assign.js';

const square = { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] };

describe('tractShares', () => {
	it('assigns ~100% to a single contained neighborhood', () => {
		const { shares, nearestDistKm } = tractShares(square, [{ name: 'A', lng: 0.5, lat: 0.5 }]);
		expect(shares).toEqual([{ name: 'A', share: 1 }]);
		expect(nearestDistKm).toBeLessThan(1);
	});

	it('splits a tract between two neighborhoods', () => {
		const { shares } = tractShares(square, [
			{ name: 'West', lng: 0.2, lat: 0.5 },
			{ name: 'East', lng: 0.8, lat: 0.5 }
		]);
		expect(shares.map((s) => s.name).sort()).toEqual(['East', 'West']);
		expect(shares[0].share).toBeGreaterThan(0.3);
		expect(shares[1].share).toBeGreaterThan(0.3);
	});

	it('reports a large nearest distance when all points are far', () => {
		const { nearestDistKm } = tractShares(square, [{ name: 'Far', lng: 10, lat: 10 }]);
		expect(nearestDistKm).toBeGreaterThan(100);
	});

	it('drops neighborhoods below the share threshold', () => {
		// one dominant + a sliver in a corner
		const { shares } = tractShares(square, [
			{ name: 'Big', lng: 0.5, lat: 0.5 },
			{ name: 'Tiny', lng: 0.99, lat: 0.99 }
		], { shareMin: 0.2 });
		expect(shares.some((s) => s.name === 'Big')).toBe(true);
	});
});

describe('tractLabel', () => {
	it('one neighborhood → "X area"', () => {
		expect(tractLabel({ shares: [{ name: 'Plaza Midwood', share: 1 }], nearestDistKm: 1 })).toBe('Plaza Midwood area');
	});
	it('two/three → joined with /', () => {
		expect(
			tractLabel({ shares: [{ name: 'A', share: 0.6 }, { name: 'B', share: 0.4 }], nearestDistKm: 1 })
		).toBe('A / B');
	});
	it('falls back to city when nearest is beyond the distance cap', () => {
		expect(tractLabel({ shares: [{ name: 'Far', share: 1 }], nearestDistKm: 50, placeName: 'Concord' }, { distCapKm: 8 })).toBe('Concord');
	});
	it('falls back to county when no city', () => {
		expect(tractLabel({ shares: [], nearestDistKm: Infinity, countyName: 'Anson County' })).toBe('Anson County');
	});
});
