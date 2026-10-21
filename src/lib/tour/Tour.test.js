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
		expect(goto).toHaveBeenCalledWith('/explore/');
		expect(screen.getByText(`2 / ${STEPS.length}`)).toBeTruthy();
		await fireEvent.click(screen.getByRole('button', { name: 'Back' }));
		await flush();
		expect(screen.getByText(`1 / ${STEPS.length}`)).toBeTruthy();
		expect(goto).toHaveBeenLastCalledWith('/');
	});

	it('in the embedded view, every page the tour opens keeps ?topnav=1', async () => {
		render(Tour, { timeout: 20 });
		startTour({ topnav: true });
		await flush();
		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		await flush();
		expect(goto).toHaveBeenLastCalledWith('/explore/?topnav=1');
		tour.index = STEPS.findIndex((s) => s.id === 'report');
		await flush();
		expect(goto).toHaveBeenLastCalledWith(expect.stringMatching(/^\/report\/\?tracts=[\d,]+&geo=tract&topnav=1$/));
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
		await flush();
		vi.mocked(goto).mockClear();
		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		await flush();
		expect(goto).toHaveBeenCalledWith('/explore/?topnav=1');
		expect(screen.getByRole('heading', { name: STEPS.at(-1)?.title })).toBeTruthy();
	});

	it('arrow keys step through the tour', async () => {
		render(Tour, { timeout: 50 });
		startTour();
		await flush();
		await fireEvent.keyDown(window, { key: 'ArrowRight' });
		await flush();
		expect(tour.index).toBe(1);
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
		expect(goto).toHaveBeenLastCalledWith('/explore/');
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
