/**
 * Pure (de)serialization of explorer state to/from URL params.
 * Manifest-agnostic: works in slugs/strings; the page resolves slug<->id.
 *
 * @typedef {Object} UrlState
 * @property {string} [i]    indicator slug
 * @property {number} [y]    year
 * @property {string} [geo]  geo level: 'tract' | 'county'
 * @property {string} [mode] analysis mode: 'explore' | 'bivariate' | 'lisa'
 * @property {string} [biA]  bivariate indicator A slug
 * @property {string} [biB]  bivariate indicator B slug
 * @property {string} [lisa] lisa indicator slug
 * @property {string[]} [q]  active LISA quadrant codes (1..4)
 * @property {string[]} [pins] pinned area geoids
 * @property {string} [sel]  selected geoid
 * @property {number} [z]    map camera zoom
 * @property {number} [lat]  map camera center latitude
 * @property {number} [lng]  map camera center longitude
 */

const DEFAULTS = { geo: 'tract', mode: 'explore' };

// camera precision in the URL: zoom to 2 decimals, coords to 5 (~1 m)
/** @param {number} v @param {number} decimals */
const round = (v, decimals) => String(Number(v.toFixed(decimals)));

/** @param {UrlState} state @returns {Record<string,string>} */
export function stateToParams(state) {
	const p = {};
	if (state.i) p.i = state.i;
	if (state.y != null) p.y = String(state.y);
	if (state.geo && state.geo !== DEFAULTS.geo) p.geo = state.geo;
	if (state.mode && state.mode !== DEFAULTS.mode) p.mode = state.mode;
	if (state.mode === 'bivariate') {
		if (state.biA) p.biA = state.biA;
		if (state.biB) p.biB = state.biB;
	}
	if (state.mode === 'lisa') {
		if (state.lisa) p.lisa = state.lisa;
		if (state.q && state.q.length) p.q = state.q.join('');
	}
	if (state.pins && state.pins.length) p.pins = state.pins.join(',');
	if (state.sel) p.sel = state.sel;
	// camera is all-or-nothing: a partial camera can't be restored
	if (state.z != null && state.lat != null && state.lng != null) {
		p.z = round(state.z, 2);
		p.lat = round(state.lat, 5);
		p.lng = round(state.lng, 5);
	}
	return p;
}

/** @param {URLSearchParams|Record<string,string>} input @returns {UrlState} */
export function paramsToState(input) {
	const get = (k) =>
		input instanceof URLSearchParams ? input.get(k) : (input ? input[k] : null);
	/** @type {UrlState} */
	const s = {};
	if (get('i')) s.i = get('i');
	if (get('y') != null && get('y') !== '') s.y = Number(get('y'));
	s.geo = get('geo') || DEFAULTS.geo;
	s.mode = get('mode') || DEFAULTS.mode;
	if (get('biA')) s.biA = get('biA');
	if (get('biB')) s.biB = get('biB');
	if (get('lisa')) s.lisa = get('lisa');
	if (get('q')) s.q = get('q').split('').filter((c) => '1234'.includes(c));
	if (get('pins')) s.pins = get('pins').split(',').filter(Boolean);
	if (get('sel')) s.sel = get('sel');
	if (get('z') && get('lat') && get('lng')) {
		const z = Number(get('z'));
		const lat = Number(get('lat'));
		const lng = Number(get('lng'));
		// accept only a full, sane camera — out-of-range coords would make MapLibre throw
		if (
			Number.isFinite(z) && z >= 0 && z <= 24 &&
			Number.isFinite(lat) && Math.abs(lat) <= 90 &&
			Number.isFinite(lng) && Math.abs(lng) <= 180
		) {
			s.z = z;
			s.lat = lat;
			s.lng = lng;
		}
	}
	return s;
}
