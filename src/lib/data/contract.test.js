import { describe, it, expect } from 'vitest';
import { validateManifest, validateValueFile } from './contract.js';

const goodManifest = {
	categories: [{ key: 'economy', label: 'Economy' }],
	indicators: [
		{ id: 1, slug: 'median-income', label: 'Median Income', category: 'economy', format: 'dollar', years: [2020, 2022] }
	]
};

describe('validateManifest', () => {
	it('accepts a valid manifest', () => {
		expect(validateManifest(goodManifest).ok).toBe(true);
	});

	it('rejects missing required indicator fields', () => {
		const m = { categories: [{ key: 'economy', label: 'Economy' }], indicators: [{ id: 1 }] };
		const r = validateManifest(m);
		expect(r.ok).toBe(false);
		expect(r.errors.join(' ')).toMatch(/slug/);
	});

	it('rejects duplicate slugs', () => {
		const m = {
			categories: [{ key: 'economy', label: 'Economy' }],
			indicators: [
				{ id: 1, slug: 'x', label: 'A', category: 'economy', format: 'dollar', years: [2020] },
				{ id: 2, slug: 'x', label: 'B', category: 'economy', format: 'dollar', years: [2020] }
			]
		};
		const r = validateManifest(m);
		expect(r.ok).toBe(false);
		expect(r.errors.join(' ')).toMatch(/slug duplicate/);
	});

	it('rejects an invalid format', () => {
		const m = JSON.parse(JSON.stringify(goodManifest));
		m.indicators[0].format = 'banana';
		expect(validateManifest(m).ok).toBe(false);
	});

	it('rejects a category not declared in categories', () => {
		const m = JSON.parse(JSON.stringify(goodManifest));
		m.indicators[0].category = 'ghost';
		const r = validateManifest(m);
		expect(r.ok).toBe(false);
		expect(r.errors.join(' ')).toMatch(/not in categories/);
	});
});

describe('validateValueFile', () => {
	const indicator = goodManifest.indicators[0];
	const goodFile = {
		years: [2020, 2022],
		values: { '37119000100': [50000, 52000] },
		stats: {
			2020: { min: 10000, max: 90000, p1: 12000, p99: 88000, breaks: [30000, 50000, 70000] },
			2022: { min: 11000, max: 92000, p1: 13000, p99: 89000, breaks: [31000, 51000, 71000] }
		}
	};

	it('accepts a valid value file', () => {
		const r = validateValueFile(goodFile, indicator, new Set(['37119000100']));
		expect(r.ok).toBe(true);
	});

	it('rejects a geoid not in the area manifest', () => {
		const r = validateValueFile(goodFile, indicator, new Set(['99999999999']));
		expect(r.ok).toBe(false);
		expect(r.errors.join(' ')).toMatch(/not in area manifest/);
	});

	it('rejects missing breaks for a year', () => {
		const bad = JSON.parse(JSON.stringify(goodFile));
		delete bad.stats[2020].breaks;
		const r = validateValueFile(bad, indicator, new Set(['37119000100']));
		expect(r.ok).toBe(false);
		expect(r.errors.join(' ')).toMatch(/breaks/);
	});

	it('rejects a value row whose length != years', () => {
		const bad = JSON.parse(JSON.stringify(goodFile));
		bad.values['37119000100'] = [50000];
		const r = validateValueFile(bad, indicator, new Set(['37119000100']));
		expect(r.ok).toBe(false);
		expect(r.errors.join(' ')).toMatch(/length/);
	});
});
