<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { base } from '$app/paths';

	import MapView from '$lib/components/MapView.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import IndicatorBrowser from '$lib/components/IndicatorBrowser.svelte';

	import { manifest, loadManifest, indicatorBySlug, indicatorById } from '$lib/state/manifest.svelte.js';
	import { loadValueFile } from '$lib/data/values.js';
	import { loadAggregates } from '$lib/data/aggregates.js';
	import { buildChoropleth } from '$lib/map/choropleth.js';
	import { legendClasses } from '$lib/map/colorScale.js';
	import { paramsToState } from '$lib/util/url.js';

	// Same query params as /explore (i, y, geo, z/lat/lng), read once at init — an embed is a
	// snapshot, not a session, so nothing is written back to the URL. Analysis modes
	// (bivariate/lisa) are not rendered here; the choropleth of `i` is shown and the
	// "View full map" link carries the full params so the mode opens on /explore.
	const u = browser ? paramsToState(page.url.searchParams) : {};
	const interactive = browser ? page.url.searchParams.get('interactive') !== '0' : true;
	// nav=1 keeps the explore page's indicator side navigation (themes + indicators)
	// inside the embed, so readers can switch indicators without leaving the host page.
	const nav = browser ? page.url.searchParams.get('nav') === '1' : false;
	// topnav=1 shows the site's top navigation as its own bar — without the logo and
	// site name. Links navigate IN the iframe (the whole app becomes usable inside it);
	// the (site) layout hides its brand whenever it runs framed, so the brand stays
	// hidden after navigating away from /embed.
	const topnav = browser ? page.url.searchParams.get('topnav') === '1' : false;
	const initialCamera = u.z != null ? { center: [u.lng, u.lat], zoom: u.z } : null;
	const geoLevel = u.geo === 'county' ? 'county' : 'tract';

	/** @type {any} */
	let map = $state(null);
	/** @type {import('$lib/data/contract.js').Indicator | null} */
	let indicator = $state(null);
	/** @type {number | null} */
	let year = $state(null);
	/** @type {any} */
	let valueFile = $state(null);
	/** @type {any} */
	let aggregates = $state(null);

	onMount(async () => {
		await loadManifest();
		indicator = (u.i && indicatorBySlug(u.i)) || manifest.indicators[0];
		if (!indicator) return;
		year = u.y != null && indicator.years.includes(u.y) ? u.y : indicator.years.at(-1) ?? null;
		if (geoLevel === 'county') aggregates = await loadAggregates();
		else valueFile = await loadValueFile(indicator.id);
	});

	let accent = $derived(
		(indicator && manifest.categories.find((c) => c.key === indicator.category)?.color) || '#1f6f63'
	);
	let choropleth = $derived(buildChoropleth({ indicator, year, geoLevel, aggregates, valueFile, accent }));
	let classes = $derived(
		choropleth && indicator
			? legendClasses(choropleth.breaks, choropleth.colors, {
					format: indicator.format,
					decimals: indicator.decimals ?? 1,
					min: choropleth.stats.min,
					max: choropleth.stats.max
				})
			: []
	);

	$effect(() => {
		if (!map || !choropleth) return;
		map.setGeoLevel(geoLevel);
		map.applyChoropleth(choropleth.valuesByGeoid, choropleth.breaks, choropleth.colors, choropleth.reliabilityByGeoid);
	});

	function onClassHover(range) {
		map?.setLegendFilter(range ?? null, choropleth?.valuesByGeoid ?? {});
	}

	// nav mode: switch the embedded map to another indicator (year snaps like /explore)
	/** @param {number|string} id */
	async function pickIndicator(id) {
		const ind = indicatorById(id);
		if (!ind || ind.id === indicator?.id) return;
		indicator = ind;
		if (year == null || !ind.years.includes(year)) year = ind.years.at(-1) ?? null;
		if (geoLevel !== 'county') {
			valueFile = null; // keep the previous paint until the new file arrives
			valueFile = await loadValueFile(ind.id);
		}
	}

	// the embed's escape hatch: the full explorer with the exact same view state
	// (i/y follow nav switches; the embed-only nav/topnav params are dropped)
	let exploreUrl = $derived.by(() => {
		if (!browser) return `${base}/explore/`;
		const sp = new URLSearchParams(page.url.searchParams);
		sp.delete('nav');
		sp.delete('topnav');
		if (indicator) sp.set('i', indicator.slug);
		if (year != null) sp.set('y', String(year));
		const qs = sp.toString();
		return `${base}/explore/${qs ? `?${qs}` : ''}`;
	});
