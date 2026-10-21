/**
 * Guided-tour state: which step is showing, and the browser-storage rules that decide whether the
 * tour starts on its own. Navigation and the live map demo live in Tour.svelte and demo.js; this
 * module only holds state, so it can be tested without a page.
 */
import { STEPS } from './steps.js';

/** Bump when the tour changes enough that people who finished it should see it again. */
export const TOUR_VERSION = 1;
export const STORAGE_KEY = 'crxp_tour';
export const SESSION_KEY = 'crxp_tour_session';

/** Query keys that carry map state (src/lib/util/url.js); any of them means a shared link. */
export const MAP_STATE_KEYS = ['i', 'y', 'geo', 'mode', 'biA', 'biB', 'lisa', 'q', 'z', 'lat', 'lng', 'pins', 'sel'];

/** The part of the Web Storage API the tour uses (localStorage, sessionStorage, or a test double). */
/** @typedef {{ getItem(key: string): string | null, setItem(key: string, value: string): void }} KV */

export const tour = $state({
	active: false,
	index: 0,
	/** the "Don't show again" checkbox */
	dontShow: false,
	/** page (path and query, without the base path) the tour returns to when it ends */
	origin: '/',
	/** started in the brand-less embedded view (?topnav=1), which every page it opens keeps */
	topnav: false
});

/**
 * @param {KV} [local]
 * @returns {boolean|null} true = finished or dismissed for good; null = storage unavailable
 */
export function readDone(local) {
	// the global is read inside the try: with site data blocked, reading window.localStorage itself throws
	try {
		const v = JSON.parse((local ?? globalThis.localStorage).getItem(STORAGE_KEY) ?? 'null');
		return !!(v && v.done === true && v.v === TOUR_VERSION);
	} catch {
		return null;
	}
}

/** @param {KV} [local] */
export function writeDone(local) {
	try {
		(local ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify({ v: TOUR_VERSION, done: true }));
	} catch {
		// storage blocked: nothing to remember, and auto-start is already off without storage
	}
}

/**
 * @param {KV} [session]
 * @returns {boolean|null} null = storage unavailable
 */
export function seenThisSession(session) {
	try {
		return (session ?? globalThis.sessionStorage).getItem(SESSION_KEY) === '1';
	} catch {
		return null;
	}
}

/** @param {KV} [session] */
export function markSession(session) {
	try {
		(session ?? globalThis.sessionStorage).setItem(SESSION_KEY, '1');
	} catch {
		// storage blocked
	}
}

/**
 * Whether a page should start the tour by itself.
 * - 'home' (direct visitors to the site): never inside an iframe or the brand-less ?topnav=1 view.
 * - 'explore' (the map, which carolinasexplorer.com/map embeds with ?topnav=1): only on the default
 *   view (no MAP_STATE_KEYS in the query), so a visitor arriving on a shared link is not interrupted.
 * Either way: never twice in one session, never after the tour was finished or dismissed for good,
 * and never when storage is unavailable (it could not remember the answer).
 * @param {{ page?: 'home' | 'explore', search?: string, framed?: boolean, local?: KV, session?: KV }} [opts]
 */
export function shouldAutoStart({ page = 'home', search = '', framed = false, local, session } = {}) {
	const params = new URLSearchParams(search);
	if (page === 'home') {
		if (framed || params.get('topnav') === '1') return false;
	} else if (MAP_STATE_KEYS.some((k) => params.has(k))) {
		return false; // a shared link to a particular view; tracking parameters (utm_*, fbclid) don't count
	}
	const done = readDone(local);
	const seen = seenThisSession(session);
	if (done === null || seen === null) return false;
	return !done && !seen;
}

/** @param {{ origin?: string, topnav?: boolean, session?: KV }} [opts] */
export function startTour({ origin = '/', topnav = false, session } = {}) {
	tour.index = 0;
	tour.dontShow = false;
	tour.origin = origin;
	tour.topnav = topnav;
	tour.active = true;
	markSession(session);
}

/**
 * Close from any step: remembered only when "Don't show again" is ticked.
 * @param {KV} [local]
 */
export function closeTour(local) {
	tour.active = false;
	if (tour.dontShow) writeDone(local);
}

/**
 * Finishing the last step always stops auto-start.
 * @param {KV} [local]
 */
export function finishTour(local) {
	tour.active = false;
	writeDone(local);
}

/** @param {number} i */
export function goToStep(i) {
	tour.index = Math.max(0, Math.min(STEPS.length - 1, i));
}
