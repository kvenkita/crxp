/**
 * Choropleth color + MapLibre paint-expression builders. Pure functions.
 */
import {
	interpolateBuPu,
	interpolateYlGn,
	interpolatePuBu,
	interpolateOrRd,
	interpolateYlGnBu,
	interpolateGnBu,
	interpolateGreens,
	interpolateBuGn,
	interpolateYlOrRd,
	interpolatePuBuGn
} from 'd3-scale-chromatic';
import { interpolateLab } from 'd3-interpolate';
import { rgb } from 'd3-color';

/**
 * Sequential single-hue ramp (light → dark) derived from a base theme color,
 * so every indicator in a theme shares its color. @param {string} baseHex @param {number} n
 * @returns {string[]}
 */
export function themeRamp(baseHex, n) {
	const base = rgb(baseHex || '#1f6f63');
	const mix = (a, b, t) => a + (b - a) * t;
	const light = rgb(mix(base.r, 255, 0.86), mix(base.g, 255, 0.86), mix(base.b, 255, 0.86)).formatHex();
	const dark = rgb(mix(base.r, 0, 0.32), mix(base.g, 0, 0.32), mix(base.b, 0, 0.32)).formatHex();
	if (n <= 1) return [base.formatHex()];
	const interp = interpolateLab(light, dark);
	const out = [];
	for (let i = 0; i < n; i++) out.push(rgb(interp(i / (n - 1))).formatHex());
	return out;
}

const SCHEMES = {
	BuPu: interpolateBuPu,
	YlGn: interpolateYlGn,
	PuBu: interpolatePuBu,
	OrRd: interpolateOrRd,
	YlGnBu: interpolateYlGnBu,
	GnBu: interpolateGnBu,
	Greens: interpolateGreens,
	BuGn: interpolateBuGn,
	YlOrRd: interpolateYlOrRd,
	PuBuGn: interpolatePuBuGn
};

export const NO_DATA_COLOR = '#e6e2db';

/**
 * n evenly spaced colors from a named scheme (trimmed away from extremes).
 * @param {string} name @param {number} n
 * @returns {string[]}
 */
export function schemeColors(name, n) {
	const interp = SCHEMES[name] || interpolateYlGnBu;
	if (n <= 1) return [interp(0.6)];
	const lo = 0.12;
	const hi = 0.95;
	const out = [];
	for (let i = 0; i < n; i++) out.push(toHex(interp(lo + (hi - lo) * (i / (n - 1)))));
	return out;
}

function toHex(rgbStr) {
	// d3 returns "rgb(r, g, b)"; convert to #rrggbb for MapLibre + canvas
	const m = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(rgbStr);
	if (!m) return rgbStr;
	const h = (x) => Number(x).toString(16).padStart(2, '0');
	return `#${h(m[1])}${h(m[2])}${h(m[3])}`;
}

/**
 * MapLibre step expression on feature-state "v" (missing coalesced to 0; the
 * caller hides missing features via opacity on feature-state "present").
 * @param {number[]} breaks interior breaks (n-1 of them)
 * @param {string[]} colors n colors
 * @returns {any[]}
 */
export function buildStepExpression(breaks, colors) {
	const expr = ['step', ['coalesce', ['feature-state', 'v'], 0], colors[0]];
	for (let i = 0; i < breaks.length; i++) {
		expr.push(breaks[i], colors[i + 1] ?? colors[colors.length - 1]);
	}
	return expr;
}

/**
 * @param {number} v @param {string} format @param {number} [decimals]
 */
export function formatValue(v, format, decimals = 1) {
	if (v == null || Number.isNaN(v)) return '—';
	switch (format) {
		case 'percent':
			return `${v.toFixed(decimals)}%`;
		case 'dollar':
			return `$${Math.round(v).toLocaleString('en-US')}`;
		case 'years':
			return `${v.toFixed(decimals)} yrs`;
		default:
			return v.toLocaleString('en-US', { maximumFractionDigits: decimals });
	}
}

/**
 * Legend classes from breaks + colors, with formatted range labels.
 * @param {number[]} breaks @param {string[]} colors
 * @param {{format:string, decimals?:number, min?:number, max?:number}} opts
 * @returns {{min:number, max:number, color:string, label:string}[]}
 */
export function legendClasses(breaks, colors, opts) {
	const { format, decimals = 1, min = -Infinity, max = Infinity } = opts;
	const fmt = (v) => formatValue(v, format, decimals);
	const classes = [];
	const lowerBounds = [min, ...breaks];
	const upperBounds = [...breaks, max];
	for (let i = 0; i < colors.length; i++) {
		const lo = lowerBounds[i];
		const hi = upperBounds[i];
		let label;
		if (i === 0) label = `< ${fmt(hi)}`;
		else if (i === colors.length - 1) label = `${fmt(lo)}+`;
		else label = `${fmt(lo)} – ${fmt(hi)}`;
		classes.push({ min: lo, max: hi, color: colors[i], label });
	}
	return classes;
}
