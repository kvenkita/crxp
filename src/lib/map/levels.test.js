import { describe, it, expect } from 'vitest';
import { levelsForMode, levelForMode } from './levels.js';

describe('levelsForMode', () => {
	it('allows tracts and counties in explore mode', () => {
		expect(levelsForMode('explore')).toEqual(['tract', 'county']);
	});

	it('allows only tracts for clusters and bivariate maps', () => {
		expect(levelsForMode('lisa')).toEqual(['tract']);
		expect(levelsForMode('bivariate')).toEqual(['tract']);
	});
});

describe('levelForMode', () => {
	it('keeps an allowed level', () => {
		expect(levelForMode('explore', 'county')).toBe('county');
		expect(levelForMode('lisa', 'tract')).toBe('tract');
	});

	it('falls back to tracts when the level is not allowed', () => {
		expect(levelForMode('lisa', 'county')).toBe('tract');
		expect(levelForMode('bivariate', 'county')).toBe('tract');
	});
});
