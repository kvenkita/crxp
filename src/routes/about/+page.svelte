<script>
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>About — Carolinas Regional Explorer</title>
	<meta name="description" content="About the Carolinas Regional Explorer — an open, neighborhood-scale community-data platform for the 14-county, two-state Charlotte region." />
</svelte:head>

<div class="container prose-page">
	<p class="eyebrow">About</p>
	<h1>About the Explorer</h1>

	<p class="lead">
		The Carolinas Regional Explorer is an open, neighborhood-scale community-data platform for the
		14-county region around Charlotte. It lets residents, journalists, advocates, planners, and
		policymakers see how quality-of-life indicators vary from one neighborhood to the next — and how
		their own community compares.
	</p>

	<h2>A regional, two-state view</h2>
	<p>
		The Explorer builds on the Charlotte-Mecklenburg Quality of Life Explorer, a longstanding
		collaboration of the UNC Charlotte Urban Institute, the City of Charlotte, and Mecklenburg County
		that reports on 462 Neighborhood Profile Areas <em>within Mecklenburg</em>. This tool extends that
		idea across the whole region — 11 North Carolina counties and 3 in South Carolina — using U.S.
		Census tracts as a common neighborhood unit. The two-state frame is its distinct value: it can put a
		county in York or Lancaster, S.C. next to one in Mecklenburg or Gaston, N.C. on the same map.
	</p>

	<h2>What you can explore</h2>
	<p>
		The platform carries dozens of indicators across themes — demographics, economy, education, housing,
		transportation, health, environment, and civic engagement — for every tract in the region. You can
		map any indicator, watch it change over time, compare neighborhoods and counties, and look at how two
		measures relate or where values cluster in space. Every indicator has a plain-language
		<a href="{base}/indicators/">"why it matters" page</a> with sources, and the full dataset is free to
		<a href="{base}/data/">download</a>.
	</p>

	<h2>Built on open, honest data</h2>
	<p>
		The application and its data pipeline are open source and use no proprietary GIS. We treat
		statistical uncertainty as a first-class concern: survey estimates carry their margins of error,
		low-reliability values are flagged, and model-based estimates (such as the CDC health measures) are
		shown as levels rather than trends where the source does not support comparison over time. How every
		number is produced — and its limits — is documented on the <a href="{base}/methods/">Methods</a>
		page.
	</p>

	<h2>The question underneath the map</h2>
	<p>
		Many of these indicators connect to the region's defining civic question: economic mobility. A
		landmark study once ranked Charlotte last among the 50 largest U.S. metros for a poor child's odds of
		reaching the top — a finding that reshaped a decade of local policy, and one the region has since
		begun to improve on. Poverty, schooling, housing cost, transportation, segregation, and health all
		feed that story, and this tool is built to help a community see where opportunity is concentrated and
		where it is not.
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
