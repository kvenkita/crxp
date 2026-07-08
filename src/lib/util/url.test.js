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

	it('serializes the camera with rounded precision', () => {
		const p = stateToParams({ z: 9.4567, lat: 35.123456789, lng: -80.987654321 });
		expect(p.z).toBe('9.46');
		expect(p.lat).toBe('35.12346');
		expect(p.lng).toBe('-80.98765');
	});

	it('omits a partial camera', () => {
		expect(stateToParams({ z: 9 }).z).toBeUndefined();
		expect(stateToParams({ lat: 35.1, lng: -80.9 }).lat).toBeUndefined();
	});

	it('round-trips the camera through URLSearchParams', () => {
		const params = new URLSearchParams(stateToParams({ i: 'employment', z: 10.5, lat: 35.2271, lng: -80.8431 }));
		const back = paramsToState(params);
		expect(back.z).toBe(10.5);
		expect(back.lat).toBe(35.2271);
		expect(back.lng).toBe(-80.8431);
	});

	it('rejects an out-of-range or non-numeric camera', () => {
		expect(paramsToState(new URLSearchParams('z=9&lat=999&lng=-80.9')).z).toBeUndefined();
		expect(paramsToState(new URLSearchParams('z=abc&lat=35.2&lng=-80.9')).z).toBeUndefined();
		expect(paramsToState(new URLSearchParams('z=9&lat=35.2&lng=181')).lng).toBeUndefined();
	});

	it('ignores the camera when a param is missing', () => {
		const s = paramsToState(new URLSearchParams('z=9&lat=35.2'));
		expect(s.z).toBeUndefined();
		expect(s.lat).toBeUndefined();
	});
});
