import { describe, it, expect } from 'vitest';
import { seriesFor } from './series.js';

const valueFile = {
	indicatorId: 1,
	years: [2018, 2020, 2022],
	values: { '37119000100': [10, 12, 14] }
};
const aggregates = {
	1: {
		years: [2018, 2020, 2022],
		regionAvg: [20, 21, 22],
		countyAvg: { '37119': [15, 16, 17] }
	}
};

describe('seriesFor (tract)', () => {
	const { years, series } = seriesFor({ valueFile, aggregates, geoid: '37119000100', level: 'tract' });

	it('aligns three series to the years', () => {
		expect(years).toEqual([2018, 2020, 2022]);
		expect(series.length).toBe(3);
		expect(series[0].values).toEqual([10, 12, 14]); // tract
		expect(series[1].values).toEqual([15, 16, 17]); // county (by prefix)
		expect(series[2].values).toEqual([20, 21, 22]); // region
	});

	it('staggers animation delays', () => {
		expect(series.map((s) => s.delay)).toEqual([0, 150, 300]);
	});
});

describe('seriesFor (county)', () => {
	it('uses county avg as the primary series', () => {
		const { series } = seriesFor({ valueFile, aggregates, geoid: '37119', level: 'county' });
		expect(series.length).toBe(2);
		expect(series[0].values).toEqual([15, 16, 17]);
		expect(series[1].values).toEqual([20, 21, 22]);
	});
});
