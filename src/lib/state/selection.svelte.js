/** Transient selection state: hovered/selected geoid + legend class filter. */
export const selection = $state({
	/** @type {string|null} */ hover: null,
	/** @type {string|null} */ selected: null,
	/** @type {{min:number,max:number}|null} */ legendFilter: null,
	/** whether the legend filter is sticky (clicked) vs transient (hover) */
	legendSticky: false
});

export function setHover(geoid) {
	selection.hover = geoid;
}
export function setSelected(geoid) {
	selection.selected = geoid;
}
export function setLegendFilter(range, sticky = false) {
	selection.legendFilter = range;
	selection.legendSticky = sticky;
}
