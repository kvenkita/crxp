import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';

// The tour navigates with goto(); here navigation only updates the mocked page URL.
const nav = vi.hoisted(() => ({ url: new URL('http://localhost/') }));
vi.mock('$app/navigation', () => ({
	goto: vi.fn(async (href) => {
		nav.url = new URL(href, 'http://localhost');
	})
}));
vi.mock('$app/state', () => ({
	page: {
		get url() {
			return nav.url;
		}
	}
}));
vi.mock('$app/paths', () => ({ base: '' }));

import Tour from './Tour.svelte';
import { goto } from '$app/navigation';
import { tour, startTour, STORAGE_KEY } from './state.svelte.js';
import { STEPS } from './steps.js';

// tour navigation replaces the current history entry and keeps focus in the card
const NAV = { replaceState: true, keepFocus: true };

/** Let a step finish loading (its waits time out quickly in these tests). @param {number} ms */
const settle = async (ms) => {
	await new Promise((r) => setTimeout(r, ms));
	await flush();
};

const flush = async () => {
	for (let k = 0; k < 5; k++) {
		await tick();
		await Promise.resolve();
	}
};

beforeEach(() => {
	nav.url = new URL('http://localhost/');
	localStorage.clear();
	sessionStorage.clear();
	vi.mocked(goto).mockClear();
	document.body.innerHTML = '';
});
afterEach(() => {
	cleanup();
	tour.active = false;
	vi.useRealTimers();
});

