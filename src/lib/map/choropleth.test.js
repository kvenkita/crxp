import { describe, it, expect } from 'vitest';
import { buildChoropleth } from './choropleth.js';

const indicator = { id: 7, format: 'pct', decimals: 1 };
const accent = '#1f6f63';

const valueFile = {
	indicatorId: 7,
	years: [2020, 2021],
	values: { '37119000100': [1.5, 2.5], '37119000200': [3.0, null] },
	reliability: { '37119000100': ['ok', 'caution'] },
	breaks: [2, 3],
	domain: { min: 1, max: 4 }
};

const aggregates = {
	7: {
		years: [2020, 2021],
		countyAvg: { '37119': [2.1, 2.4], '37179': [1.1, 1.3] },
		breaks: [1.5, 2.0],
		domain: { min: 1, max: 3 }
	}
};

describe('buildChoropleth', () => {
	it('returns null without an indicator or year', () => {
		expect(buildChoropleth({ indicator: null, year: 2020, geoLevel: 'tract', valueFile, accent })).toBeNull();
		expect(buildChoropleth({ indicator, year: null, geoLevel: 'tract', valueFile, accent })).toBeNull();
	});

	it('builds tract values + reliability for the year', () => {
		const c = buildChoropleth({ indicator, year: 2021, geoLevel: 'tract', valueFile, accent });
		expect(c.valuesByGeoid).toEqual({ '37119000100': 2.5, '37119000200': null });
		expect(c.reliabilityByGeoid).toEqual({ '37119000100': 'caution' });
		expect(c.breaks).toEqual([2, 3]);
		expect(c.colors).toHaveLength(3);
		expect(c.stats).toEqual({ min: 1, max: 4, breaks: [2, 3] });
	});

	it('rejects a stale value file from a previous indicator', () => {
		const stale = { ...valueFile, indicatorId: 99 };
		expect(buildChoropleth({ indicator, year: 2020, geoLevel: 'tract', valueFile: stale, accent })).toBeNull();
	});

	it('builds county values from aggregates', () => {
		const c = buildChoropleth({ indicator, year: 2020, geoLevel: 'county', aggregates, accent });
		expect(c.valuesByGeoid).toEqual({ '37119': 2.1, '37179': 1.1 });
		expect(c.stats.min).toBe(1);
	});

	it('yields an EMPTY county choropleth for a year without county data', () => {
		const c = buildChoropleth({ indicator, year: 2019, geoLevel: 'county', aggregates, accent });
		expect(c.valuesByGeoid).toEqual({});
		expect(c.breaks).toEqual([1.5, 2.0]);
	});
});
