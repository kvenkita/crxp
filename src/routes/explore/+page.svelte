<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import MapView from '$lib/components/MapView.svelte';
	import GeoLevelToggle from '$lib/components/GeoLevelToggle.svelte';
	import YearSlider from '$lib/components/YearSlider.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import PercentileStrip from '$lib/components/PercentileStrip.svelte';
	import IndicatorBrowser from '$lib/components/IndicatorBrowser.svelte';
	import MetricInfoPanel from '$lib/components/MetricInfoPanel.svelte';
	import TrendChart from '$lib/components/TrendChart.svelte';
	import { loadMeta } from '$lib/data/meta.js';
	import { loadAreas, areaName } from '$lib/data/areas.js';
	import { seriesFor } from '$lib/data/series.js';
	import { manifest, loadManifest, indicatorById, indicatorBySlug } from '$lib/state/manifest.svelte.js';
	import { explorer, setIndicator, setYear, setGeoLevel } from '$lib/state/explorer.svelte.js';
	import { selection, setSelected, setLegendFilter } from '$lib/state/selection.svelte.js';
	import { loadValueFile, valuesForYear, breaksAndColors } from '$lib/data/values.js';
	import { loadAggregates, regionAvgAt } from '$lib/data/aggregates.js';
	import { legendClasses } from '$lib/map/colorScale.js';
	import { stateToParams, paramsToState } from '$lib/util/url.js';

	let valueFile = $state(null);
	let aggregates = $state(null);
	let areas = $state(null);
	let metaText = $state('');
	let showAbout = $state(false);
	let booted = $state(false);

	let indicator = $derived(indicatorById(explorer.indicatorId));

	onMount(async () => {
		await loadManifest();
		loadAggregates().then((a) => (aggregates = a));
		loadAreas().then((a) => (areas = a));
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

	// load metadata markdown when the indicator changes
	$effect(() => {
		const ind = indicator;
		if (!ind) return;
		metaText = '';
		let cancelled = false;
		loadMeta(ind.metaPath).then((t) => !cancelled && (metaText = t));
		return () => (cancelled = true);
	});

	let choropleth = $derived.by(() => {
		if (!valueFile || !indicator || explorer.year == null) return null;
		if (valueFile.indicatorId !== indicator.id) return null;
		const { breaks, colors, stats } = breaksAndColors(valueFile, explorer.year, indicator);
		return { valuesByGeoid: valuesForYear(valueFile, explorer.year), breaks, colors, stats };
	});

	let classes = $derived(
		choropleth
			? legendClasses(choropleth.breaks, choropleth.colors, {
					format: indicator.format,
					decimals: indicator.decimals ?? 1,
					min: choropleth.stats.min,
					max: choropleth.stats.max
				})
			: []
	);

	let selectedValue = $derived(
		choropleth && selection.selected ? choropleth.valuesByGeoid[selection.selected] ?? null : null
	);
	let selectedName = $derived(
		selection.selected ? areaName(areas, selection.selected) : ''
	);
	let regionAvg = $derived(
		aggregates && indicator ? regionAvgAt(aggregates, indicator.id, explorer.year) : null
	);

	// trend: hovered tract takes priority, else the selected one
	let activeGeoid = $derived(selection.hover ?? selection.selected);
	let activeName = $derived(activeGeoid ? areaName(areas, activeGeoid) : '');
	let currentYearIndex = $derived(valueFile ? valueFile.years.indexOf(explorer.year) : -1);
	let trend = $derived.by(() => {
		if (!valueFile || !aggregates || !activeGeoid) return null;
		if (valueFile.indicatorId !== indicator?.id) return null;
		return seriesFor({ valueFile, aggregates, geoid: activeGeoid, level: explorer.geoLevel });
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

	function pickIndicatorId(id) {
		setIndicator(id);
		setSelected(null);
	}

	function onClassHover(range) {
		if (!selection.legendSticky) setLegendFilter(range, false);
	}
	function onClassSelect(range) {
		if (range) setLegendFilter(range, true);
		else setLegendFilter(null, false);
	}
	function onSelect(id) {
		setSelected(selection.selected === id ? null : id);
	}
</script>

<svelte:head>
	<title>Explore — Carolinas Regional Explorer</title>
</svelte:head>

<div class="explore">
	<aside class="panel" aria-label="Map controls">
		<div class="panel-section">
			<span class="field-label">Geographic level</span>
			<GeoLevelToggle value={explorer.geoLevel} onChange={setGeoLevel} />
		</div>

		<div class="panel-section browser-section">
			<span class="field-label">Indicator</span>
			<IndicatorBrowser variant="panel" selectedId={explorer.indicatorId} onSelect={pickIndicatorId} />
		</div>

		{#if indicator}
			<div class="panel-section about">
				<button class="about-toggle" aria-expanded={showAbout} onclick={() => (showAbout = !showAbout)}>
					<span>About this indicator</span>
					<span class="chev" class:open={showAbout}>▸</span>
				</button>
				{#if showAbout}
					<MetricInfoPanel {indicator} meta={metaText} compact />
					<a class="full-link" href="{base}/indicators/{indicator.slug}/">Full indicator page →</a>
				{/if}
			</div>
		{/if}
	</aside>

	<div class="map-wrap">
		<MapView
			geoLevel={explorer.geoLevel}
			{choropleth}
			legendFilter={selection.legendFilter}
			selected={selection.selected}
			{onSelect}
		/>

		{#if trend && indicator}
			<div class="trend-float card no-print">
				<div class="trend-head">
					<div>
						<strong>{activeName}</strong>
						<span class="trend-sub">{indicator.label}</span>
					</div>
				</div>
				<TrendChart
					years={trend.years}
					series={trend.series}
					{currentYearIndex}
					format={indicator.format}
					decimals={indicator.decimals ?? 1}
					animKey={activeGeoid}
				/>
			</div>
		{/if}

		{#if classes.length}
			<div class="legend-float no-print">
				<Legend
					{classes}
					title={indicator?.label}
					activeRange={selection.legendFilter}
					sticky={selection.legendSticky}
					{onClassHover}
					{onClassSelect}
				/>
				{#if selection.selected}
					<div class="card strip-card">
						<div class="strip-head">
							<span>{selectedName}</span>
							<button class="link" onclick={() => setSelected(null)}>✕</button>
						</div>
						<PercentileStrip
							value={selectedValue}
							{regionAvg}
							min={choropleth.stats.min}
							max={choropleth.stats.max}
							colors={choropleth.colors}
							format={indicator.format}
							decimals={indicator.decimals ?? 1}
						/>
					</div>
				{/if}
			</div>
		{/if}

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
	.browser-section {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
	}
	.about-toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		border: 0;
		background: transparent;
		padding: var(--sp-2) 0;
		font-weight: 600;
		font-size: var(--t-sm);
		color: var(--c-text);
		border-top: 1px solid var(--c-border);
	}
	.chev {
		transition: transform 0.15s ease;
	}
	.chev.open {
		transform: rotate(90deg);
	}
	.full-link {
		display: inline-block;
		margin-top: var(--sp-2);
		font-size: var(--t-sm);
	}
	.map-wrap {
		position: relative;
		min-height: 0;
	}
	.legend-float {
		position: absolute;
		left: var(--sp-4);
		bottom: var(--sp-4);
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
		max-width: 14rem;
	}
	.trend-float {
		position: absolute;
		top: var(--sp-4);
		right: var(--sp-4);
		width: 20rem;
		max-width: calc(100% - 2rem);
		padding: var(--sp-3) var(--sp-4);
	}
	.trend-head {
		margin-bottom: var(--sp-2);
	}
	.trend-head strong {
		display: block;
		font-size: var(--t-sm);
	}
	.trend-sub {
		font-size: var(--t-xs);
		color: var(--c-text-3);
	}
	.strip-card {
		padding: var(--sp-3);
	}
	.strip-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--t-sm);
		font-weight: 600;
		margin-bottom: var(--sp-2);
	}
	.link {
		border: 0;
		background: transparent;
		color: var(--c-text-3);
		font-size: var(--t-sm);
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
