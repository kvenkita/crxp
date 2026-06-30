import { describe, it, expect, beforeEach } from 'vitest';
import { loadTractIndex, inRegion, tractAtPoint, _resetCache } from './locate.js';

const FC = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			properties: { geoid: '37119000100' },
			geometry: { type: 'Polygon', coordinates: [[[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]]] }
		},
		{
			type: 'Feature',
			properties: { geoid: '37119000200' },
			geometry: { type: 'Polygon', coordinates: [[[2, 2], [4, 2], [4, 4], [2, 4], [2, 2]]] }
		}
	]
};

const fakeFetch = async () => ({ ok: true, json: async () => FC });

describe('tract locate index', () => {
	beforeEach(_resetCache);

	it('loads geoids and features', async () => {
		const idx = await loadTractIndex('', fakeFetch);
		expect(idx.ids.has('37119000100')).toBe(true);
		expect(idx.feats).toHaveLength(2);
	});

	it('reports region membership by geoid', async () => {
		const idx = await loadTractIndex('', fakeFetch);
		expect(inRegion(idx, '37119000200')).toBe(true);
		expect(inRegion(idx, '99999999999')).toBe(false);
		expect(inRegion(idx, null)).toBe(false);
	});

	it('finds the tract containing a point ([lon,lat]), or null when outside', async () => {
		const idx = await loadTractIndex('', fakeFetch);
		expect(tractAtPoint(idx, 0, 0)).toBe('37119000100');
		expect(tractAtPoint(idx, 3, 3)).toBe('37119000200');
		expect(tractAtPoint(idx, 50, 50)).toBe(null);
	});

	it('throws when the geojson is unavailable', async () => {
		await expect(loadTractIndex('', async () => ({ ok: false }))).rejects.toThrow();
	});
});
