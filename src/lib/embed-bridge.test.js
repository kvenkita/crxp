import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { stripEmbedParams, resolveTarget, postState, listenHostUrl, hostShareUrl } from './embed-bridge.js';

describe('stripEmbedParams', () => {
	it('drops embed-only flags and keeps the leading ?', () => {
		const p = new URLSearchParams('i=pov&z=11&lat=35.2&lng=-80.8&topnav=1');
		expect(stripEmbedParams(p)).toBe('?i=pov&z=11&lat=35.2&lng=-80.8');
	});

	it('returns empty string when nothing remains', () => {
		expect(stripEmbedParams(new URLSearchParams('topnav=1'))).toBe('');
		expect(stripEmbedParams(new URLSearchParams(''))).toBe('');
	});

	it('does not mutate the input', () => {
		const p = new URLSearchParams('z=11&topnav=1');
		stripEmbedParams(p);
		expect(p.get('topnav')).toBe('1');
	});
});

describe('resolveTarget', () => {
	const realReferrer = Object.getOwnPropertyDescriptor(Document.prototype, 'referrer');

	function setReferrer(value) {
		Object.defineProperty(document, 'referrer', { value, configurable: true });
	}

	afterEach(() => {
		if (realReferrer) Object.defineProperty(Document.prototype, 'referrer', realReferrer);
		delete window.location.ancestorOrigins;
	});

	it('returns the exact origin for the production container', () => {
		setReferrer('https://carolinasregionalexplorer.com/map');
		expect(resolveTarget()).toBe('https://carolinasregionalexplorer.com');
	});

	it('allows netlify deploy previews', () => {
		setReferrer('https://deploy-preview-12--crxp.netlify.app/map');
		expect(resolveTarget()).toBe('https://deploy-preview-12--crxp.netlify.app');
	});

	it('allows the localhost container dev server', () => {
		setReferrer('http://localhost:1111/map');
		expect(resolveTarget()).toBe('http://localhost:1111');
	});

	it('prefers ancestorOrigins over referrer', () => {
		setReferrer('http://evil.example/map');
		window.location.ancestorOrigins = { length: 1, 0: 'https://carolinasregionalexplorer.com' };
		expect(resolveTarget()).toBe('https://carolinasregionalexplorer.com');
	});

	it('falls back to * for a non-allowlisted origin', () => {
		setReferrer('https://evil.example/map');
		expect(resolveTarget()).toBe('*');
	});

	it('falls back to * when the parent cannot be determined', () => {
		setReferrer('');
		expect(resolveTarget()).toBe('*');
	});
});

describe('postState', () => {
	beforeEach(() => {
		Object.defineProperty(document, 'referrer', {
			value: 'https://carolinasregionalexplorer.com/map',
			configurable: true
		});
	});

	it('posts a crxp:state message to the resolved origin', () => {
		const spy = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
		postState('?z=11');
		expect(spy).toHaveBeenCalledWith(
			{ type: 'crxp:state', search: '?z=11' },
			'https://carolinasregionalexplorer.com'
		);
		spy.mockRestore();
	});
});

describe('hostShareUrl', () => {
	it('combines the host origin + path with the stripped query string', () => {
		expect(hostShareUrl('https://carolinasregionalexplorer.com/map', 'i=pov&topnav=1')).toBe(
			'https://carolinasregionalexplorer.com/map?i=pov'
		);
	});

	it('drops the host URL\'s own query and hash', () => {
		expect(hostShareUrl('https://carolinasregionalexplorer.com/map?old=1#frag', '?z=11')).toBe(
			'https://carolinasregionalexplorer.com/map?z=11'
		);
	});

	it('yields a bare host URL when there is no explorer state', () => {
		expect(hostShareUrl('https://carolinasregionalexplorer.com/map', '')).toBe(
			'https://carolinasregionalexplorer.com/map'
		);
	});

	it('falls back to the raw host URL when it cannot be parsed', () => {
		expect(hostShareUrl('not a url', 'i=pov')).toBe('not a url');
	});
});

describe('listenHostUrl', () => {
	function emit(origin, data) {
		window.dispatchEvent(new MessageEvent('message', { origin, data }));
	}

	it('reports host URLs from an allowlisted origin', () => {
		const seen = [];
		const off = listenHostUrl((url) => seen.push(url));
		emit('https://carolinasregionalexplorer.com', {
			type: 'crxp:host',
			url: 'https://carolinasregionalexplorer.com/map'
		});
		expect(seen).toEqual(['https://carolinasregionalexplorer.com/map']);
		off();
	});

	it('ignores messages from a non-allowlisted origin', () => {
		const seen = [];
		const off = listenHostUrl((url) => seen.push(url));
		emit('https://evil.example', { type: 'crxp:host', url: 'https://evil.example/map' });
		expect(seen).toEqual([]);
		off();
	});

	it('ignores unrelated message types', () => {
		const seen = [];
		const off = listenHostUrl((url) => seen.push(url));
		emit('https://carolinasregionalexplorer.com', { type: 'crxp:state', search: '?z=11' });
		expect(seen).toEqual([]);
		off();
	});

	it('stops reporting after unsubscribe', () => {
		const seen = [];
		const off = listenHostUrl((url) => seen.push(url));
		off();
		emit('https://carolinasregionalexplorer.com', {
			type: 'crxp:host',
			url: 'https://carolinasregionalexplorer.com/map'
		});
		expect(seen).toEqual([]);
	});
});