</script>

<svelte:head>
	<title>{indicator ? `${indicator.label} — ` : ''}Carolinas Regional Explorer</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="embed">
	{#if topnav}
		<!-- the site header's nav bar, minus brand logo + name; navigates in-frame.
		     Links carry ?topnav=1 so the brand-less view survives navigation even when
		     previewed outside an iframe (framed detection covers the iframe case). -->
		<header class="embed-topnav no-print">
			<nav aria-label="Primary">
				<a href="{exploreUrl}{exploreUrl.includes('?') ? '&' : '?'}topnav=1">Explore</a>
				<a href="{base}/indicators/?topnav=1">Indicators</a>
				<a href="{base}/county/37119/?topnav=1">Reports</a>
				<a href="{base}/methods/?topnav=1">Methods</a>
				<a href="{base}/about/?topnav=1">About</a>
			</nav>
		</header>
	{/if}

	<div class="embed-row">
		{#if nav}
			<aside class="embed-panel no-print" aria-label="Indicators">
				<IndicatorBrowser variant="panel" selectedId={indicator?.id ?? null} onSelect={pickIndicator} />
			</aside>
		{/if}

		<div class="map-area">
			<MapView
				center={initialCamera?.center}
				zoom={initialCamera?.zoom}
				{interactive}
				cooperativeGestures={interactive}
				onReady={(c) => (map = c)}
			/>

			<div class="embed-bar">
				<span class="embed-title">
					{indicator?.label ?? 'Carolinas Regional Explorer'}{year != null ? ` · ${year}` : ''}
				</span>
				<a class="embed-link" href={exploreUrl} target="_blank" rel="noopener noreferrer">View full map ↗</a>
			</div>

			{#if classes.length}
				<div class="embed-legend">
					<Legend
						{classes}
						title={indicator?.label}
						{accent}
						{onClassHover}
						onInfo={() => indicator && window.open(`${base}/indicators/${indicator.slug}/`, '_blank', 'noopener')}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.embed {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background: var(--c-surface-2);
		display: flex;
		flex-direction: column;
	}
	.embed-topnav {
		flex: 0 0 auto;
		display: flex;
		justify-content: flex-end;
		background: var(--c-surface);
		border-bottom: 1px solid var(--c-border);
		padding: var(--sp-1) var(--sp-3);
	}
	.embed-topnav nav {
		display: flex;
		align-items: center;
		gap: var(--sp-1);
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}
	.embed-topnav nav::-webkit-scrollbar {
		display: none;
	}
	.embed-topnav a {
		flex-shrink: 0;
		color: var(--c-text-2);
		padding: var(--sp-1) var(--sp-3);
		border-radius: var(--r-pill);
		font-weight: 600;
		font-size: var(--t-sm);
		white-space: nowrap;
	}
	.embed-topnav a:hover {
		background: var(--c-surface-2);
		text-decoration: none;
	}
	.embed-row {
		display: flex;
		flex: 1;
		min-height: 0;
	}
	.embed-panel {
		flex: 0 0 16rem;
		overflow-y: auto;
		background: var(--c-surface);
		border-right: 1px solid var(--c-border);
		padding: var(--sp-3);
	}
	.map-area {
		position: relative;
		flex: 1;
		min-width: 0;
	}
	/* too narrow for a sidebar: degrade to the plain map embed */
	@media (max-width: 520px) {
		.embed-panel {
			display: none;
		}
	}
	.embed-bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-3);
		padding: var(--sp-2) var(--sp-3);
		background: color-mix(in srgb, var(--c-surface) 88%, transparent);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--c-border);
	}
	.embed-title {
		font-weight: 700;
		font-size: var(--t-sm);
		color: var(--c-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.embed-link {
		font-size: var(--t-xs);
		font-weight: 600;
		white-space: nowrap;
		color: var(--c-link);
	}
	.embed-legend {
		position: absolute;
		left: var(--sp-3);
		bottom: var(--sp-3);
		z-index: 10;
		max-width: 15rem;
	}
	/* the legend's filter hint reads odd in a tiny embed at small sizes */
	@media (max-height: 380px) {
		.embed-legend {
			display: none;
		}
	}
</style>
