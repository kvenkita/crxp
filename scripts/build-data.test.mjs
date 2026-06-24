import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crossCheck } from './build-data.mjs';

const DATA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'static', 'data');

describe('crossCheck against the generated fixture', () => {
	it('passes for the committed fixture', () => {
		const r = crossCheck(DATA);
		if (!r.ok) console.error(r.errors);
		expect(r.ok).toBe(true);
	});
});
