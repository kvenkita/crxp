<script>
	import { base } from '$app/paths';
	import ProfileHero from '$lib/components/ProfileHero.svelte';
	import MetricCardGrid from '$lib/components/MetricCardGrid.svelte';
	import ShareButtons from '$lib/components/ShareButtons.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
	let { place, indicators, categories } = $derived(data);
	let lead = $derived(`A profile of ${place.name} across ${indicators.length} quality-of-life indicators.`);
</script>

<Seo title="{place.name} — Carolinas Regional Explorer" description={lead} url="{base}/place/{place.geoid}/" />

<article class="container profile">
	<nav class="crumbs"><a href="{base}/explore/">Explore</a> › <span>{place.name}</span></nav>
	<ProfileHero kicker="City profile" name={place.name} {lead} />
	<div class="actions no-print">
		<ShareButtons url="{base}/place/{place.geoid}/" title="{place.name} profile" />
	</div>
	<MetricCardGrid items={indicators} {categories} />
</article>

<style>
	.profile {
		padding: 0 var(--sp-5) var(--sp-8);
		max-width: 64rem;
	}
	.crumbs {
		font-size: var(--t-sm);
		color: var(--c-text-3);
		margin: var(--sp-5) 0 0;
	}
	.actions {
		margin-top: var(--sp-4);
	}
</style>
