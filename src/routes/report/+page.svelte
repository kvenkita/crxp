<script>
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { manifest, loadManifest } from '$lib/state/manifest.svelte.js';
	import { loadValueFile, valuesForYear } from '$lib/data/values.js';
	import { loadAggregates, regionAvgAt, countyAvgAt } from '$lib/data/aggregates.js';
	import { loadAreas, areaName } from '$lib/data/areas.js';
	import { formatValue } from '$lib/map/colorScale.js';
	import ShareButtons from '$lib/components/ShareButtons.svelte';
	import AttributionFooter from '$lib/components/AttributionFooter.svelte';

	let ready = $state(false);
	let geoids = $state([]);
	let geo = $state('tract');
	let rows = $state([]); // {category, items:[{label, slug, format, decimals, selected, region, delta, firstYear, lastYear}]}
	let areaNames = $state([]);
	let counties = $state([]);
	let generatedOn = $state('');

	const mean = (vals) => {
		const f = vals.filter((v) => v != null && Number.isFinite(v));
		return f.length ? f.reduce((a, b) => a + b, 0) / f.length : null;
	};

	onMount(async () => {
		const p = page.url.searchParams;
		geoids = (p.get('tracts') || '').split(',').filter(Boolean);
		geo = p.get('geo') || 'tract';
		generatedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

		const [, aggregates, areas] = await Promise.all([loadManifest(), loadAggregates(), loadAreas()]);
		areaNames = geoids.map((g) => areaName(areas, g));
		counties = [...new Set(geo === 'county' ? geoids : geoids.map((g) => g.slice(0, 5)))].map((f) => areaName(areas, f));

		const byCat = new Map();
		for (const ind of manifest.indicators) {
			const file = await loadValueFile(ind.id);
			const years = ind.years;
			const last = years.at(-1);
			const first = years[0];
			const valAt = (yr) => {
				if (geo === 'county') return mean(geoids.map((g) => countyAvgAt(aggregates, ind.id, yr, g)));
				const vy = valuesForYear(file, yr);
				return mean(geoids.map((g) => vy[g]));
			};
			const selected = valAt(last);
			const selectedFirst = valAt(first);
			const region = regionAvgAt(aggregates, ind.id, last);
			const item = {
				label: ind.label,
				slug: ind.slug,
				format: ind.format,
				decimals: ind.decimals ?? 1,
				selected,
				region,
				delta: selected != null && selectedFirst != null ? selected - selectedFirst : null,
				firstYear: first,
				lastYear: last
			};
			if (!byCat.has(ind.category)) byCat.set(ind.category, []);
			byCat.get(ind.category).push(item);
		}
		rows = manifest.categories
			.map((c) => ({
				key: c.key, label: c.label, color: c.color,
				items: (byCat.get(c.key) || []).sort((a, b) => a.label.localeCompare(b.label))
			}))
			.filter((c) => c.items.length);
		ready = true;
	});

	// Character = general demographics; the rest are Quality-of-Life dimensions.
	let qolStartKey = $derived(rows.find((r) => r.key !== 'character')?.key ?? null);

	const fmt = (v, it) => formatValue(v, it.format, it.decimals);
	const vsRegion = (it) => {
		if (it.selected == null || it.region == null) return '—';
		const d = it.selected - it.region;
		return `${d > 0 ? '+' : ''}${formatValue(d, it.format, it.decimals)}`;
	};
</script>

<svelte:head>
	<title>Neighborhood Report — Carolinas Regional Explorer</title>
</svelte:head>

