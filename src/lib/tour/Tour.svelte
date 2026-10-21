<script>
	/**
	 * Guided tour overlay (styled after the Metrolina Mobility tour): dims the page, spotlights one
	 * element per step, and moves between pages. Mounted once in the site layout; started with
	 * startTour() from state.svelte.js.
	 */
	import { tick, untrack, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { tour, closeTour, finishTour, goToStep } from './state.svelte.js';
	import { STEPS } from './steps.js';
	import { snapshot, restore, runAction } from './demo.js';
	import { waitFor } from './wait.js';
	import { placeCard, scrollDelta, CARD_W, PAD } from './placement.js';

	let { timeout = 6000, mobileWidth = 820 } = $props();

	/** @type {Element | null} */
	let target = $state(null);
	/** @type {{left:number, top:number, right:number, bottom:number, width:number, height:number} | null} */
	let rect = $state(null);
	let loadingText = $state('');
	/** @type {HTMLElement | null} */
	let cardEl = $state(null);
	let cardH = $state(220);
	let vw = $state(1024);
	let vh = $state(768);
	let reduced = $state(false);

	let narrow = $derived(vw <= mobileWidth);
	let step = $derived(STEPS[tour.index]);
	let isLast = $derived(tour.index === STEPS.length - 1);
	// on a phone, a target in the lower half of the screen (the year slider, the legend) would sit under
	// the bottom sheet, so the sheet moves to the top
	let sheetTop = $derived.by(() => {
		const r = /** @type {{top:number, height:number} | null} */ (rect);
		return narrow && !!r && !loadingText && r.top + r.height / 2 > vh / 2;
	});
	let pos = $derived(
		narrow || !rect || loadingText
			? null
			: placeCard(rect, { width: CARD_W, height: cardH }, { width: vw, height: vh }, step.placement)
	);

	let run = 0;
	let wasActive = false;

	/** @param {string} route */
	const pathOf = (route) => route.split('?')[0];
	const currentPath = () => page.url.pathname.slice(base.length) || '/';
	const EXPLORE_READY = '[data-tour-ready]';

	/**
	 * Link for a step's page. In the embedded view (carolinasexplorer.com/map), every page keeps
	 * ?topnav=1 so the explorer stays brand-less inside the container.
	 * @param {string} route
	 */
	function hrefFor(route) {
		const href = base + route;
		if (!tour.topnav || /[?&]topnav=1(&|$)/.test(href)) return href;
		return href + (href.includes('?') ? '&' : '?') + 'topnav=1';
	}

	// Tour navigation replaces the current history entry (so Back after the tour leaves the page, not
	// the tour's stops; inside carolinasexplorer.com/map the iframe's pushes would land in the tab's
	// history) and keeps focus in the card instead of moving it to the page.
	const NAV = { replaceState: true, keepFocus: true };

	/** @param {import('./steps.js').Step} s */
	const pageName = (s) => (s.route ? s.page : pathOf(tour.origin) === '/' ? 'Home' : 'the map');

	onMount(() => {
		reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
		vw = window.innerWidth;
		vh = window.innerHeight;
	});

	// save the Explore state when the tour starts
	$effect(() => {
		const active = tour.active;
		if (active && !wasActive) untrack(() => snapshot());
		wasActive = active;
	});

	// show the current step whenever it changes
	$effect(() => {
		if (!tour.active) return;
		const i = tour.index;
		untrack(() => show(i));
	});

	/** @param {number} i */
	async function show(i) {
		const id = ++run;
		const s = STEPS[i];
		target = null;
		rect = null;
		const route = s.route ?? tour.origin;
		let navigated = false;
		if (currentPath() !== pathOf(route)) {
			loadingText = `Opening ${pageName(s)}…`;
			await goto(hrefFor(route), NAV);
			if (id !== run) return;
			navigated = true;
		}
		if (s.ui) window.dispatchEvent(new CustomEvent('crxp:tour-ui', { detail: s.ui }));
		// a step on the map waits for it to finish reading its URL (including the start and end cards
		// when the tour was started from the map)
		const ready = s.ready ?? (pathOf(route) === '/explore/' ? EXPLORE_READY : undefined);
		if (ready) {
			loadingText ||= 'Loading…';
			await waitFor(ready, { timeout });
			if (id !== run) return;
		}
		// Arriving on a page (including with Back) replays that page's demo actions up to this step,
		// so the map shows what this step describes.
		const actions = navigated
			? STEPS.slice(0, i + 1)
					.filter((t) => t.action && pathOf(t.route ?? tour.origin) === pathOf(route))
					.map((t) => t.action)
			: [s.action];
		for (const a of actions) runAction(a);
		/** @type {Element | null} */
		let el = null;
		if (s.target && !(narrow && s.mobileCenter)) {
			loadingText ||= 'Loading…';
			el = await waitFor(`[data-tour="${s.target}"]`, { timeout });
			if (id !== run) return;
		}
		loadingText = '';
		target = el;
		if (el) scrollToFit(el, s.placement);
		measure();
		await tick();
		// preventScroll: the card is fixed on screen, and focusing must not move the page under the spotlight
		cardEl?.focus({ preventScroll: true });
	}

	/**
	 * Scroll the target's scroll container so the card fits on the step's preferred side. Instant, not
	 * smooth: a smooth scroll stalls while the tab is in the background and can be cut short by later
	 * scrolling; the spotlight's own transition already eases the move.
	 * @param {Element} el
	 * @param {string} placement
	 */
	function scrollToFit(el, placement) {
		const scroller = scrollParent(el);
		const docScroller = scroller === (document.scrollingElement ?? document.documentElement);
		const box = docScroller ? { top: 0, bottom: window.innerHeight } : scroller.getBoundingClientRect();
		const area = { top: Math.max(0, box.top), bottom: Math.min(window.innerHeight, box.bottom) };
		const delta = scrollDelta(el.getBoundingClientRect(), cardH, area, placement, narrow);
		if (delta) scroller.scrollBy?.({ top: delta, behavior: 'auto' });
	}

	/**
	 * Nearest ancestor that scrolls vertically (the site's main area, or a panel), else the document.
	 * @param {Element} el
	 * @returns {Element}
	 */
	function scrollParent(el) {
		for (let p = el.parentElement; p; p = p.parentElement) {
			const oy = getComputedStyle(p).overflowY;
			if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return p;
		}
		return document.scrollingElement ?? document.documentElement;
	}

	function measure() {
		vw = window.innerWidth;
		vh = window.innerHeight;
		if (cardEl?.offsetHeight) cardH = cardEl.offsetHeight;
		if (!target) {
			rect = null;
			return;
		}
		const r = target.getBoundingClientRect();
		rect = r.width > 0 && r.height > 0
			? { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }
			: null;
	}

	// keep the spotlight on the target while the page scrolls, resizes, or the target changes size
	$effect(() => {
		if (!tour.active) return;
		const el = target;
		const onChange = () => measure();
		window.addEventListener('resize', onChange);
		window.addEventListener('scroll', onChange, true);
		const ro = el && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onChange) : null;
		if (el) ro?.observe(el);
		const timer = setInterval(onChange, 500);
		return () => {
			window.removeEventListener('resize', onChange);
			window.removeEventListener('scroll', onChange, true);
			ro?.disconnect();
			clearInterval(timer);
		};
	});

	// Next and Back wait while a page is loading: moving on mid-load would skip that page's demo
	// actions, and the card would then describe a view the map is not showing. Close always works.
	function next() {
		if (loadingText) return;
		if (isLast) end(true);
		else goToStep(tour.index + 1);
	}
	function back() {
		if (loadingText) return;
		if (tour.index > 0) goToStep(tour.index - 1);
	}

	/** @param {boolean} finished */
	async function end(finished) {
		run++;
		const origin = tour.origin;
		if (finished) finishTour();
		else closeTour();
		target = null;
		rect = null;
		loadingText = '';
		if (currentPath() !== pathOf(origin)) await goto(hrefFor(origin), NAV);
		restore();
		await tick();
		/** @type {HTMLElement | null} */ (document.querySelector('[data-tour="relaunch"]'))?.focus();
	}

	/** @param {KeyboardEvent} e */
	function onKey(e) {
		if (!tour.active) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			end(false);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			next();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			back();
		} else if (e.key === 'Tab' && cardEl) {
			const items = /** @type {HTMLElement[]} */ ([...cardEl.querySelectorAll('button, input')]);
			if (!items.length) return;
			const first = items[0];
			const last = items[items.length - 1];
			if (e.shiftKey && (document.activeElement === first || document.activeElement === cardEl)) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}
