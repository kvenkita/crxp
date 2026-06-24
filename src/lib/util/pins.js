/**
 * Pure pin-list operations. An "area" is { geoid, name, level }.
 */
export const MAX_PINS = 6;

/** @param {{geoid:string}[]} items @param {{geoid:string}} area @param {number} max */
export function togglePin(items, area, max = MAX_PINS) {
	const idx = items.findIndex((a) => a.geoid === area.geoid);
	if (idx >= 0) return items.filter((_, i) => i !== idx);
	if (items.length >= max) return items; // cap reached: no-op
	return [...items, area];
}

/** @param {{geoid:string}[]} items @param {string} geoid */
export function isPinned(items, geoid) {
	return items.some((a) => a.geoid === geoid);
}
