import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
	tour,
	TOUR_VERSION,
	STORAGE_KEY,
	SESSION_KEY,
	shouldAutoStart,
	startTour,
	closeTour,
	finishTour,
	goToStep,
	readDone
} from './state.svelte.js';
import { STEPS } from './steps.js';

/** @typedef {import('./state.svelte.js').KV} KV */

/**
 * In-memory Storage stand-in.
 * @returns {KV}
 */
function memStorage() {
	/** @type {Map<string, string>} */
	const m = new Map();
	return {
		getItem: (k) => m.get(k) ?? null,
		setItem: (k, v) => void m.set(k, String(v))
	};
}
/** @type {KV} */
const broken = {
	getItem() {
		throw new Error('blocked');
	},
	setItem() {
		throw new Error('blocked');
	}
};

/** @type {KV} */
let local;
/** @type {KV} */
let session;
beforeEach(() => {
	local = memStorage();
	session = memStorage();
	tour.active = false;
	tour.index = 0;
	tour.dontShow = false;
	tour.origin = '/';
	tour.topnav = false;
});

describe('shouldAutoStart', () => {
	it('starts on a first visit', () => {
		expect(shouldAutoStart({ local, session })).toBe(true);
		expect(shouldAutoStart({ page: 'explore', local, session })).toBe(true);
	});
	it('Home: never inside an iframe or with ?topnav=1', () => {
		expect(shouldAutoStart({ page: 'home', framed: true, local, session })).toBe(false);
		expect(shouldAutoStart({ page: 'home', search: '?topnav=1', local, session })).toBe(false);
	});
	it('the map: starts inside the carolinasexplorer.com iframe on the default view', () => {
		expect(shouldAutoStart({ page: 'explore', search: '?topnav=1', framed: true, local, session })).toBe(true);
	});
	it('the map: never on a shared link', () => {
		expect(shouldAutoStart({ page: 'explore', search: '?i=poverty-rate', local, session })).toBe(false);
		expect(shouldAutoStart({ page: 'explore', search: '?topnav=1&i=poverty-rate&y=2024', framed: true, local, session })).toBe(false);
	});
	it('does not start twice in one session', () => {
		startTour({ session });
		expect(session.getItem(SESSION_KEY)).toBe('1');
		expect(shouldAutoStart({ local, session })).toBe(false);
	});
	it('closing without the box re-offers the tour in the next session', () => {
		startTour({ session });
		closeTour(local);
		expect(shouldAutoStart({ local, session: memStorage() })).toBe(true);
	});
	it('closing with "Don\'t show again" stops it for good', () => {
		startTour({ session });
		tour.dontShow = true;
		closeTour(local);
		expect(JSON.parse(local.getItem(STORAGE_KEY) ?? 'null')).toEqual({ v: TOUR_VERSION, done: true });
		expect(shouldAutoStart({ local, session: memStorage() })).toBe(false);
	});
	it('finishing stops it for good, even without the box', () => {
		startTour({ session });
		finishTour(local);
		expect(shouldAutoStart({ local, session: memStorage() })).toBe(false);
	});
	it('a new tour version is offered again', () => {
		local.setItem(STORAGE_KEY, JSON.stringify({ v: TOUR_VERSION - 1, done: true }));
		expect(shouldAutoStart({ local, session })).toBe(true);
	});
	it('a corrupt stored value counts as not done', () => {
		local.setItem(STORAGE_KEY, '{not json');
		expect(readDone(local)).toBe(null);
		expect(shouldAutoStart({ local, session })).toBe(false);
	});
	it('blocked storage skips auto-start and never throws', () => {
		expect(shouldAutoStart({ local: broken, session })).toBe(false);
		expect(shouldAutoStart({ local, session: broken })).toBe(false);
		expect(() => startTour({ session: broken })).not.toThrow();
		expect(() => finishTour(broken)).not.toThrow();
	});
});

describe('storage the browser refuses to open', () => {
	// With site data blocked (and in some cross-site iframes), merely reading window.localStorage throws.
	/** @param {string} name */
	const block = (name) =>
		Object.defineProperty(window, name, {
			configurable: true,
			get() {
				throw new DOMException('blocked', 'SecurityError');
			}
		});
	afterEach(() => {
		delete (/** @type {any} */ (window)).localStorage;
		delete (/** @type {any} */ (window)).sessionStorage;
	});
	it('auto-start is skipped without throwing', () => {
		block('localStorage');
		block('sessionStorage');
		expect(shouldAutoStart({ page: 'explore' })).toBe(false);
		expect(shouldAutoStart({ page: 'home' })).toBe(false);
	});
	it('the tour can still be started, finished and closed', () => {
		block('localStorage');
		block('sessionStorage');
		startTour();
		expect(tour.active).toBe(true);
		finishTour();
		expect(tour.active).toBe(false);
		startTour();
		tour.dontShow = true;
		closeTour();
		expect(tour.active).toBe(false);
	});
});

describe('tracking parameters', () => {
	it('do not count as a shared map view', () => {
		expect(shouldAutoStart({ page: 'explore', search: '?fbclid=abc123', local, session })).toBe(true);
		expect(shouldAutoStart({ page: 'explore', search: '?topnav=1&utm_source=newsletter&utm_medium=email', framed: true, local, session })).toBe(true);
	});
	it('any map state does', () => {
		for (const q of ['?i=poverty-rate', '?z=9&lat=35.2&lng=-80.8', '?mode=lisa', '?sel=37119001100', '?pins=1']) {
			expect(shouldAutoStart({ page: 'explore', search: q, local, session }), q).toBe(false);
		}
	});
});

describe('tour controls', () => {
	it('startTour opens at step 1 with the box clear, whatever is stored', () => {
		finishTour(local);
		tour.index = 5;
		tour.dontShow = true;
		startTour({ origin: '/', session });
		expect(tour).toMatchObject({ active: true, index: 0, dontShow: false, origin: '/', topnav: false });
	});
	it('startTour remembers where it started and whether it is in the embedded view', () => {
		startTour({ origin: '/explore/?topnav=1', topnav: true, session });
		expect(tour).toMatchObject({ origin: '/explore/?topnav=1', topnav: true });
	});
	it('goToStep stays inside the step list', () => {
		goToStep(-3);
		expect(tour.index).toBe(0);
		goToStep(999);
		expect(tour.index).toBe(STEPS.length - 1);
	});
});
