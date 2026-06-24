<script>
	import { base } from '$app/paths';
	import ProfileHero from '$lib/components/ProfileHero.svelte';
	import MetricCardGrid from '$lib/components/MetricCardGrid.svelte';
	import MapSnapshot from '$lib/components/MapSnapshot.svelte';
	import ShareButtons from '$lib/components/ShareButtons.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
	let { county, indicators, categories, counties } = $derived(data);

	let lead = $derived(
		`A profile of ${county.name} (${county.tractCount} Census tracts) across ${indicators.length} quality-of-life indicators in the ${data.region}.`
	);
</script>

<Seo
	title="{county.name} — Carolinas Regional Explorer"
	description={lead}
	url="{base}/county/{county.fips}/"
/>

<article class="container profile">
	<nav class="crumbs"><a href="{base}/explore/">Explore</a> › <span>{county.name}</span></nav>

	<ProfileHero kicker="County profile" name={county.name} {lead}
		stats={[{ label: 'Census tracts', value: county.tractCount }, { label: 'State', value: county.state }]}>
		{#snippet snapshot()}
			<MapSnapshot {counties} activeFips={county.fips} />
		{/snippet}
	</ProfileHero>

	<div class="actions no-print">
		<a class="btn btn-primary" href="{base}/explore/?geo=county">Open in the explorer →</a>
		<ShareButtons url="{base}/county/{county.fips}/" title="{county.name} profile" />
	</div>

	<MetricCardGrid items={indicators} {categories} />

	<section class="methods">
		<h2>About this profile</h2>
		<p>
			Values are county averages of Census-tract estimates from the U.S. Census Bureau's American
			Community Survey. Each card links to the full indicator definition. See
			<a href="{base}/methods/">Methods</a> for details and limitations.
		</p>
	</section>
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
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-4);
		flex-wrap: wrap;
		margin-top: var(--sp-4);
	}
	.methods {
		margin-top: var(--sp-7);
		border-top: 1px solid var(--c-border);
		padding-top: var(--sp-4);
	}
	.methods p {
		color: var(--c-text-2);
		max-width: 60ch;
	}
</style>
