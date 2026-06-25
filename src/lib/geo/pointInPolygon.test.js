import { describe, it, expect } from 'vitest';
import { ringContains, pointInPolygon } from './pointInPolygon.js';

const square = [[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]];

describe('ringContains', () => {
	it('detects inside / outside', () => {
		expect(ringContains([2, 2], square)).toBe(true);
		expect(ringContains([5, 2], square)).toBe(false);
	});
});

describe('pointInPolygon', () => {
	it('Polygon with a hole excludes the hole', () => {
		const hole = [[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]];
		const geom = { type: 'Polygon', coordinates: [square, hole] };
		expect(pointInPolygon([0.5, 0.5], geom)).toBe(true);
		expect(pointInPolygon([2, 2], geom)).toBe(false); // inside hole
	});
	it('MultiPolygon matches any part', () => {
		const geom = {
			type: 'MultiPolygon',
			coordinates: [[square], [[[10, 10], [12, 10], [12, 12], [10, 12], [10, 10]]]]
		};
		expect(pointInPolygon([11, 11], geom)).toBe(true);
		expect(pointInPolygon([6, 6], geom)).toBe(false);
	});
});
