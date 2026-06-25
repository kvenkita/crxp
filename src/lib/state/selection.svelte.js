/**
 * Selection state: hovered geoid, a SET of selected geoids (QoL-style
 * multi-select), and the legend class filter.
 */
export const selection = $state({
	/** @type {string|null} */ hover: null,
	/** @type {string[]} */ selectedIds: [],
	/** @type {{min:number,max:number}|null} */ legendFilter: null,
	legendSticky: false
});

export function setHover(geoid) {
	selection.hover = geoid;
}

/** Toggle a geoid in/out of the selection set. */
export function toggleTract(geoid) {
	if (!geoid) return;
	selection.selectedIds = selection.selectedIds.includes(geoid)
		? selection.selectedIds.filter((g) => g !== geoid)
		: [...selection.selectedIds, geoid];
}

export function addTract(geoid) {
	if (geoid && !selection.selectedIds.includes(geoid)) selection.selectedIds = [...selection.selectedIds, geoid];
}

export function clearTracts() {
	selection.selectedIds = [];
}

export function setLegendFilter(range, sticky = false) {
	selection.legendFilter = range;
	selection.legendSticky = sticky;
}
