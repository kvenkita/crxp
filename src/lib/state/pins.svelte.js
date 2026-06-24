import { togglePin as _toggle, isPinned as _isPinned, MAX_PINS } from '../util/pins.js';

export { MAX_PINS };

/** Pinned areas for the compare panel. */
export const pins = $state({
	/** @type {{geoid:string,name:string,level:string}[]} */ items: []
});

export function toggle(area) {
	pins.items = _toggle(pins.items, area, MAX_PINS);
}
export function unpin(geoid) {
	pins.items = pins.items.filter((a) => a.geoid !== geoid);
}
export function pinned(geoid) {
	return _isPinned(pins.items, geoid);
}
export function setPins(items) {
	pins.items = items.slice(0, MAX_PINS);
}
