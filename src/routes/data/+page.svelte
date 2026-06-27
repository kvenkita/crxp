<script>
	import { base } from '$app/paths';
	let { data } = $props();

	// indicators grouped by dimension (manifest order), alphabetical within each dimension
	let groups = $derived(
		(data.categories ?? [])
			.map((c) => ({
				...c,
				items: (data.indicators ?? [])
					.filter((i) => i.category === c.key)
					.sort((a, b) => a.label.localeCompare(b.label))
			}))
			.filter((c) => c.items.length)
	);
	// Character = general demographics; the rest are Quality-of-Life dimensions.
	let qolStartKey = $derived(groups.find((g) => g.key !== 'character')?.key ?? null);

	// collapsible accordion — dimensions start collapsed
	let openKeys = $state(new Set());
	function toggle(key) {
		const s = new Set(openKeys);
		s.has(key) ? s.delete(key) : s.add(key);
		openKeys = s;
	}
	const isOpen = (key) => openKeys.has(key);

	// All download artifacts are prebuilt at build time (scripts/build-data-zip.mjs), so they
	// refresh whenever the data is rebuilt and download instantly as static files.
	const csvUrl = (slug) => `${base}/downloads/csv/${slug}.csv`;
	const jsonUrl = (id) => `${base}/data/values/${id}.json`;
	const zipUrl = `${base}/downloads/crxp-data.zip`;
</script>

<svelte:head>
	<title>Data — Carolinas Regional Explorer</title>
	<meta name="description" content="Download the Carolinas Regional Explorer data — every indicator as CSV or JSON, or the complete dataset as a single archive." />
</svelte:head>

<div class="container data-page">
	<header>
		<p class="eyebrow">Open data</p>
		<h1>Data &amp; downloads</h1>
		<p class="lede">
			Every indicator is open data, published at the 2020 Census-tract level for the 14-county Charlotte
			region ({data.years.at(0)}–{data.years.at(-1)}). Download individual indicators or the complete set.
		</p>
	</header>

	<section class="download">
		<h2>Download data of the explorer</h2>
		<p class="hint">Expand a dimension to see its data dictionary and download each indicator as CSV or JSON.</p>

		{#each groups as g (g.key)}
			{#if g.key === qolStartKey}
				<h3 class="group-heading">Quality of Life Dimensions</h3>
			{/if}
			<section class="dim" style="--theme:{g.color ?? 'var(--c-teal)'}">
				<button class="dim-head" aria-expanded={isOpen(g.key)} onclick={() => toggle(g.key)}>
					<span class="chev" class:open={isOpen(g.key)}>▸</span>
					<span class="dim-name">{g.label}</span>
					<span class="count">{g.items.length}</span>
				</button>
				{#if isOpen(g.key)}
					<div class="table-wrap">
						<table>
							<thead>
								<tr><th>Indicator</th><th>Source</th><th>Vintage</th><th class="dl">Download</th></tr>
							</thead>
							<tbody>
								{#each g.items as i (i.id)}
									<tr>
										<td><a href="{base}/indicators/{i.slug}/">{i.label}</a></td>
										<td class="src">{i.source}</td>
										<td>{i.vintage}</td>
										<td class="dl">
											<a class="dlbtn" href={csvUrl(i.slug)} download="{i.slug}.csv">CSV</a>
											<a class="dlbtn" href={jsonUrl(i.id)} download="{i.slug}.json">JSON</a>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</section>
		{/each}
	</section>

	<section class="download-all">
		<h2>Download all data</h2>
		<p class="hint">
			The complete dataset — every indicator as a long-format CSV, plus a data dictionary — in a single
			<code>.zip</code> archive, rebuilt with every data update.
		</p>
		<a class="btn btn-primary" href={zipUrl} download="crxp-data.zip">Download all (.zip)</a>
	</section>
</div>

<style>
	.data-page {
		padding: var(--sp-6) var(--sp-5) var(--sp-8);
		max-width: 64rem;
	}
	.lede {
		color: var(--c-text-2);
		max-width: 62ch;
	}
	section {
		margin-top: var(--sp-6);
	}
	.hint {
		color: var(--c-text-3);
		font-size: var(--t-sm);
		margin: var(--sp-1) 0 var(--sp-4);
	}
	.group-heading {
		margin: var(--sp-6) 0 var(--sp-2);
		padding-top: var(--sp-3);
		border-top: 1px solid var(--c-border);
		font-size: var(--t-lg);
		color: var(--c-text);
	}
	.dim {
		margin-top: var(--sp-2);
		border: 1px solid var(--c-border);
		border-left: 3px solid var(--theme);
		border-radius: var(--r-md);
		overflow: hidden;
	}
	.dim-head {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		width: 100%;
		border: 0;
		background: var(--c-surface);
		padding: var(--sp-3) var(--sp-4);
		font-size: var(--t-base);
		font-weight: 600;
		color: var(--c-text);
		text-align: left;
		cursor: pointer;
	}
	.dim-head:hover {
		background: var(--c-surface-2);
	}
	.dim-name {
		color: var(--theme);
	}
	.chev {
		font-size: 0.8em;
		color: var(--theme);
		transition: transform 0.15s ease;
	}
	.chev.open {
		transform: rotate(90deg);
	}
	.count {
		margin-left: auto;
		font-size: var(--t-xs);
		font-weight: 600;
		color: var(--c-text-3);
		background: var(--c-surface-2);
		border-radius: var(--r-pill);
		padding: 0 var(--sp-2);
	}
	.table-wrap {
		overflow-x: auto;
		border-top: 1px solid var(--c-border);
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
		vertical-align: top;
	}
	tbody tr:last-child td {
		border-bottom: 0;
	}
	th {
		background: var(--c-surface-2);
		font-weight: 600;
		white-space: nowrap;
	}
	.src {
		color: var(--c-text-2);
		max-width: 24rem;
	}
	.dl {
		white-space: nowrap;
		text-align: right;
	}
	.dlbtn {
		display: inline-block;
		font-size: var(--t-xs);
		font-weight: 600;
		border: 1px solid var(--c-border-strong);
		background: var(--c-surface);
		color: var(--c-text-2);
		border-radius: var(--r-pill);
		padding: 2px var(--sp-3);
		margin-left: var(--sp-1);
	}
	.dlbtn:hover {
		border-color: var(--theme, var(--c-teal));
		color: var(--c-text);
		text-decoration: none;
	}
	code {
		font-family: var(--font-mono);
		font-size: var(--t-sm);
		background: var(--c-surface-2);
		padding: 1px 5px;
		border-radius: 4px;
	}
</style>
