<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { base } from '$app/paths';

	import MapView from '$lib/components/MapView.svelte';
	import Legend from '$lib/components/Legend.svelte';

	import { manifest, loadManifest, indicatorBySlug } from '$lib/state/manifest.svelte.js';
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
	const initialCamera = u.z != null ? { center: [u.lng, u.lat], zoom: u.z } : null;
	const geoLevel = u.geo === 'county' ? 'county' : 'tract';

	let map = $state(null);
	let indicator = $state(null);
	let year = $state(null);
	let valueFile = $state(null);
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

	// the embed's escape hatch: the full explorer with the exact same view state
	let exploreUrl = $derived(
		browser ? `${base}/explore/?${page.url.searchParams.toString()}` : `${base}/explore/`
	);
</script>

<svelte:head>
	<title>{indicator ? `${indicator.label} — ` : ''}Carolinas Regional Explorer</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="embed">
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

<style>
	.embed {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background: var(--c-surface-2);
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
