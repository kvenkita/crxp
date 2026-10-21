import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { snapshot, restore, actions, runAction } from './demo.js';
import { DEMO } from './demo-config.js';
import { STEPS } from './steps.js';
import { explorer } from '$lib/state/explorer.svelte.js';
import { selection } from '$lib/state/selection.svelte.js';
import { analysis } from '$lib/state/analysis.svelte.js';
import { manifest } from '$lib/state/manifest.svelte.js';

const DATA = path.resolve(__dirname, '..', '..', '..', 'static', 'data');
/** @param {string} rel */
const read = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

beforeAll(() => {
	manifest.indicators = read('manifest.json').indicators;
});

const state = () => ({
	indicatorId: explorer.indicatorId,
	year: explorer.year,
	geoLevel: explorer.geoLevel,
	selectedIds: [...selection.selectedIds],
	legendFilter: selection.legendFilter,
	legendSticky: selection.legendSticky,
	mode: analysis.mode,
	biB: analysis.biB,
	lisaQuadrants: [...analysis.lisaQuadrants]
});

describe('demo constants match the published data', () => {
	it('indicators exist, with the expected slug and cluster data', () => {
		const a = manifest.indicators.find((i) => i.id === DEMO.indicatorId);
		const b = manifest.indicators.find((i) => i.id === DEMO.bivariateB);
		expect(a?.slug).toBe(DEMO.indicatorSlug);
		expect(a?.hasLisa).toBe(true);
		expect(b).toBeTruthy();
	});
	it('sample and report tracts have a latest-year value', () => {
		const v = read(`values/${DEMO.indicatorId}.json`);
		const y = v.years.length - 1;
		for (const g of [DEMO.tract, ...DEMO.reportTracts]) expect(v.values[g]?.[y], g).toBeTypeOf('number');
	});
	it('the demo county is one of the region\'s counties', () => {
		const agg = read('aggregates.json')[String(DEMO.indicatorId)];
		expect(Object.keys(agg.countyAvg)).toContain(DEMO.county);
	});
});

describe('step actions', () => {
	it('every step action is a demo action', () => {
		for (const s of STEPS.filter((t) => t.action)) {
			expect(actions[/** @type {keyof typeof actions} */ (s.action)], s.id).toBeTypeOf('function');
		}
	});
});

describe('snapshot and restore', () => {
	it('every action runs, and restore returns the state exactly', () => {
		explorer.indicatorId = 12;
		explorer.year = 2019;
		explorer.geoLevel = 'county';
		selection.selectedIds = ['37119', '37025'];
		selection.legendFilter = { min: 1, max: 2 };
		selection.legendSticky = true;
		analysis.mode = 'lisa';
		analysis.biB = 40;
		analysis.lisaQuadrants = [1, 3];
		const before = state();

		snapshot();
		for (const name of Object.keys(actions)) runAction(name);
		expect(state()).not.toEqual(before);
		restore();
		expect(state()).toEqual(before);
	});
	it('the actions set up what each step describes', () => {
		snapshot();
		actions.base();
		expect(state()).toMatchObject({ indicatorId: DEMO.indicatorId, geoLevel: 'tract', mode: 'explore', selectedIds: [], legendFilter: null });
		expect(explorer.year).toBe(manifest.indicators.find((i) => i.id === DEMO.indicatorId)?.years.at(-1));
		actions.sample();
		expect(selection.selectedIds).toEqual([DEMO.tract]);
		actions.bivariate();
		expect(state()).toMatchObject({ mode: 'bivariate', biB: DEMO.bivariateB });
		actions.clusters();
		expect(analysis.mode).toBe('lisa');
		actions.explore();
		expect(state()).toMatchObject({ mode: 'explore', selectedIds: [DEMO.tract] });
		restore();
	});
	it('restore without a snapshot does nothing', () => {
		const before = state();
		restore();
		expect(state()).toEqual(before);
	});
});
