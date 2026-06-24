<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import MapView from '$lib/components/MapView.svelte';
	import GeoLevelToggle from '$lib/components/GeoLevelToggle.svelte';
	import YearSlider from '$lib/components/YearSlider.svelte';
	import { manifest, loadManifest, indicatorById, indicatorBySlug } from '$lib/state/manifest.svelte.js';
	import { explorer, setIndicator, setYear, setGeoLevel } from '$lib/state/explorer.svelte.js';
	import { loadValueFile, valuesForYear, breaksAndColors } from '$lib/data/values.js';
	import { stateToParams, paramsToState } from '$lib/util/url.js';

	let valueFile = $state(null);
	let booted = $state(false);

	let indicator = $derived(indicatorById(explorer.indicatorId));

	onMount(async () => {
		await loadManifest();
		// hydrate from URL if present
		const urlState = paramsToState(page.url.searchParams);
		const fromUrl = urlState.i ? indicatorBySlug(urlState.i) : null;
		const ind = fromUrl ?? manifest.indicators[0];
		setIndicator(ind?.id ?? null);
		setGeoLevel(urlState.geo === 'county' ? 'county' : 'tract');
		setYear(urlState.y && ind?.years.includes(urlState.y) ? urlState.y : ind?.years.at(-1) ?? null);
		booted = true;
	});

	// load value file whenever the indicator changes
	$effect(() => {
		const id = explorer.indicatorId;
		if (id == null) return;
		let cancelled = false;
		loadValueFile(id).then((file) => {
			if (cancelled) return;
			valueFile = file;
			// snap year into available range
			if (!file.years.includes(explorer.year)) setYear(file.years.at(-1));
		});
		return () => (cancelled = true);
	});

	let choropleth = $derived.by(() => {
		if (!valueFile || !indicator || explorer.year == null) return null;
		if (valueFile.indicatorId !== indicator.id) return null;
		const { breaks, colors } = breaksAndColors(valueFile, explorer.year, indicator);
		return { valuesByGeoid: valuesForYear(valueFile, explorer.year), breaks, colors };
	});

	// reflect state to the URL (shareable deep links)
	$effect(() => {
		if (!browser || !booted || !indicator) return;
		const params = stateToParams({
			i: indicator.slug,
			y: explorer.year,
			geo: explorer.geoLevel
		});
		const qs = new URLSearchParams(params).toString();
		replaceState(qs ? `?${qs}` : page.url.pathname, {});
	});

	function pickIndicator(e) {
		setIndicator(Number(e.target.value));
	}
</script>

<svelte:head>
	<title>Explore — Carolinas Regional Explorer</title>
</svelte:head>

<div class="explore">
	<aside class="panel" aria-label="Map controls">
		<div class="panel-section">
			<label class="field-label" for="indicator-select">Indicator</label>
			<select id="indicator-select" value={explorer.indicatorId} onchange={pickIndicator}>
				{#each manifest.categories as cat (cat.key)}
					<optgroup label={cat.label}>
						{#each manifest.indicators.filter((i) => i.category === cat.key) as ind (ind.id)}
							<option value={ind.id}>{ind.label}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
		</div>

		<div class="panel-section">
			<span class="field-label">Geographic level</span>
			<GeoLevelToggle value={explorer.geoLevel} onChange={setGeoLevel} />
		</div>

		{#if indicator}
			<div class="panel-section indicator-meta">
				<h2>{indicator.label}</h2>
				<p class="src">{indicator.source}</p>
			</div>
		{/if}
	</aside>

	<div class="map-wrap">
		<MapView geoLevel={explorer.geoLevel} {choropleth} />
		<div class="bottom-bar no-print">
			{#if indicator}
				<YearSlider years={indicator.years} value={explorer.year} onChange={setYear} />
			{/if}
		</div>
	</div>
</div>

<style>
	.explore {
		flex: 1;
		display: grid;
		grid-template-columns: 20rem 1fr;
		min-height: 0;
	}
	.panel {
		border-right: 1px solid var(--c-border);
		background: var(--c-surface);
		padding: var(--sp-4);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--sp-5);
	}
	.panel-section {
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
	}
	.field-label {
		font-size: var(--t-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--c-text-3);
	}
	select {
		width: 100%;
		padding: var(--sp-2) var(--sp-3);
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		background: var(--c-surface);
		font: inherit;
	}
	.indicator-meta h2 {
		font-size: var(--t-lg);
		margin: 0;
	}
	.indicator-meta .src {
		font-size: var(--t-xs);
		color: var(--c-text-3);
		margin: 0;
	}
	.map-wrap {
		position: relative;
		min-height: 0;
	}
	.bottom-bar {
		position: absolute;
		left: 50%;
		bottom: var(--sp-4);
		transform: translateX(-50%);
		width: min(36rem, calc(100% - 2rem));
		background: color-mix(in srgb, var(--c-surface) 92%, transparent);
		backdrop-filter: blur(8px);
		border: 1px solid var(--c-border);
		border-radius: var(--r-pill);
		box-shadow: var(--shadow-md);
		padding: var(--sp-2) var(--sp-4);
	}
	@media (max-width: 760px) {
		.explore {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}
		.panel {
			border-right: 0;
			border-bottom: 1px solid var(--c-border);
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
		}
	}
</style>
