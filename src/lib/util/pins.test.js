import { describe, it, expect } from 'vitest';
import { togglePin, isPinned, MAX_PINS } from './pins.js';

const a = (g) => ({ geoid: g, name: g, level: 'tract' });

describe('togglePin', () => {
	it('adds when absent', () => {
		expect(togglePin([], a('1')).map((x) => x.geoid)).toEqual(['1']);
	});
	it('removes when present', () => {
		expect(togglePin([a('1'), a('2')], a('1')).map((x) => x.geoid)).toEqual(['2']);
	});
	it('caps at max', () => {
		let items = [];
		for (let i = 0; i < MAX_PINS + 3; i++) items = togglePin(items, a(String(i)));
		expect(items.length).toBe(MAX_PINS);
	});
	it('isPinned reflects membership', () => {
		expect(isPinned([a('1')], '1')).toBe(true);
		expect(isPinned([a('1')], '2')).toBe(false);
	});
});
