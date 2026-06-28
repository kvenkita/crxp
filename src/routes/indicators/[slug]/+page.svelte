<script>
	import { base } from '$app/paths';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';
	import RegionContext from '$lib/components/RegionContext.svelte';

	let { data } = $props();
	let { indicator, meta, brief, aboutMd, related } = $derived(data);

	// host name for showing the source domain on each resource link
	const host = (url) => {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return '';
		}
	};
</script>

<svelte:head>
	<title>{indicator.label} — Carolinas Regional Explorer</title>
	<meta name="description" content="Why {indicator.label.toLowerCase()} matters, with sources — {indicator.source}, {indicator.vintage}." />
</svelte:head>

<article class="container indicator-page">
	<nav class="crumbs"><a href="{base}/indicators/">Indicators</a> › <span>{indicator.label}</span></nav>

	<header class="head">
		<p class="eyebrow">{indicator.category}</p>
		<h1>{indicator.label}</h1>
		<div class="chips">
			<span class="chip">{indicator.source}</span>
			{#if indicator.vintage}<span class="chip">{indicator.vintage}</span>{/if}
			{#if indicator.higherIsBetter === true}<span class="chip good">Higher is better</span>{/if}
			{#if indicator.higherIsBetter === false}<span class="chip need">Higher = more need</span>{/if}
		</div>
		<a class="btn btn-primary" href="{base}/explore/?i={indicator.slug}">View on the map →</a>
	</header>

	{#if brief?.why}
		<section class="why">
			<h2>Why this matters</h2>
			<MarkdownBlock source={brief.why} />
		</section>
	{:else if meta}
		<section class="why"><MarkdownBlock source={meta} /></section>
	{/if}

	<RegionContext />

	{#if brief?.resources?.length}
		<section class="resources">
			<h2>Learn more</h2>
			<ul>
				{#each brief.resources as r (r.url)}
					<li>
						<a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
						{#if host(r.url)}<span class="src-host">{host(r.url)}</span>{/if}
						{#if r.note}<p class="note">{r.note}</p>{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if aboutMd}
		<section class="about">
			<h2>About the data</h2>
			<MarkdownBlock source={aboutMd} />
		</section>
	{/if}

	{#if related.length}
		<section class="related">
			<h2>Related indicators</h2>
			<ul class="rel-list">
				{#each related as r (r.slug)}
					<li><a href="{base}/indicators/{r.slug}/">{r.label}</a></li>
				{/each}
			</ul>
		</section>
	{/if}
</article>

<style>
	.indicator-page {
		padding: var(--sp-6) var(--sp-5) var(--sp-8);
		max-width: 52rem;
	}
	.crumbs {
		font-size: var(--t-sm);
		color: var(--c-text-3);
		margin-bottom: var(--sp-4);
	}
	.head h1 {
		margin: var(--sp-1) 0 var(--sp-3);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
		margin-bottom: var(--sp-4);
	}
	.chip {
		font-size: 0.68rem;
		background: var(--c-surface-2);
		color: var(--c-text-2);
		border: 1px solid var(--c-border);
		border-radius: var(--r-pill);
		padding: 2px var(--sp-2);
	}
	.chip.good {
		background: #e8f3ef;
		color: var(--c-accent-strong);
		border-color: #cfe7df;
	}
	.chip.need {
		background: #f7eede;
		color: var(--c-warn);
		border-color: #ecdcc0;
	}
	section {
		margin-top: var(--sp-6);
	}
	section h2 {
		font-size: var(--t-lg);
		margin: 0 0 var(--sp-3);
	}
	.resources ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
	}
	.resources li {
		border-left: 3px solid var(--c-border);
		padding-left: var(--sp-3);
	}
	.resources a {
		font-weight: 600;
	}
	.src-host {
		font-size: var(--t-xs);
		color: var(--c-text-3);
		margin-left: var(--sp-2);
	}
	.resources .note {
		margin: 2px 0 0;
		font-size: var(--t-sm);
		color: var(--c-text-2);
	}
	.about {
		border-top: 1px solid var(--c-border);
		padding-top: var(--sp-4);
	}
	.about :global(.prose) {
		font-size: var(--t-sm);
		color: var(--c-text-2);
	}
	.related {
		border-top: 1px solid var(--c-border);
		padding-top: var(--sp-4);
	}
	.rel-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
	}
	.rel-list a {
		display: inline-block;
		padding: var(--sp-1) var(--sp-3);
		background: var(--c-surface-2);
		border-radius: var(--r-pill);
		font-size: var(--t-sm);
	}
</style>
