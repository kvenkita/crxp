import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { fcBbox, bboxRect, padBbox } from '../src/lib/geo/bbox.js';
import { REGION_RECT } from '../netlify/region.mjs';

describe('netlify/region.mjs', () => {
	it('matches the committed county geometry (regenerate with node scripts/gen-region-bbox.mjs)', () => {
		const fc = JSON.parse(fs.readFileSync('static/data/geo/counties.geojson', 'utf8'));
		expect(REGION_RECT).toBe(bboxRect(padBbox(fcBbox(fc), 0.05)));
	});

	it('reproduces the previous hand-entered 14-county rect', () => {
		expect(REGION_RECT).toBe('-81.8181,34.4078,-79.7987,36.1088');
	});
});
