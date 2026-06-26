<script>
	import { base } from '$app/paths';
	let { data } = $props();

	// data dictionary ordered by theme (manifest order) then alphabetically within theme
	let catOrder = $derived(new Map((data.categories ?? []).map((c, i) => [c.key, c.order ?? i])));
	let sortedIndicators = $derived(
		[...(data.indicators ?? [])].sort(
			(a, b) =>
				(catOrder.get(a.category) ?? 99) - (catOrder.get(b.category) ?? 99) ||
				a.label.localeCompare(b.label)
		)
	);
</script>

<svelte:head>
	<title>Data — Carolinas Regional Explorer</title>
	<meta name="description" content="Download the underlying data and read the data dictionary for the Carolinas Regional Explorer." />
</svelte:head>

<div class="container data-page">
	<header>
		<p class="eyebrow">Open data</p>
		<h1>Data &amp; downloads</h1>
		<p class="lede">
			All indicator data is published as static files. Geography is decoupled from values, which
			join by Census-tract GEOID. {data.years.at(0)}–{data.years.at(-1)}.
		</p>
	</header>

	<section class="files">
		<h2>Files</h2>
		<ul>
			<li><a href="{base}/data/manifest.json">manifest.json</a> — indicator catalog &amp; config</li>
			<li><a href="{base}/data/geo/tracts.geojson">geo/tracts.geojson</a> — tract boundaries</li>
			<li><a href="{base}/data/aggregates.json">aggregates.json</a> — county &amp; region averages</li>
			<li><a href="{base}/data/areas/neighborhoods.json">areas/neighborhoods.json</a> — named neighborhoods (© OpenStreetMap, ODbL)</li>
			<li><code>data/values/&lt;id&gt;.json</code> — per-indicator values, breaks &amp; stats by year</li>
			<li><code>data/analytics/z/&lt;id&gt;.json</code>, <code>data/analytics/lisa/&lt;id&gt;.json</code> — bivariate z-scores &amp; LISA clusters</li>
			<li><code>data/meta/m&lt;id&gt;.md</code> — indicator metadata</li>
		</ul>
	</section>

	<section class="dict">
		<h2>Data dictionary</h2>
		<div class="table-wrap">
			<table>
				<thead>
					<tr><th>Indicator</th><th>Category</th><th>Format</th><th>Source</th><th>Vintage</th><th>Value file</th></tr>
				</thead>
				<tbody>
					{#each sortedIndicators as i (i.id)}
						<tr>
							<td><a href="{base}/indicators/{i.slug}/">{i.label}</a></td>
							<td>{i.category}</td>
							<td>{i.format}</td>
							<td>{i.source}</td>
							<td>{i.vintage}</td>
							<td><a href="{base}/data/values/{i.id}.json">{i.id}.json</a></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>

<style>
	.data-page {
		padding: var(--sp-6) var(--sp-5) var(--sp-8);
		max-width: 64rem;
	}
	.lede {
		color: var(--c-text-2);
		max-width: 60ch;
	}
	section {
		margin-top: var(--sp-6);
	}
	.files ul {
		line-height: 2;
	}
	code {
		font-family: var(--font-mono);
		font-size: var(--t-sm);
		background: var(--c-surface-2);
		padding: 1px 5px;
		border-radius: 4px;
	}
	.table-wrap {
		overflow-x: auto;
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
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
		white-space: nowrap;
	}
	th {
		background: var(--c-surface-2);
		font-weight: 600;
	}
</style>