</script>

<svelte:window onkeydown={onKey} />

{#if tour.active}
	<div class="tour no-print" class:narrow class:reduced>
		<div class="blocker" aria-hidden="true"></div>
		{#if rect && !loadingText}
			<div
				class="spot"
				style="left:{rect.left - PAD}px; top:{rect.top - PAD}px; width:{rect.width + PAD * 2}px; height:{rect.height + PAD * 2}px"
				aria-hidden="true"
				data-testid="tour-spot"
			></div>
		{:else}
			<div class="dim" aria-hidden="true"></div>
		{/if}

		<div
			class="card"
			class:centered={!pos && !narrow}
			class:sheet-top={sheetTop}
			style={pos ? `left:${pos.left}px; top:${pos.top}px` : ''}
			bind:this={cardEl}
			role="dialog"
			aria-modal="true"
			aria-labelledby="tour-title"
			aria-describedby="tour-body"
			tabindex="-1"
		>
			<div class="card-top">
				<div class="dots" aria-hidden="true">
					{#each STEPS as s, i (s.id)}
						<span class="dot" class:on={i === tour.index}></span>
					{/each}
				</div>
				<button class="close" aria-label="Close tour" onclick={() => end(false)}>✕</button>
			</div>

			<h2 id="tour-title">{step.title}</h2>
			<p id="tour-body" class:waiting={!!loadingText}>{loadingText || step.body}</p>

			<label class="dont">
				<input type="checkbox" bind:checked={tour.dontShow} />
				Don't show again
			</label>

			<div class="card-foot">
				<span class="count">{tour.index + 1} / {STEPS.length}</span>
				<div class="btns">
					{#if tour.index > 0}
						<button class="btn" onclick={back} disabled={!!loadingText}>Back</button>
					{/if}
					<button class="btn btn-primary" onclick={next} disabled={!!loadingText}>{isLast ? 'Get started' : 'Next'}</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.tour {
		position: fixed;
		inset: 0;
		z-index: 1000;
	}
	.blocker {
		position: absolute;
		inset: 0;
	}
	.dim {
		position: absolute;
		inset: 0;
		background: rgba(23, 34, 43, 0.6);
		pointer-events: none;
	}
	.spot {
		position: absolute;
		border-radius: var(--r-md);
		box-shadow:
			0 0 0 2px var(--c-teal),
			0 0 0 9999px rgba(23, 34, 43, 0.6);
		pointer-events: none;
		transition: left 0.25s ease, top 0.25s ease, width 0.25s ease, height 0.25s ease;
	}
	.reduced .spot {
		transition: none;
	}

	.card {
		position: absolute;
		width: 340px;
		max-width: calc(100vw - 24px);
		background: var(--c-surface);
		color: var(--c-text);
		border: 1px solid var(--c-border);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-lg);
		padding: var(--sp-4) var(--sp-5) var(--sp-4);
		outline: none;
	}
	.card.centered {
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
	.narrow .card {
		left: 0;
		right: 0;
		bottom: 0;
		top: auto;
		width: auto;
		max-width: none;
		max-height: 55vh;
		overflow-y: auto;
		border-radius: var(--r-lg) var(--r-lg) 0 0;
		padding-bottom: calc(var(--sp-4) + env(safe-area-inset-bottom, 0px));
	}
	.narrow .card.sheet-top {
		top: 0;
		bottom: auto;
		border-radius: 0 0 var(--r-lg) var(--r-lg);
		padding-top: calc(var(--sp-4) + env(safe-area-inset-top, 0px));
		padding-bottom: var(--sp-4);
	}
	.btns .btn:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--sp-3);
	}
	.dots {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
	}
	.dot {
		width: 6px;
		height: 4px;
		border-radius: var(--r-pill);
		background: var(--c-border-strong);
		transition: width 0.2s ease, background 0.2s ease;
	}
	.dot.on {
		width: 16px;
		background: var(--c-teal);
	}
	.close {
		border: 0;
		background: transparent;
		color: var(--c-text-3);
		font-size: var(--t-base);
		line-height: 1;
		padding: var(--sp-1);
		border-radius: var(--r-sm);
	}
	.close:hover {
		color: var(--c-text);
		background: var(--c-surface-2);
	}

	h2 {
		font-size: var(--t-lg);
		margin: 0 0 var(--sp-2);
		color: var(--c-text);
	}
	p {
		font-size: var(--t-sm);
		line-height: 1.55;
		color: var(--c-text-2);
		margin: 0 0 var(--sp-3);
	}
	p.waiting {
		color: var(--c-text-3);
		font-style: italic;
	}

	.dont {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		font-size: var(--t-xs);
		color: var(--c-text-3);
		margin-bottom: var(--sp-3);
		cursor: pointer;
	}
	.dont input {
		accent-color: var(--c-teal);
	}

	.card-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-2);
	}
	.count {
		font-size: var(--t-xs);
		color: var(--c-text-3);
		font-variant-numeric: tabular-nums;
	}
	.btns {
		display: flex;
		gap: var(--sp-2);
	}
	.btns .btn {
		padding: var(--sp-1) var(--sp-4);
		font-size: var(--t-sm);
	}
</style>