describe('Tour', () => {
	it('renders nothing until started', () => {
		render(Tour);
		expect(screen.queryByRole('dialog')).toBe(null);
	});

	it('shows the welcome card as a labelled dialog', async () => {
		render(Tour, { timeout: 50 });
		startTour();
		await flush();
		const dialog = screen.getByRole('dialog');
		expect(dialog.getAttribute('aria-modal')).toBe('true');
		expect(screen.getByRole('heading', { name: STEPS[0].title })).toBeTruthy();
		expect(screen.getByText(`1 / ${STEPS.length}`)).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Back' })).toBe(null);
	});

	it('Next moves to the Explore page; Back returns', async () => {
		render(Tour, { timeout: 50 });
		startTour();
		await flush();
		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		await flush();
		expect(goto).toHaveBeenCalledWith('/explore/', NAV);
		expect(screen.getByText(`2 / ${STEPS.length}`)).toBeTruthy();
		await settle(150); // the ready wait and the target wait (50 ms each)
		await fireEvent.click(screen.getByRole('button', { name: 'Back' }));
		await flush();
		expect(screen.getByText(`1 / ${STEPS.length}`)).toBeTruthy();
		expect(goto).toHaveBeenLastCalledWith('/', NAV);
	});

	it('in the embedded view, every page the tour opens keeps ?topnav=1', async () => {
		render(Tour, { timeout: 20 });
		startTour({ topnav: true });
		await flush();
		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		await flush();
		expect(goto).toHaveBeenLastCalledWith('/explore/?topnav=1', NAV);
		tour.index = STEPS.findIndex((s) => s.id === 'report');
		await flush();
		expect(goto).toHaveBeenLastCalledWith(expect.stringMatching(/^\/report\/\?tracts=[\d,]+&geo=tract&topnav=1$/), NAV);
	});

	it('started from the map, the tour begins there and returns to the same URL at the end', async () => {
		const ready = document.createElement('div');
		ready.setAttribute('data-tour-ready', 'true');
		document.body.append(ready);
		nav.url = new URL('http://localhost/explore/?topnav=1');
		render(Tour, { timeout: 20 });
		startTour({ origin: '/explore/?topnav=1', topnav: true });
		await flush();
		expect(goto).not.toHaveBeenCalled(); // the welcome card shows on the map itself
		tour.index = STEPS.findIndex((s) => s.id === 'data');
		await settle(60);
		vi.mocked(goto).mockClear();
		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		await flush();
		expect(goto).toHaveBeenCalledWith('/explore/?topnav=1', NAV);
		expect(screen.getByRole('heading', { name: STEPS.at(-1)?.title })).toBeTruthy();
	});

	it('the tour adds no history entries, so Back leaves the page as it would without the tour', async () => {
		render(Tour, { timeout: 20 });
		startTour();
		await flush();
		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		await flush();
		await fireEvent.click(screen.getByRole('button', { name: 'Close tour' }));
		await flush();
		expect(vi.mocked(goto).mock.calls.length).toBeGreaterThan(1);
		for (const [, opts] of vi.mocked(goto).mock.calls) expect(opts).toEqual(NAV);
	});

	it('Next, Back and the arrow keys wait while a page is loading, so its demo is never skipped', async () => {
		nav.url = new URL('http://localhost/');
		render(Tour, { timeout: 400 });
		startTour();
		await flush();
		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		await flush(); // on /explore/ now, waiting for the page to be ready
		expect(screen.getByText('Opening Explore…')).toBeTruthy();
		expect(/** @type {HTMLButtonElement} */ (screen.getByRole('button', { name: 'Next' })).disabled).toBe(true);
		await fireEvent.keyDown(window, { key: 'ArrowRight' });
		await fireEvent.keyDown(window, { key: 'ArrowLeft' });
		await flush();
		expect(tour.index).toBe(1);
	});

	it('on a phone, the sheet moves to the top when the target is in the lower half of the screen', async () => {
		const realRect = Element.prototype.getBoundingClientRect;
		let targetTop = 700;
		Element.prototype.getBoundingClientRect = function () {
			return this.hasAttribute?.('data-tour') || this.hasAttribute?.('data-tour-ready')
				? { left: 20, top: targetTop, right: 370, bottom: targetTop + 40, width: 350, height: 40, x: 20, y: targetTop, toJSON() {} }
				: realRect.call(this);
		};
		const real = { w: window.innerWidth, h: window.innerHeight };
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
		try {
			const i = STEPS.findIndex((s) => s.id === 'year-slider');
			const target = document.createElement('div');
			target.setAttribute('data-tour', STEPS[i].target ?? '');
			const ready = document.createElement('div');
			ready.setAttribute('data-tour-ready', 'true');
			document.body.append(target, ready);
			nav.url = new URL('http://localhost/explore/');

			render(Tour, { timeout: 30 });
			startTour();
			tour.index = i;
			await flush();
			await new Promise((r) => setTimeout(r, 60));
			await flush();
			expect(screen.getByTestId('tour-spot')).toBeTruthy();
			expect(screen.getByRole('dialog').classList.contains('sheet-top')).toBe(true);

			targetTop = 120; // a target near the top keeps the sheet at the bottom
			await new Promise((r) => setTimeout(r, 600)); // the 500 ms re-measure
			await flush();
			expect(screen.getByRole('dialog').classList.contains('sheet-top')).toBe(false);
		} finally {
			Element.prototype.getBoundingClientRect = realRect;
			Object.defineProperty(window, 'innerWidth', { configurable: true, value: real.w });
			Object.defineProperty(window, 'innerHeight', { configurable: true, value: real.h });
		}
	});

	it('arrow keys step through the tour', async () => {
		render(Tour, { timeout: 50 });
		startTour();
		await flush();
		await fireEvent.keyDown(window, { key: 'ArrowRight' });
		await flush();
		expect(tour.index).toBe(1);
		await settle(150); // the ready wait and the target wait (50 ms each)
		await fireEvent.keyDown(window, { key: 'ArrowLeft' });
		await flush();
		expect(tour.index).toBe(0);
	});

	it('Esc closes without remembering, unless "Don\'t show again" is ticked', async () => {
		render(Tour, { timeout: 50 });
		startTour();
		await flush();
		await fireEvent.keyDown(window, { key: 'Escape' });
		await flush();
		expect(screen.queryByRole('dialog')).toBe(null);
		expect(localStorage.getItem(STORAGE_KEY)).toBe(null);

		startTour();
		await flush();
		await fireEvent.click(screen.getByRole('checkbox', { name: /don't show again/i }));
		await fireEvent.click(screen.getByRole('button', { name: 'Close tour' }));
		await flush();
		expect(screen.queryByRole('dialog')).toBe(null);
		expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toMatchObject({ done: true });
	});

	it('closing mid-tour returns to the page the tour started from', async () => {
		render(Tour, { timeout: 50 });
		startTour({ origin: '/' });
		await flush();
		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		await flush();
		expect(nav.url.pathname).toBe('/explore/');
		await fireEvent.click(screen.getByRole('button', { name: 'Close tour' }));
		await flush();
		expect(nav.url.pathname).toBe('/');
	});

	it('the last card says "Get started" and finishing remembers it', async () => {
		render(Tour, { timeout: 20 });
		startTour();
		tour.index = STEPS.length - 1;
		await flush();
		await fireEvent.click(screen.getByRole('button', { name: 'Get started' }));
		await flush();
		expect(screen.queryByRole('dialog')).toBe(null);
		expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toMatchObject({ done: true });
	});

	it('spotlights a visible target and falls back to a centered card when it never appears', async () => {
		const realRect = Element.prototype.getBoundingClientRect;
		Element.prototype.getBoundingClientRect = function () {
			return this.hasAttribute?.('data-tour') || this.hasAttribute?.('data-tour-ready')
				? { left: 20, top: 120, right: 320, bottom: 160, width: 300, height: 40, x: 20, y: 120, toJSON() {} }
				: realRect.call(this);
		};
		try {
			const target = document.createElement('div');
			target.setAttribute('data-tour', STEPS[2].target ?? '');
			const ready = document.createElement('div');
			ready.setAttribute('data-tour-ready', 'true');
			document.body.append(target, ready);
			nav.url = new URL('http://localhost/explore/');

			render(Tour, { timeout: 50 });
			startTour();
			tour.index = 2;
			await flush();
			await new Promise((r) => setTimeout(r, 30));
			await flush();
			expect(screen.getByTestId('tour-spot')).toBeTruthy();

			tour.index = 3; // year-slider: not in the page
			await flush();
			await new Promise((r) => setTimeout(r, 120));
			await flush();
			expect(screen.queryByTestId('tour-spot')).toBe(null);
			expect(screen.getByRole('heading', { name: STEPS[3].title })).toBeTruthy();
			expect(screen.getByText(STEPS[3].body)).toBeTruthy();
		} finally {
			Element.prototype.getBoundingClientRect = realRect;
		}
	});

	it('after the browser leaves the page mid-tour, Next goes to the right page', async () => {
		render(Tour, { timeout: 30 });
		startTour();
		await flush();
		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		await flush();
		nav.url = new URL('http://localhost/data/'); // browser Back/Forward, outside the tour
		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		await flush();
		expect(goto).toHaveBeenLastCalledWith('/explore/', NAV);
	});

	it('on a phone, centered-on-mobile steps show no spotlight even when the target exists', async () => {
		const realRect = Element.prototype.getBoundingClientRect;
		Element.prototype.getBoundingClientRect = function () {
			return this.hasAttribute?.('data-tour') || this.hasAttribute?.('data-tour-ready')
				? { left: 20, top: 120, right: 320, bottom: 160, width: 300, height: 40, x: 20, y: 120, toJSON() {} }
				: realRect.call(this);
		};
		const realWidth = window.innerWidth;
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
		try {
			const i = STEPS.findIndex((s) => s.mobileCenter);
			const target = document.createElement('div');
			target.setAttribute('data-tour', STEPS[i].target ?? '');
			const ready = document.createElement('div');
			ready.setAttribute('data-tour-ready', 'true');
			document.body.append(target, ready);
			nav.url = new URL('http://localhost/explore/');

			render(Tour, { timeout: 30 });
			startTour();
			tour.index = i;
			await flush();
			await new Promise((r) => setTimeout(r, 60));
			await flush();
			expect(screen.getByRole('heading', { name: STEPS[i].title })).toBeTruthy();
			expect(screen.queryByTestId('tour-spot')).toBe(null);
			expect(document.querySelector('.tour.narrow')).toBeTruthy();
		} finally {
			Element.prototype.getBoundingClientRect = realRect;
			Object.defineProperty(window, 'innerWidth', { configurable: true, value: realWidth });
		}
	});

	it('scrolls the target instantly to where its card fits (smooth scrolling stalls in background tabs)', async () => {
		const realRect = Element.prototype.getBoundingClientRect;
		Element.prototype.getBoundingClientRect = function () {
			return this.hasAttribute?.('data-tour') || this.hasAttribute?.('data-tour-ready')
				? { left: 20, top: 120, right: 320, bottom: 160, width: 300, height: 40, x: 20, y: 120, toJSON() {} }
				: realRect.call(this);
		};
		const scroll = vi.fn();
		/** @type {any} */ (Element.prototype).scrollBy = scroll;
		try {
			const target = document.createElement('div');
			target.setAttribute('data-tour', STEPS[2].target ?? '');
			const ready = document.createElement('div');
			ready.setAttribute('data-tour-ready', 'true');
			document.body.append(target, ready);
			nav.url = new URL('http://localhost/explore/');

			render(Tour, { timeout: 30 });
			startTour();
			tour.index = 2;
			await flush();
			await new Promise((r) => setTimeout(r, 30));
			await flush();
			// step 3's card goes beside its 40 px target, so the target is centered in the 768 px window
			expect(scroll).toHaveBeenCalledWith({ top: Math.round(120 - (768 / 2 - 20)), behavior: 'auto' });
		} finally {
			Element.prototype.getBoundingClientRect = realRect;
			delete (/** @type {any} */ (Element.prototype).scrollBy);
		}
	});

	it('moves focus to the card without scrolling the page', async () => {
		const spy = vi.spyOn(HTMLElement.prototype, 'focus');
		try {
			render(Tour, { timeout: 30 });
			startTour();
			await flush();
			const call = spy.mock.calls.at(-1);
			expect(call?.[0]).toEqual({ preventScroll: true });
			expect(document.activeElement).toBe(screen.getByRole('dialog'));
		} finally {
			spy.mockRestore();
		}
	});
});
