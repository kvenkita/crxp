<script>
	import { base } from '$app/paths';
	import MetricInfoPanel from '$lib/components/MetricInfoPanel.svelte';

	let { data } = $props();
	let { indicator, meta, related } = $derived(data);
</script>

<svelte:head>
	<title>{indicator.label} — Carolinas Regional Explorer</title>
	<meta name="description" content="{indicator.label}: {indicator.source}, {indicator.vintage}." />
</svelte:head>

<article class="container indicator-page">
	<nav class="crumbs"><a href="{base}/indicators/">Indicators</a> › <span>{indicator.label}</span></nav>

	<header class="head">
		<p class="eyebrow">{indicator.category}</p>
		<h1>{indicator.label}</h1>
		<a class="btn btn-primary" href="{base}/explore/?i={indicator.slug}">View on the map →</a>
	</header>

	<div class="body">
		<MetricInfoPanel {indicator} {meta} />
	</div>

	{#if related.length}
		<section class="related">
			<h2>Related indicators</h2>
			<ul>
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
		margin: var(--sp-1) 0 var(--sp-4);
	}
	.body {
		margin-top: var(--sp-5);
	}
	.related {
		margin-top: var(--sp-6);
		border-top: 1px solid var(--c-border);
		padding-top: var(--sp-4);
	}
	.related ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
	}
	.related a {
		display: inline-block;
		padding: var(--sp-1) var(--sp-3);
		background: var(--c-surface-2);
		border-radius: var(--r-pill);
		font-size: var(--t-sm);
	}
</style>
