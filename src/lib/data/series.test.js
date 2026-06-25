import { describe, it, expect } from 'vitest';
import { seriesFor, seriesForSet, comparableChange } from './series.js';

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

describe('seriesForSet (multi-tract average)', () => {
	const vf = {
		indicatorId: 1,
		years: [2018, 2020, 2022],
		values: { '37119000100': [10, 12, 14], '37119000200': [20, 22, 24], '37071000100': [30, 30, 30] }
	};
	const agg = {
		1: { years: [2018, 2020, 2022], regionAvg: [20, 21, 22], countyAvg: { '37119': [15, 17, 19], '37071': [30, 30, 30] } }
	};

	it('averages the selected tracts and the involved counties', () => {
		const { series } = seriesForSet({ valueFile: vf, aggregates: agg, geoids: ['37119000100', '37119000200', '37071000100'], level: 'tract' });
		// area = mean of three tracts per year
		expect(series[0].values).toEqual([20, 64 / 3, 68 / 3]);
		expect(series[0].label).toBe('Selected (3)');
		// counties involved: 37119 + 37071 → mean of their county averages
		expect(series[1].values).toEqual([22.5, 23.5, 24.5]);
		expect(series[1].label).toBe('Counties avg (2)');
		expect(series[2].values).toEqual([20, 21, 22]); // region
	});

	it('handles a single tract', () => {
		const { series } = seriesForSet({ valueFile: vf, aggregates: agg, geoids: ['37119000100'], level: 'tract' });
		expect(series[0].values).toEqual([10, 12, 14]);
		expect(series[1].label).toBe('County avg');
	});
});

describe('comparableChange (non-overlapping endpoints + significance)', () => {
	// 2019 and 2024 are 5 years apart (non-overlapping ACS windows)
	const vf = {
		years: [2019, 2020, 2021, 2022, 2023, 2024],
		values: { A: [10, 11, 12, 13, 14, 20], B: [10, 10, 10, 10, 10, 11] },
		moe: { A: [1, 1, 1, 1, 1, 1], B: [3, 3, 3, 3, 3, 3] }
	};

	it('uses the latest 5-year-apart pair and flags a significant change', () => {
		const c = comparableChange(vf, 'A');
		expect(c.y1).toBe(2019);
		expect(c.y2).toBe(2024);
		expect(c.delta).toBe(10); // 20 - 10
		expect(c.significant).toBe(true); // 10 / sqrt((1/1.645)^2*2) >> 1.645
	});

	it('flags a small change within error as not significant', () => {
		const c = comparableChange(vf, 'B');
		expect(c.delta).toBe(1);
		expect(c.significant).toBe(false);
	});

	it('returns null when no non-overlapping pair exists', () => {
		expect(comparableChange({ years: [2022, 2023, 2024], values: { A: [1, 2, 3] } }, 'A')).toBeNull();
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
