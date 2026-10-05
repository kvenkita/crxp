import { describe, it, expect } from 'vitest';
import { pointsFromOsm, pointsFromGeoJSON, regionPoints } from './points.js';

describe('pointsFromOsm', () => {
	it('keeps named nodes only', () => {
		const raw = { elements: [
			{ type: 'node', lat: 1, lon: 2, tags: { name: ' Dilworth ', place: 'neighbourhood' } },
			{ type: 'node', lat: 1, lon: 2, tags: { place: 'suburb' } },
			{ type: 'way', tags: { name: 'X' } }
		] };
		expect(pointsFromOsm(raw)).toEqual([{ name: 'Dilworth', lng: 2, lat: 1, type: 'neighbourhood' }]);
	});
});

describe('pointsFromGeoJSON', () => {
	it('reads Point features with a configurable name field', () => {
		const fc = { type: 'FeatureCollection', features: [
			{ type: 'Feature', geometry: { type: 'Point', coordinates: [-80.8, 35.2] }, properties: { NBHD: 'NoDa' } }
		] };
		expect(pointsFromGeoJSON(fc, 'NBHD')).toEqual({
			points: [{ name: 'NoDa', lng: -80.8, lat: 35.2, type: 'neighbourhood' }], skipped: 0
		});
	});

	it('skips unnamed and non-point features', () => {
		const fc = { type: 'FeatureCollection', features: [
			{ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} },
			{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: { name: 'P' } },
			{ type: 'Feature', geometry: { type: 'Point', coordinates: [1, 1] }, properties: { name: 'Ok' } }
		] };
		const { points, skipped } = pointsFromGeoJSON(fc);
		expect(points.map((p) => p.name)).toEqual(['Ok']);
		expect(skipped).toBe(2);
	});

	it('rejects non-FeatureCollection input', () => {
		expect(() => pointsFromGeoJSON({ type: 'Feature' })).toThrow(/FeatureCollection/);
	});
});

describe('regionPoints', () => {
	it('drops out-of-region points, dedupes by name+county, sorts by name', () => {
		const pts = [
			{ name: 'B', lng: 1, lat: 1, type: 't' },
			{ name: 'A', lng: 1, lat: 1, type: 't' },
			{ name: 'A', lng: 1.1, lat: 1, type: 't' },
			{ name: 'Out', lng: 9, lat: 9, type: 't' }
		];
		const county = (lng) => (lng < 5 ? 'Mecklenburg' : null);
		expect(regionPoints(pts, county)).toEqual([
			{ name: 'A', lng: 1, lat: 1, type: 't', county: 'Mecklenburg' },
			{ name: 'B', lng: 1, lat: 1, type: 't', county: 'Mecklenburg' }
		]);
	});
});
