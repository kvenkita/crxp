import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { crossCheck } from './build-data.mjs';

/** Write a minimal, valid data-contract directory; return its path. */
function makeGoodDir() {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'crxp-contract-'));
	const w = (rel, obj) => {
		const p = path.join(dir, rel);
		fs.mkdirSync(path.dirname(p), { recursive: true });
		fs.writeFileSync(p, typeof obj === 'string' ? obj : JSON.stringify(obj));
	};
	const years = [2019, 2024];
	w('manifest.json', {
		schemaVersion: 1,
		categories: [{ key: 'economy', label: 'Economy' }],
		indicators: [
			{ id: 1, slug: 'poverty', label: 'Poverty', category: 'economy', format: 'percent',
			  years, metaPath: '/data/meta/m1.md', hasZ: true, hasLisa: true }
		]
	});
	w('areas/tracts.json', [{ geoid: '37119000100' }, { geoid: '37119000200' }]);
	w('values/1.json', {
		schemaVersion: 1, indicatorId: 1, geoLevel: 'tract', years,
		values: { '37119000100': [10, 12], '37119000200': [20, null] },
		stats: {
			2019: { min: 10, max: 20, p1: 10, p99: 20, breaks: [15] },
			2024: { min: 12, max: 12, p1: 12, p99: 12, breaks: [12] }
		}
	});
	w('analytics/z/1.json', { indicatorId: 1, years, z: { '37119000100': [-1, -1], '37119000200': [1, 1] } });
	w('analytics/lisa/1.json', { indicatorId: 1, years, quadrants: { '37119000100': [1, 0], '37119000200': [3, 0] } });
	w('aggregates.json', { 1: { years, regionAvg: [15, 12], countyAvg: {}, breaks: [], domain: { min: 12, max: 15 } } });
	w('meta/m1.md', '# Poverty');
	w('geo/tracts.geojson', { type: 'FeatureCollection', features: [] });
	return dir;
}

describe('crossCheck (data-contract gate)', () => {
	let dir;
	beforeEach(() => { dir = makeGoodDir(); });
	afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

	it('passes on a well-formed contract', () => {
		const { ok, errors } = crossCheck(dir);
		expect(errors).toEqual([]);
		expect(ok).toBe(true);
	});

	it('fails when value-file years do not match the manifest', () => {
		const p = path.join(dir, 'values/1.json');
		const vf = JSON.parse(fs.readFileSync(p, 'utf8'));
		vf.years = [2018, 2024];
		fs.writeFileSync(p, JSON.stringify(vf));
		const { ok, errors } = crossCheck(dir);
		expect(ok).toBe(false);
		expect(errors.some((e) => /years/.test(e))).toBe(true);
	});

	it('fails on an out-of-range LISA quadrant', () => {
		const p = path.join(dir, 'analytics/lisa/1.json');
		const l = JSON.parse(fs.readFileSync(p, 'utf8'));
		l.quadrants['37119000100'] = [9, 0];
		fs.writeFileSync(p, JSON.stringify(l));
		const { ok, errors } = crossCheck(dir);
		expect(ok).toBe(false);
		expect(errors.some((e) => /quadrant/.test(e))).toBe(true);
	});

	it('fails on missing schemaVersion', () => {
		const p = path.join(dir, 'manifest.json');
		const m = JSON.parse(fs.readFileSync(p, 'utf8'));
		delete m.schemaVersion;
		fs.writeFileSync(p, JSON.stringify(m));
		const { ok, errors } = crossCheck(dir);
		expect(ok).toBe(false);
		expect(errors.some((e) => /schemaVersion/.test(e))).toBe(true);
	});

	it('fails on malformed JSON instead of throwing', () => {
		fs.writeFileSync(path.join(dir, 'values/1.json'), '{ not json');
		const { ok, errors } = crossCheck(dir);
		expect(ok).toBe(false);
		expect(errors.some((e) => /invalid JSON/.test(e))).toBe(true);
	});
});
