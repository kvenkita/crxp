<script>
	import { onMount, tick } from 'svelte';
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
	import AnalysisModeBar from '$lib/components/AnalysisModeBar.svelte';
	import MapSettings from '$lib/components/MapSettings.svelte';
	import BivariatePanel from '$lib/components/BivariatePanel.svelte';
	import LisaPanel from '$lib/components/LisaPanel.svelte';

	import { manifest, loadManifest, indicatorById, indicatorBySlug } from '$lib/state/manifest.svelte.js';
	import { explorer, setIndicator, setYear, setGeoLevel } from '$lib/state/explorer.svelte.js';
	import { selection, setHover, toggleTract, addTract, clearTracts, setLegendFilter } from '$lib/state/selection.svelte.js';
	import { analysis, setMode, setBivariateB, toggleQuadrant } from '$lib/state/analysis.svelte.js';

	import { loadValueFile, valuesForYear, reliabilityForYear, breaksAndColors } from '$lib/data/values.js';
	import { loadAggregates, regionAvgAt } from '$lib/data/aggregates.js';
	import { themeRamp } from '$lib/map/colorScale.js';
	import { loadAreas, areaName } from '$lib/data/areas.js';
	import { loadMeta } from '$lib/data/meta.js';
	import { loadLisa, quadForYear } from '$lib/data/analytics.js';
	import { seriesFor, seriesForSet, comparableChange } from '$lib/data/series.js';
	import { legendClasses, formatValue } from '$lib/map/colorScale.js';
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

	// map display settings
	let basemap = $state('light');
	let overlayOpacity = $state(0.82);
	let overlayOn = $state(true);
	let reliabilityOn = $state(true); // hatch high-uncertainty (unreliable) tracts

	// hovered bivariate matrix cell {a,b} (filters the map)
	let bivarCell = $state(null);

	let indicator = $derived(indicatorById(explorer.indicatorId));
	let accent = $derived(
		(indicator && manifest.categories.find((c) => c.key === indicator.category)?.color) || '#1f6f63'
	);
	let aboutEl = $state(null);

	async function infoClick() {
		showAbout = !showAbout;
		if (showAbout) {
			await tick();
			aboutEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

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
		const avail = indicator?.years ?? [];
		let cancelled = false;
		loadValueFile(id).then((file) => {
			if (cancelled) return;
			valueFile = file;
			// snap the year into the indicator's available range (some indicators lack early years)
			if (avail.length && !avail.includes(explorer.year)) setYear(avail.at(-1));
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
			const breaks = agg.breaks ?? [];
			const colors = themeRamp(accent, breaks.length + 1);
			const stats = { min: agg.domain?.min ?? 0, max: agg.domain?.max ?? 0, breaks };
			return { valuesByGeoid, breaks, colors, stats };
		}
		if (!valueFile || valueFile.indicatorId !== indicator.id) return null;
		const { breaks, colors, stats } = breaksAndColors(valueFile, accent);
		return {
			valuesByGeoid: valuesForYear(valueFile, explorer.year),
			reliabilityByGeoid: reliabilityForYear(valueFile, explorer.year),
			breaks,
			colors,
			stats
		};
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
		map.applyChoropleth(choropleth.valuesByGeoid, choropleth.breaks, choropleth.colors, choropleth.reliabilityByGeoid);
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
			map.setBivariateFilter(bivarCell?.a ?? null, bivarCell?.b ?? null);
		});
		return () => (cancelled = true);
	});

	// hovering a bivariate color block filters the map to that class combination
	$effect(() => {
		if (map && analysis.mode === 'bivariate') map.setBivariateFilter(bivarCell?.a ?? null, bivarCell?.b ?? null);
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

	// map display settings → controller
	$effect(() => {
		if (map) map.setBasemap(basemap);
	});
	$effect(() => {
		if (map) map.setOverlayOpacity(overlayOpacity);
	});
	$effect(() => {
		if (map) map.setOverlayVisible(overlayOn);
	});
	$effect(() => {
		if (map) map.setReliabilityVisible(reliabilityOn);
	});

	// selection + fly
	$effect(() => {
		if (map) map.setSelectedIds(selection.selectedIds);
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
	let regionAvg = $derived(aggregates && indicator ? regionAvgAt(aggregates, indicator.id, explorer.year) : null);
	let currentYearIndex = $derived(valueFile ? valueFile.years.indexOf(explorer.year) : -1);

	// average of the selected set at the current year (for the strip card)
	let selectionAvg = $derived.by(() => {
		if (!choropleth || !selection.selectedIds.length) return null;
		const vals = selection.selectedIds.map((g) => choropleth.valuesByGeoid[g]).filter((v) => v != null);
		return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
	});

	// trend: hovered single area takes priority (preview), else the selected set
	let trend = $derived.by(() => {
		if (!valueFile || !aggregates || valueFile.indicatorId !== indicator?.id) return null;
		if (selection.hover) return seriesFor({ valueFile, aggregates, geoid: selection.hover, level: explorer.geoLevel });
		if (selection.selectedIds.length)
			return seriesForSet({ valueFile, aggregates, geoids: selection.selectedIds, level: explorer.geoLevel });
		return null;
	});
	let trendName = $derived.by(() => {
		if (selection.hover) return areaName(areas, selection.hover);
		const n = selection.selectedIds.length;
		if (n === 1) return areaName(areas, selection.selectedIds[0]);
		if (n > 1) return `${n} ${explorer.geoLevel === 'county' ? 'counties' : 'tracts'} selected`;
		return '';
	});
	let animKey = $derived(selection.hover ?? selection.selectedIds.join(','));

	// comparable-period change (single tract): non-overlapping ACS endpoints + significance
	let trendChange = $derived.by(() => {
		if (!valueFile || explorer.geoLevel !== 'tract' || valueFile.indicatorId !== indicator?.id) return null;
		const gid = selection.hover ?? (selection.selectedIds.length === 1 ? selection.selectedIds[0] : null);
		if (!gid) return null;
		return comparableChange(valueFile, gid);
	});

	// ---- handlers ----
	function pickIndicatorId(id) {
		setIndicator(id);
	}
	function changeGeoLevel(l) {
		setGeoLevel(l);
		clearTracts(); // selection unit changes with the level
		map?.clearBoundary?.();
	}
	function onClassHover(range) {
		if (!selection.legendSticky) setLegendFilter(range, false);
	}
	function onClassSelect(range) {
		if (range) setLegendFilter(range, true);
		else setLegendFilter(null, false);
	}
	function onSelect(id) {
		toggleTract(id); // QoL-style multi-select
		map?.clearBoundary?.();
	}
	function pickArea(area) {
		if (area.level === 'tract') {
			addTract(area.geoid);
			map?.clearBoundary?.();
			if (area.bbox) flyBbox = area.bbox.slice();
		} else if (area.level === 'neighborhood') {
			// select the tract(s) this neighborhood labels, and zoom to them
			setGeoLevel('tract');
			clearTracts();
			for (const g of area.tractGeoids ?? []) addTract(g);
			map?.clearBoundary?.();
			if (area.bbox) flyBbox = area.bbox.slice();
		} else {
			// county or city: outline the boundary and zoom in, keeping tracts visible beneath
			setGeoLevel('tract');
			map?.showBoundary(area.level, area.geoid);
		}
	}
	function openReport() {
		if (!selection.selectedIds.length) return;
		const q = new URLSearchParams({ tracts: selection.selectedIds.join(','), geo: explorer.geoLevel }).toString();
		window.open(`${base}/report/?${q}`, '_blank');
	}
	function changeMode(m) {
		if (m === 'bivariate' && analysis.biB == null) {
			const other = manifest.indicators.find((i) => i.id !== explorer.indicatorId);
			setBivariateB(other?.id ?? explorer.indicatorId);
		}
		bivarCell = null;
		setMode(m);
	}
	function onBivarCell(a, b) {
		bivarCell = a == null ? null : { a, b };
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
			<GeoLevelToggle value={explorer.geoLevel} onChange={changeGeoLevel} />
		</div>

		{#if analysis.mode === 'explore'}
			<div class="panel-section browser-section">
				<span class="field-label">Indicator</span>
				<IndicatorBrowser variant="panel" selectedId={explorer.indicatorId} onSelect={pickIndicatorId} />
			</div>

			{#if indicator}
				<div class="panel-section about" bind:this={aboutEl}>
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
		{:else if analysis.mode === 'bivariate'}
			<div class="panel-section">
				<BivariatePanel
					indicators={manifest.indicators}
					biA={explorer.indicatorId}
					biB={analysis.biB}
					activeCell={bivarCell}
					onChangeA={pickIndicatorId}
					onChangeB={setBivariateB}
					onCellHover={onBivarCell}
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

		<div class="settings-float no-print">
			<MapSettings
				{basemap}
				opacity={overlayOpacity}
				overlayVisible={overlayOn}
				reliabilityVisible={reliabilityOn}
				onBasemap={(b) => (basemap = b)}
				onOpacity={(o) => (overlayOpacity = o)}
				onToggleOverlay={(v) => (overlayOn = v)}
				onToggleReliability={(v) => (reliabilityOn = v)}
			/>
		</div>

		{#if trend && indicator}
			<div class="trend-float card no-print">
				<div class="trend-head">
					<div>
						<strong>{trendName}</strong>
						<span class="trend-sub" style="border-bottom:2px solid {accent}; padding-bottom:1px;">{indicator.label}</span>
					</div>
				</div>
				{#if trendChange}
					{@const up = trendChange.delta > 0}
					{@const flat = trendChange.delta === 0}
					<div class="change-marker" class:sig={trendChange.significant === true}>
						<span class="chg-label">{trendChange.y1}→{trendChange.y2}</span>
						<span class="chg-val">{flat ? '▬' : up ? '▲' : '▼'} {up ? '+' : ''}{formatValue(trendChange.delta, indicator.format, indicator.decimals ?? 1)}</span>
						<span class="chg-sig">{trendChange.significant === true ? 'significant' : trendChange.significant === false ? 'not significant' : '—'}{trendChange.significant != null ? ' (90%)' : ''}</span>
					</div>
				{/if}
				<TrendChart
					years={trend.years}
					series={trend.series}
					{currentYearIndex}
					format={indicator.format}
					decimals={indicator.decimals ?? 1}
					{animKey}
				/>
				{#if selection.selectedIds.length}
					<div class="sel-actions">
						<button class="link" onclick={clearTracts}>Clear selection</button>
						<button class="btn-report" onclick={openReport}>Generate report →</button>
					</div>
				{/if}
			</div>
		{/if}

		{#if analysis.mode === 'explore' && classes.length}
			<div class="legend-float no-print">
				<Legend
					{classes}
					title={indicator?.label}
					description={indicator?.description}
					{accent}
					activeRange={selection.legendFilter}
					sticky={selection.legendSticky}
					{onClassHover}
					{onClassSelect}
					onInfo={infoClick}
				/>
				{#if selection.selectedIds.length}
					<div class="card strip-card">
						<div class="strip-head">
							<span>{selection.selectedIds.length === 1 ? trendName : `Selected average (${selection.selectedIds.length})`}</span>
							<button class="link" onclick={clearTracts}>✕</button>
						</div>
						<PercentileStrip
							value={selectionAvg}
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
	/* the whole sidebar (.panel) scrolls as one; the indicator list flows naturally */
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
	.change-marker {
		display: flex;
		align-items: baseline;
		gap: var(--sp-2);
		margin: 2px 0 var(--sp-1);
		padding: 2px 6px;
		border-left: 3px solid var(--c-border-strong);
		background: var(--c-surface-2, #f5f3f0);
		border-radius: 3px;
		font-size: var(--t-xs);
	}
	.change-marker.sig {
		border-left-color: #5b2a4e;
	}
	.change-marker .chg-label {
		color: var(--c-text-3);
		font-variant-numeric: tabular-nums;
	}
	.change-marker .chg-val {
		font-weight: 700;
		color: var(--c-text);
		font-variant-numeric: tabular-nums;
	}
	.change-marker .chg-sig {
		margin-left: auto;
		color: var(--c-text-3);
		font-style: italic;
	}
	.change-marker.sig .chg-sig {
		color: #5b2a4e;
		font-style: normal;
		font-weight: 600;
	}
	.search-float {
		position: absolute;
		top: var(--sp-4);
		left: var(--sp-4);
		width: min(22rem, calc(100% - 2rem));
		z-index: 20;
	}
	.settings-float {
		position: absolute;
		top: calc(var(--sp-4) + 3rem);
		left: var(--sp-4);
		z-index: 19;
	}
	.sel-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-2);
		margin-top: var(--sp-2);
	}
	.btn-report {
		border: 0;
		background: var(--c-teal);
		color: var(--c-text-inv);
		border-radius: var(--r-pill);
		padding: 3px var(--sp-3);
		font-size: var(--t-xs);
		font-weight: 600;
	}
	.btn-report:hover {
		background: var(--c-accent-strong);
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
