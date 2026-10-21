import { describe, it, expect } from 'vitest';
import { STEPS } from './steps.js';

describe('tour steps', () => {
	it('has unique ids and complete text', () => {
		expect(new Set(STEPS.map((s) => s.id)).size).toBe(STEPS.length);
		for (const s of STEPS) {
			expect(s.title, s.id).toBeTruthy();
			expect(s.body, s.id).toBeTruthy();
			expect(s.page, s.id).toBeTruthy();
		}
	});
	it('the first and last cards are centered on the page the tour started from (Home or the map)', () => {
		expect(STEPS[0]).toMatchObject({ route: null, placement: 'center' });
		expect(STEPS.at(-1)).toMatchObject({ route: null, placement: 'center' });
		expect(STEPS.slice(1, -1).every((s) => typeof s.route === 'string')).toBe(true);
		expect(STEPS[1].route).toBe('/explore/');
	});
	it('the last card points to the button on the map', () => {
		expect(STEPS.at(-1)?.body).toMatch(/"Take a tour" button on the map/);
	});
	it('routes are site paths with a trailing slash', () => {
		for (const s of STEPS.filter((t) => t.route)) expect(s.route, s.id).toMatch(/^\/([^?]*\/)?(\?.*)?$/);
	});
	it('every Explore step waits for the page to be ready', () => {
		for (const s of STEPS.filter((t) => t.route === '/explore/')) expect(s.ready, s.id).toBe('[data-tour-ready]');
	});
});
