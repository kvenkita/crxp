import { describe, it, expect } from 'vitest';
import { placeCard, scrollDelta, CARD_W, GAP, MARGIN, PAD } from './placement.js';

const view = { width: 1280, height: 800 };
const card = { width: CARD_W, height: 220 };
/** @param {number} left @param {number} top @param {number} width @param {number} height */
const box = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height });

describe('placeCard', () => {
	it('centers when there is no target or the step asks for center', () => {
		expect(placeCard(null, card, view, 'right')).toBe(null);
		expect(placeCard(box(10, 10, 100, 40), card, view, 'center')).toBe(null);
	});
	it('puts the card on the preferred side when it fits', () => {
		expect(placeCard(box(20, 100, 300, 40), card, view, 'right')).toEqual({ left: 320 + PAD + GAP, top: 100 });
		expect(placeCard(box(20, 100, 300, 40), card, view, 'bottom')).toEqual({ left: 20, top: 140 + PAD + GAP });
	});
	it('falls back to the opposite side near an edge', () => {
		const r = box(1000, 100, 260, 40); // no room on the right
		expect(placeCard(r, card, view, 'right')).toEqual({ left: 1000 - PAD - GAP - CARD_W, top: 100 });
	});
	it('keeps the card inside the viewport', () => {
		const p = placeCard(box(20, 700, 300, 40), card, view, 'right');
		expect(p?.top).toBe(view.height - card.height - MARGIN);
	});
	it('centers when the target fills the screen', () => {
		expect(placeCard(box(0, 0, 1280, 800), card, view, 'right')).toBe(null);
	});
	it('centers on a viewport too small for the card', () => {
		expect(placeCard(box(10, 10, 50, 20), card, { width: 300, height: 200 }, 'right')).toBe(null);
	});
});

describe('scrollDelta', () => {
	// visible scroll area from y = 68 (below the site header) to y = 700; card 250 px tall
	const area = { top: 68, bottom: 700 };
	const cardH = 250;
	/** @param {{top: number, height: number}} rect @param {string} placement */
	const after = (rect, placement, narrow = false) => rect.top - scrollDelta(rect, cardH, area, placement, narrow);

	it('card below: the target goes near the top of the visible area', () => {
		expect(after(box(0, 900, 600, 120), 'bottom')).toBe(68 + MARGIN + PAD);
	});
	it('card above: the target goes just low enough for the card to fit above it', () => {
		const top = after(box(0, 2000, 600, 900), 'top');
		expect(top).toBe(68 + MARGIN + cardH + GAP + PAD);
		expect(placeCard(box(0, top, 600, 900), { width: CARD_W, height: cardH }, { width: 1280, height: 735 }, 'top')).not.toBe(null);
	});
	it('card below but the target is too tall for it: treated like card above', () => {
		expect(after(box(0, 1200, 600, 500), 'bottom')).toBe(68 + MARGIN + cardH + GAP + PAD);
	});
	it('card beside: a short target is centered, a tall one is top-aligned', () => {
		expect(after(box(0, 1500, 300, 100), 'right')).toBe((68 + 700) / 2 - 50);
		expect(after(box(0, 1500, 300, 800), 'right')).toBe(68 + MARGIN + PAD);
	});
	it('phones: the target goes to the top, above the bottom sheet', () => {
		expect(after(box(0, 1500, 300, 100), 'right', true)).toBe(68 + MARGIN + PAD);
	});
	it('a target already in a good spot does not move', () => {
		const r = box(0, 68 + MARGIN + PAD, 600, 120);
		expect(scrollDelta(r, cardH, area, 'bottom')).toBe(0);
	});
});
