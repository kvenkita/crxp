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
	import AreaSearch from '$lib/components/AreaSearch.svelte';
	import ComparePanel from '$lib/components/ComparePanel.svelte';
	import PinButton from '$lib/components/PinButton.svelte';
	import AnalysisModeBar from '$lib/components/AnalysisModeBar.svelte';
	import BivariatePanel from '$lib/components/BivariatePanel.svelte';
	import LisaPanel from '$lib/components/LisaPanel.svelte';

	import { manifest, loadManifest, indicatorById, indicatorBySlug } from '$lib/state/manifest.svelte.js';
	import { explorer, setIndicator, setYear, setGeoLevel } from '$lib/state/explorer.svelte.js';
	import { selection, setSelected, setLegendFilter } from '$lib/state/selection.svelte.js';
	import { analysis, setMode, setBivariateB, toggleQuadrant } from '$lib/state/analysis.svelte.js';
	import { pins, unpin } from '$lib/state/pins.svelte.js';

	import { loadValueFile, valuesForYear, breaksAndColors } from '$lib/data/values.js';
	import { loadAggregates, regionAvgAt } from '$lib/data/aggregates.js';
	import { summarize } from '$lib/analytics/spatial.js';
	import { schemeColors } from '$lib/map/colorScale.js';
	import { loadAreas, areaName } from '$lib/data/areas.js';
	import { loadMeta } from '$lib/data/meta.js';
	import { loadLisa, quadForYear } from '$lib/data/analytics.js';
	import { seriesFor } from '$lib/data/series.js';
	import { legendClasses } from '$lib/map/colorScale.js';
	import { terciles, BIVARIATE_MATRIX } from '$lib/map/bivariate.js';
	import { stateToParams, paramsToState } from '$lib/util/url.js';

	let map = $state(null); // MapController, set on ready
	let valueFile = $state(null);
	let aggregates = $state(null);
	let areas = $state(null);
	let metaText = $state('');
	let showAbout = $state(false);
	let flyBbox = $state(null);
	let booted = $state(false);

	let indicator = $derived(indicatorById(explorer.indicatorId));

	onMount(async () => {
		await loadManifest();
		loadAggregates().then((a) => (aggregates = a));
		loadAreas().then((a) => (areas = a));
		const u = paramsToState(page.url.searchParams);
		const ind = (u.i && indicatorBySlug(u.i)) || manifest.indicators[0];
		setIndicator(ind?.id ?? null);
		setGeoLevel(u.geo === 'county' ? 'county' : 'tract');
		setYear(u.y && ind?.years.includes(u.y) ? u.y : ind?.years.at(-1) ?? null);
		if (u.mode) setMode(u.mode);
		if (u.biB) setBivariateB(indicatorBySlug(u.biB)?.id ?? null);
		booted = true;
	});

	// value file for the active indicator
	$effect(() => {
		const id = explorer.indicatorId;
		if (id == null) return;
		let cancelled = false;
		loadValueFile(id).then((file) => {
			if (cancelled) return;
			valueFile = file;
			if (!file.years.includes(explorer.year)) setYear(file.years.at(-1));
		});
		return () => (cancelled = true);
	});

	// metadata
	$effect(() => {
		const ind = indicator;
		if (!ind) return;
		metaText = '';
		let cancelled = false;
		loadMeta(ind.metaPath).then((t) => !cancelled && (metaText = t));
		return () => (cancelled = true);
	});

	let choropleth = $derived.by(() => {
		if (!indicator || explorer.year == null) return null;
		if (explorer.geoLevel === 'county') {
			const agg = aggregates?.[indicator.id];
			if (!agg) return null;
			const yi = agg.years.indexOf(explorer.year);
			if (yi < 0) return null;
			const valuesByGeoid = {};
			for (const fips of Object.keys(agg.countyAvg)) valuesByGeoid[fips] = agg.countyAvg[fips][yi];
			const stats = summarize(Object.values(valuesByGeoid), 5);
			const colors = schemeColors(indicator.colorScheme || 'YlGnBu', stats.breaks.length + 1);
			return { valuesByGeoid, breaks: stats.breaks, colors, stats };
		}
		if (!valueFile || valueFile.indicatorId !== indicator.id) return null;
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

	// ---- map driving effects (page composes; controller is imperative) ----

	// EXPLORE choropleth
	$effect(() => {
		if (!map || analysis.mode !== 'explore' || !choropleth) return;
		map.setGeoLevel(explorer.geoLevel);
		map.applyChoropleth(choropleth.valuesByGeoid, choropleth.breaks, choropleth.colors);
		map.setLegendFilter(selection.legendFilter, choropleth.valuesByGeoid);
	});

	// BIVARIATE (variable A = primary indicator, variable B = analysis.biB)
	$effect(() => {
		if (!map || analysis.mode !== 'bivariate' || explorer.indicatorId == null || analysis.biB == null || explorer.year == null)
			return;
		const a = explorer.indicatorId;
		const b = analysis.biB;
		const yr = explorer.year;
		const lvl = explorer.geoLevel;
		let cancelled = false;
		Promise.all([loadValueFile(a), loadValueFile(b)]).then(([fa, fb]) => {
			if (cancelled || !map) return;
			map.setGeoLevel(lvl);
			const ca = terciles(valuesForYear(fa, yr));
			const cb = terciles(valuesForYear(fb, yr));
			map.setBivariateMode(ca, cb, BIVARIATE_MATRIX);
		});
		return () => (cancelled = true);
	});

	// LISA (indicator = primary indicator)
	$effect(() => {
		if (!map || analysis.mode !== 'lisa' || explorer.indicatorId == null || explorer.year == null) return;
		const id = explorer.indicatorId;
		const yr = explorer.year;
		const lvl = explorer.geoLevel;
		const quads = analysis.lisaQuadrants.slice();
		let cancelled = false;
		loadLisa(id).then((file) => {
			if (cancelled || !map) return;
			map.setGeoLevel(lvl);
			map.setLisaMode(quadForYear(file, yr), quads);
		});
		return () => (cancelled = true);
	});

	// selection + fly
	$effect(() => {
		if (map) map.setSelected(selection.selected);
	});
	$effect(() => {
		if (map && flyBbox) map.flyToBbox(flyBbox);
	});

	// ---- URL sync ----
	$effect(() => {
		if (!browser || !booted || !indicator) return;
		const params = stateToParams({
			i: indicator.slug,
			y: explorer.year,
			geo: explorer.geoLevel,
			mode: analysis.mode,
			biB: indicatorById(analysis.biB)?.slug,
			q: analysis.lisaQuadrants.map(String)
		});
		const qs = new URLSearchParams(params).toString();
		replaceState(qs ? `?${qs}` : page.url.pathname, {});
	});

	// ---- derivations for panels ----
	let selectedValue = $derived(
		choropleth && selection.selected ? choropleth.valuesByGeoid[selection.selected] ?? null : null
	);
	let selectedName = $derived(selection.selected ? areaName(areas, selection.selected) : '');
	let regionAvg = $derived(aggregates && indicator ? regionAvgAt(aggregates, indicator.id, explorer.year) : null);

	let activeGeoid = $derived(selection.hover ?? selection.selected);
	let activeName = $derived(activeGeoid ? areaName(areas, activeGeoid) : '');
	let currentYearIndex = $derived(valueFile ? valueFile.years.indexOf(explorer.year) : -1);
	let trend = $derived.by(() => {
		if (!valueFile || !aggregates || !activeGeoid || valueFile.indicatorId !== indicator?.id) return null;
		return seriesFor({ valueFile, aggregates, geoid: activeGeoid, level: explorer.geoLevel });
	});
	let activeArea = $derived(
		activeGeoid ? areas?.byId.get(activeGeoid) ?? { geoid: activeGeoid, name: activeName, level: explorer.geoLevel } : null
	);

	function rowFor(area) {
		const years = valueFile?.years ?? [];
		let values;
		if (area.level === 'county') values = aggregates?.[indicator?.id]?.countyAvg?.[area.geoid] ?? years.map(() => null);
		else values = valueFile?.values?.[area.geoid] ?? years.map(() => null);
		return { geoid: area.geoid, name: area.name, level: area.level, values, current: values?.[currentYearIndex] ?? null };
	}
	let compareRows = $derived(
		valueFile && indicator && valueFile.indicatorId === indicator.id ? pins.items.map(rowFor) : []
	);

	// ---- handlers ----
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
		map?.clearBoundary?.();
	}
	function pickArea(area) {
		if (area.level === 'tract') {
			setSelected(area.geoid);
			map?.clearBoundary?.();
			if (area.bbox) flyBbox = area.bbox.slice();
		} else {
			// county or city: outline the boundary and zoom in, keeping tracts visible beneath
			setGeoLevel('tract');
			map?.showBoundary(area.level, area.geoid);
		}
	}
	function changeMode(m) {
		if (m === 'bivariate' && analysis.biB == null) {
			const other = manifest.indicators.find((i) => i.id !== explorer.indicatorId);
			setBivariateB(other?.id ?? explorer.indicatorId);
		}
		setMode(m);
	}
</script>

<svelte:head>
	<title>Explore — Carolinas Regional Explorer</title>
</svelte:head>

<div class="explore">
	<aside class="panel" aria-label="Map controls">
		<div class="panel-section">
			<AnalysisModeBar mode={analysis.mode} onChange={changeMode} />
		</div>
		<div class="panel-section">
			<span class="field-label">Geographic level</span>
			<GeoLevelToggle value={explorer.geoLevel} onChange={setGeoLevel} />
		</div>

		{#if analysis.mode === 'explore'}
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

			<div class="panel-section">
				<ComparePanel
					rows={compareRows}
					{indicator}
					domain={choropleth ? { min: choropleth.stats.min, max: choropleth.stats.max } : { min: 0, max: 100 }}
					onUnpin={unpin}
				/>
			</div>
		{:else if analysis.mode === 'bivariate'}
			<div class="panel-section">
				<BivariatePanel
					indicators={manifest.indicators}
					biA={explorer.indicatorId}
					biB={analysis.biB}
					onChangeA={pickIndicatorId}
					onChangeB={setBivariateB}
				/>
			</div>
		{:else if analysis.mode === 'lisa'}
			<div class="panel-section">
				<LisaPanel
					indicators={manifest.indicators}
					lisaId={explorer.indicatorId}
					quadrants={analysis.lisaQuadrants}
					onIndicator={pickIndicatorId}
					onToggle={toggleQuadrant}
				/>
			</div>
		{/if}
	</aside>

	<div class="map-wrap">
		<MapView onReady={(c) => (map = c)} onHover={(id) => (selection.hover = id ?? null)} {onSelect} />

		<div class="search-float no-print">
			<AreaSearch areas={areas?.all ?? []} onPick={pickArea} />
		</div>

		{#if trend && indicator}
			<div class="trend-float card no-print">
				<div class="trend-head">
					<div>
						<strong>{activeName}</strong>
						<span class="trend-sub">{indicator.label}</span>
					</div>
					{#if activeArea}<PinButton area={activeArea} compact />{/if}
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

		{#if analysis.mode === 'explore' && classes.length}
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
		grid-template-columns: 21rem 1fr;
		min-height: 0;
	}
	.panel {
		border-right: 1px solid var(--c-border);
		background: var(--c-surface);
		padding: var(--sp-4);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
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
		min-height: 8rem;
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
		bottom: var(--sp-6);
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
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--sp-2);
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
	.search-float {
		position: absolute;
		top: var(--sp-4);
		left: var(--sp-4);
		width: min(22rem, calc(100% - 2rem));
		z-index: 20;
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
	@media (max-width: 820px) {
		.explore {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}
		.panel {
			max-height: 42vh;
		}
	}
</style>
