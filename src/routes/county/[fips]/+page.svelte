<script>
	import { base } from '$app/paths';
	import ProfileHero from '$lib/components/ProfileHero.svelte';
	import MetricCardGrid from '$lib/components/MetricCardGrid.svelte';
	import CountyLocator from '$lib/components/CountyLocator.svelte';
	import CountySwitcher from '$lib/components/CountySwitcher.svelte';
	import ShareButtons from '$lib/components/ShareButtons.svelte';
	import AttributionFooter from '$lib/components/AttributionFooter.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
	let { county, indicators, categories, counties, shapes } = $derived(data);

	let lead = $derived(
		`A profile of ${county.name} (${county.tractCount} Census tracts) across ${indicators.length} demographic and quality-of-life indicators in the ${data.region}.`
	);
</script>

<Seo
	title="{county.name} — Carolinas Regional Explorer"
	description={lead}
	url="{base}/county/{county.fips}/"
	image="{base}/og/county/{county.fips}.png"
/>

<article class="container profile">
	<nav class="crumbs"><a href="{base}/explore/">Explore</a> › <span>{county.name}</span></nav>

	<CountySwitcher {counties} activeFips={county.fips} />

	<ProfileHero kicker="County profile" name={county.name} {lead}
		stats={[{ label: 'Census tracts', value: county.tractCount }, { label: 'State', value: county.state }]}>
		{#snippet snapshot()}
			<CountyLocator {shapes} activeFips={county.fips} />
		{/snippet}
	</ProfileHero>

	<div class="actions no-print">
		<a class="btn btn-primary" href="{base}/explore/?geo=county">Open in the explorer →</a>
		<ShareButtons url="{base}/county/{county.fips}/" title="{county.name} profile — Carolinas Regional Explorer" />
	</div>

	<MetricCardGrid items={indicators} {categories} />

	<section class="methods">
		<h2>About this profile</h2>
		<p>
			Values are county averages of Census-tract estimates (unweighted average of the tracts). Each
			card links to the full indicator definition. See <a href="{base}/methods/">Methods</a> for
			details and limitations.
		</p>
	</section>

	<AttributionFooter />
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
