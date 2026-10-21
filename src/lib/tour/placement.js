export const CARD_W = 340;
export const GAP = 14; // between the spotlight and the card
export const MARGIN = 12; // between the card and the viewport edge
export const PAD = 6; // spotlight padding around the target

/** @type {Record<string, string[]>} */
const ORDER = {
	right: ['right', 'left', 'bottom', 'top'],
	left: ['left', 'right', 'bottom', 'top'],
	bottom: ['bottom', 'top', 'right', 'left'],
	top: ['top', 'bottom', 'right', 'left']
};

/** @param {number} v @param {number} lo @param {number} hi */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * Where to put the card next to a spotlighted element.
 * @param {{left:number, top:number, right:number, bottom:number, width:number, height:number} | null} rect
 * @param {{width:number, height:number}} card
 * @param {{width:number, height:number}} view
 * @param {string} preferred 'right' | 'left' | 'bottom' | 'top' | 'center'
 * @returns {{left:number, top:number} | null} null = center the card on screen
 */
export function placeCard(rect, card, view, preferred) {
	if (!rect || preferred === 'center' || !ORDER[preferred]) return null;
	const maxLeft = view.width - card.width - MARGIN;
	const maxTop = view.height - card.height - MARGIN;
	if (maxLeft < MARGIN || maxTop < MARGIN) return null;
	for (const side of ORDER[preferred]) {
		if (side === 'right') {
			const left = rect.right + PAD + GAP;
			if (left <= maxLeft) return { left, top: clamp(rect.top, MARGIN, maxTop) };
		} else if (side === 'left') {
			const left = rect.left - PAD - GAP - card.width;
			if (left >= MARGIN) return { left, top: clamp(rect.top, MARGIN, maxTop) };
		} else if (side === 'bottom') {
			const top = rect.bottom + PAD + GAP;
			if (top <= maxTop) return { left: clamp(rect.left, MARGIN, maxLeft), top };
		} else {
			const top = rect.top - PAD - GAP - card.height;
			if (top >= MARGIN) return { left: clamp(rect.left, MARGIN, maxLeft), top };
		}
	}
	return null;
}

/**
 * How far to scroll (positive = down) so the card fits on the target's preferred side.
 * @param {{top:number, height:number}} rect target, in viewport coordinates
 * @param {number} cardH card height
 * @param {{top:number, bottom:number}} area visible part of the scroll container, in viewport coordinates
 * @param {string} placement the step's preferred side for the card
 * @param {boolean} [narrow] phones: the card is a bottom sheet, so the target goes to the top
 * @returns {number}
 */
export function scrollDelta(rect, cardH, area, placement, narrow = false) {
	const startTop = area.top + MARGIN + PAD; // target at the top of the visible area
	const belowCard = area.top + MARGIN + cardH + GAP + PAD; // target just below room for the card
	const avail = area.bottom - area.top;
	let want;
	if (narrow) want = startTop;
	else if (placement === 'top') want = belowCard;
	else if (placement === 'bottom') want = rect.height + cardH + GAP + 2 * (PAD + MARGIN) <= avail ? startTop : belowCard;
	else want = rect.height + 2 * PAD <= avail ? (area.top + area.bottom) / 2 - rect.height / 2 : startTop;
	return Math.round(rect.top - want);
}
