import { describe, it, expect } from 'vitest';
import { fcBbox, bboxRect, padBbox } from './bbox.js';

describe('fcBbox', () => {
	it('covers Polygon and MultiPolygon features', () => {
		const fc = { features: [
			{ geometry: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 1], [0, 0]]] } },
			{ geometry: { type: 'MultiPolygon', coordinates: [[[[-1, -3], [0, -3], [0, 5], [-1, -3]]]] } },
			{ geometry: null }
		] };
		expect(fcBbox(fc)).toEqual([-1, -3, 2, 5]);
	});
});

describe('bboxRect', () => {
	it('formats w,s,e,n rounded to 4 decimals', () => {
		expect(bboxRect([-81.818123, 34.40781, -79.79871, 36.108849])).toBe('-81.8181,34.4078,-79.7987,36.1088');
	});
});

describe('padBbox', () => {
	it('expands every side by the pad', () => {
		expect(padBbox([-81.7681, 34.4578, -79.8487, 36.0588], 0.05).map((v) => Number(v.toFixed(4))))
			.toEqual([-81.8181, 34.4078, -79.7987, 36.1088]);
	});
});
