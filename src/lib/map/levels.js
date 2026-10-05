// Geographic levels each analysis mode supports. Cluster (LISA) results and bivariate classes are
// computed per tract, so those modes have no county view.
const TRACT_ONLY = new Set(['lisa', 'bivariate']);

/** @param {string} mode @returns {('tract'|'county')[]} */
export function levelsForMode(mode) {
	return TRACT_ONLY.has(mode) ? ['tract'] : ['tract', 'county'];
}

/** The level to show for `mode`: the current one if allowed, otherwise tracts. */
export function levelForMode(mode, current) {
	return levelsForMode(mode).includes(current) ? current : 'tract';
}