<div class="report">
	<div class="controls no-print">
		<a href="{base}/explore/">← Back to explorer</a>
		<div class="controls-right">
			{#if ready && geoids.length}
				<ShareButtons title="Carolinas Regional Explorer — custom area report" />
			{/if}
			<button class="btn btn-primary" onclick={() => window.print()}>Print / Save as PDF</button>
		</div>
	</div>

	{#if !ready}
		<p class="loading">Building report…</p>
	{:else if !geoids.length}
		<p class="loading">No areas selected. Return to the explorer and select one or more tracts.</p>
	{:else}
		<header class="rpt-head">
			<p class="eyebrow">Carolinas Regional Explorer</p>
			<h1>Custom area report</h1>
			<p class="summary">
				{geoids.length}
				{geo === 'county' ? 'counties' : 'tracts'} selected across {counties.join(', ')}. Generated {generatedOn}.
			</p>
			{#if areaNames.length <= 12}
				<p class="areas">{areaNames.join(' · ')}</p>
			{/if}
		</header>

		{#each rows as cat (cat.key)}
			{#if cat.key === qolStartKey}
				<h2 class="group-heading">Quality of Life Dimensions</h2>
			{/if}
			<section class="cat">
				<h2 style="border-color:{cat.color}">{cat.label}</h2>
				<table>
					<thead>
						<tr>
							<th>Indicator</th>
							<th class="num">Selected ({rows[0].items[0].lastYear})</th>
							<th class="num">Region</th>
							<th class="num">vs. Region</th>
							<th class="num">Change since {rows[0].items[0].firstYear}</th>
						</tr>
					</thead>
					<tbody>
						{#each cat.items as it (it.slug)}
							<tr>
								<td>{it.label}</td>
								<td class="num strong">{fmt(it.selected, it)}</td>
								<td class="num">{fmt(it.region, it)}</td>
								<td class="num">{vsRegion(it)}</td>
								<td class="num">{it.delta == null ? '—' : (it.delta > 0 ? '▲ ' : it.delta < 0 ? '▼ ' : '') + formatValue(Math.abs(it.delta), it.format, it.decimals)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		{/each}

		<footer class="rpt-foot">
			<p>
				Source: U.S. Census Bureau, American Community Survey 5-Year Estimates (and CDC PLACES, USGS
				NLCD, EOG VIIRS for non-ACS indicators). Values are unweighted averages across the selected
				areas. See the methodology at {base ? base : ''}/methods.
			</p>
		</footer>

		<AttributionFooter />
	{/if}
</div>

<style>
	.report {
		max-width: 60rem;
		margin: 0 auto;
		padding: var(--sp-5) var(--sp-5) var(--sp-8);
	}
	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--sp-4);
		flex-wrap: wrap;
		margin-bottom: var(--sp-5);
	}
	.controls-right {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		flex-wrap: wrap;
	}
	.loading {
		color: var(--c-text-3);
	}
	.rpt-head {
		border-bottom: 2px solid var(--c-border-strong);
		padding-bottom: var(--sp-4);
		margin-bottom: var(--sp-5);
	}
	.rpt-head h1 {
		margin: var(--sp-1) 0 var(--sp-2);
	}
	.summary {
		color: var(--c-text-2);
	}
	.areas {
		font-size: var(--t-sm);
		color: var(--c-text-3);
	}
	.group-heading {
		font-size: var(--t-lg);
		margin: var(--sp-6) 0 var(--sp-3);
		padding-top: var(--sp-3);
		border-top: 1px solid var(--c-border);
		color: var(--c-text);
	}
	.cat {
		margin-bottom: var(--sp-5);
		break-inside: avoid;
	}
	.cat h2 {
		font-size: var(--t-lg);
		border-left: 4px solid var(--c-teal);
		padding-left: var(--sp-3);
		margin-bottom: var(--sp-2);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--t-sm);
	}
	th,
	td {
		text-align: left;
		padding: var(--sp-2) var(--sp-3);
		border-bottom: 1px solid var(--c-border);
	}
	th {
		background: var(--c-surface-2);
		font-weight: 600;
	}
	.num {
		text-align: right;
	}
	.strong {
		font-weight: 700;
		color: var(--c-plum);
	}
	.rpt-foot {
		margin-top: var(--sp-6);
		border-top: 1px solid var(--c-border);
		padding-top: var(--sp-3);
		font-size: var(--t-xs);
		color: var(--c-text-3);
	}
	@media print {
		.report {
			padding: 0;
			max-width: none;
		}
	}
</style>
