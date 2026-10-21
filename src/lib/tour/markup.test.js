import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STEPS } from './steps.js';

const SRC = path.resolve(__dirname, '..', '..');

/** Every .svelte file under src/ outside the tour itself, read once. */
const sources = (() => {
	/** @type {string[]} */
	const out = [];
	/** @param {string} dir */
	const walk = (dir) => {
		for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
			const p = path.join(dir, e.name);
			if (e.isDirectory()) walk(p);
			else if (e.name.endsWith('.svelte') && !p.includes(`${path.sep}tour${path.sep}`)) out.push(fs.readFileSync(p, 'utf8'));
		}
	};
	walk(SRC);
	return out.join('\n');
})();

describe('tour markup in the app', () => {
	it('every target is marked with data-tour', () => {
		for (const s of STEPS.filter((t) => t.target)) {
			const re = new RegExp(`data-tour=(?:"${s.target}"|\\{[^}]*['"]${s.target}['"])`);
			expect(re.test(sources), `data-tour="${s.target}" (step ${s.id})`).toBe(true);
		}
	});
	it('the Explore page signals when it is ready and opens panels on request', () => {
		expect(sources).toMatch(/data-tour-ready=\{booted \? 'true' : undefined\}/);
		expect(sources).toMatch(/addEventListener\('crxp:tour-ui'/);
	});
	it('the map and Home both have the button and the first-visit auto-start', () => {
		expect(sources.match(/data-tour="relaunch"/g)?.length).toBe(2);
		expect(sources).toMatch(/shouldAutoStart\(\{ page: 'explore'/);
		expect(sources).toMatch(/shouldAutoStart\(\{ page: 'home'/);
	});
	it('the tour is mounted in the embedded view too', () => {
		expect(sources).toMatch(/<\/div>\r?\n\r?\n<Tour \/>/);
		expect(sources).not.toMatch(/\{#if !brandless\}\s*<Tour/);
	});
});
