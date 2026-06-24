import { describe, it, expect } from 'vitest';
import { stateToParams, paramsToState } from './url.js';

describe('url state round-trip', () => {
	it('omits defaults', () => {
		const p = stateToParams({ geo: 'tract', mode: 'explore' });
		expect(p.geo).toBeUndefined();
		expect(p.mode).toBeUndefined();
	});

	it('serializes explore state', () => {
		const p = stateToParams({ i: 'older-adults', y: 2022, geo: 'county', pins: ['37119000100', '37119000200'], sel: '37119000100' });
		expect(p).toEqual({ i: 'older-adults', y: '2022', geo: 'county', pins: '37119000100,37119000200', sel: '37119000100' });
	});

	it('serializes lisa mode with quadrants', () => {
		const p = stateToParams({ mode: 'lisa', lisa: 'employment', q: ['1', '3'] });
		expect(p.mode).toBe('lisa');
		expect(p.lisa).toBe('employment');
		expect(p.q).toBe('13');
	});

	it('round-trips through URLSearchParams', () => {
		const start = { i: 'employment', y: 2021, geo: 'county', mode: 'lisa', lisa: 'employment', q: ['1', '2', '3'], pins: ['37119000100'] };
		const params = new URLSearchParams(stateToParams(start));
		const back = paramsToState(params);
		expect(back.i).toBe('employment');
		expect(back.y).toBe(2021);
		expect(back.geo).toBe('county');
		expect(back.mode).toBe('lisa');
		expect(back.q).toEqual(['1', '2', '3']);
		expect(back.pins).toEqual(['37119000100']);
	});

	it('defaults geo/mode when absent', () => {
		const s = paramsToState(new URLSearchParams(''));
		expect(s.geo).toBe('tract');
		expect(s.mode).toBe('explore');
	});
});
