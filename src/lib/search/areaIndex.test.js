import { describe, it, expect } from 'vitest';
import { buildAreaIndex, searchAreas } from './areaIndex.js';

const areas = [
	{ geoid: '37119', name: 'Mecklenburg County', level: 'county' },
	{ geoid: '37071', name: 'Gaston County', level: 'county' },
	{ geoid: '37119000100', name: 'Census Tract 1', county: 'Mecklenburg County', level: 'tract' }
];

describe('areaIndex', () => {
	const idx = buildAreaIndex(areas);

	it('finds a county by partial name', () => {
		const r = searchAreas(idx, 'meck');
		expect(r[0].geoid).toBe('37119');
	});

	it('returns [] for empty query', () => {
		expect(searchAreas(idx, '')).toEqual([]);
	});

	it('respects the limit', () => {
		expect(searchAreas(idx, 'county', 1).length).toBe(1);
	});
});
