/**
 * The tour's live demo on the Explore page. snapshot() saves the shared Explore state when the tour
 * starts; restore() puts it back when the tour ends, however it ends. The actions change only that
 * shared state, through the same setters the Explore page uses.
 */
import { explorer, setIndicator, setYear, setGeoLevel } from '$lib/state/explorer.svelte.js';
import { selection, clearTracts, addTract, setLegendFilter, setHover } from '$lib/state/selection.svelte.js';
import { analysis, setMode, setBivariateB } from '$lib/state/analysis.svelte.js';
import { indicatorById } from '$lib/state/manifest.svelte.js';
import { DEMO } from './demo-config.js';

/** @type {null | Record<string, any>} */
let saved = null;

export function snapshot() {
	saved = {
		indicatorId: explorer.indicatorId,
		year: explorer.year,
		geoLevel: explorer.geoLevel,
		selectedIds: [...selection.selectedIds],
		legendFilter: selection.legendFilter,
		legendSticky: selection.legendSticky,
		mode: analysis.mode,
		biB: analysis.biB,
		lisaQuadrants: [...analysis.lisaQuadrants]
	};
}

export function restore() {
	if (!saved) return;
	setIndicator(saved.indicatorId);
	setYear(saved.year);
	setGeoLevel(saved.geoLevel);
	selection.selectedIds = saved.selectedIds;
	setLegendFilter(saved.legendFilter, saved.legendSticky);
	setHover(null);
	setMode(saved.mode);
	setBivariateB(saved.biB);
	analysis.lisaQuadrants = saved.lisaQuadrants;
	saved = null;
}

/** @param {number | null} id */
function latestYear(id) {
	return indicatorById(id)?.years?.at(-1) ?? explorer.year;
}

export const actions = {
	/** poverty rate, latest year, tracts, Explore mode, nothing selected */
	base() {
		setMode('explore');
		setGeoLevel('tract');
		setIndicator(DEMO.indicatorId);
		setYear(latestYear(DEMO.indicatorId));
		clearTracts();
		setLegendFilter(null, false);
		setHover(null);
	},
	/** select the sample tract so its trend chart appears */
	sample() {
		setMode('explore');
		clearTracts();
		addTract(DEMO.tract);
	},
	bivariate() {
		setBivariateB(DEMO.bivariateB);
		setMode('bivariate');
		setYear(latestYear(DEMO.indicatorId));
	},
	clusters() {
		setMode('lisa');
		setYear(latestYear(DEMO.indicatorId));
	},
	/** back to Explore mode, keeping the sample tract selected */
	explore() {
		setMode('explore');
		setYear(latestYear(DEMO.indicatorId));
	}
};

/** @param {string | undefined} name */
export function runAction(name) {
	const fn = name ? actions[/** @type {keyof typeof actions} */ (name)] : undefined;
	if (fn) fn();
}
