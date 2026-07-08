<script>
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>About | Carolinas Regional Explorer</title>
	<meta name="description" content="About the Carolinas Regional Explorer, a community-data platform from the UNC Charlotte Urban Institute covering the 14-county region around Charlotte." />
</svelte:head>

<div class="container prose-page">
	<p class="eyebrow">About</p>
	<h1>About the Explorer</h1>

	<p class="lead">
		The Carolinas Regional Explorer is a community-data analytical platform developed by the UNC
		Charlotte Urban Institute. With roots in the Institute's longstanding collaboration with the City
		of Charlotte and Mecklenburg County on the Quality of Life Explorer, the Regional Explorer expands
		that footprint to the 14-county region surrounding Charlotte.
	</p>

	<h2>What you can explore</h2>
	<p>
		The platform carries dozens of indicators across themes: demographics, economy, education, housing,
		transportation, health, environment, and civic engagement, for every tract in the region. You can
		map any indicator, watch it change over time, compare neighborhoods and counties, and look at how two
		measures relate or where values cluster in space. Every indicator has a plain-language
		<a href="{base}/indicators/">"why it matters" page</a> with sources, and the full dataset is free to
		<a href="{base}/data/">download</a>.
	</p>

	<p>
		The application and its data pipeline are open source and use no proprietary GIS. We treat
		statistical uncertainty as a first-class concern: survey estimates carry their margins of error,
		low-reliability values are flagged, and model-based estimates (such as the CDC health measures) are
		shown as levels rather than trends where the source does not support comparison over time. How every
		number is produced, and its limits, is documented on the <a href="{base}/methods/">Methods</a>
		page.
	</p>

	<h2>Get involved</h2>
	<p>
		This Explorer is a project of the UNC Charlotte Urban Institute and partners, designed to grow as
		more counties, data, and community input come in. To contribute data or partner with us, visit the
		<a href="https://ui.charlotte.edu/" target="_blank" rel="noopener noreferrer">UNC Charlotte Urban Institute</a>.
	</p>
</div>

<style>
	.prose-page {
		max-width: 48rem;
		padding: var(--sp-6) var(--sp-5) var(--sp-8);
	}
	.lead {
		font-size: var(--t-lg);
		color: var(--c-text-2);
	}
	.prose-page h2 {
		margin-top: var(--sp-6);
	}
	.prose-page p {
		color: var(--c-text-2);
	}
</style>
