<svelte:head>
	<title>About — Carolinas Regional Explorer</title>
	<meta name="description" content="About the Carolinas Regional Explorer — an extensible community-data platform for the Charlotte region." />
</svelte:head>

<div class="container prose-page">
	<p class="eyebrow">About</p>
	<h1>About the Explorer</h1>

	<p class="lead">
		The Carolinas Regional Explorer is an extensible community-data platform that lets residents,
		researchers, planners, and policymakers explore quality-of-life indicators across neighborhoods,
		cities, and counties in the 14-county region surrounding Charlotte.
	</p>

	<h2>Modeled on the Quality of Life Explorer</h2>
	<p>
		The Explorer builds on the Charlotte–Mecklenburg Quality of Life Explorer, a collaboration of the
		UNC Charlotte Urban Institute, the City of Charlotte, and Mecklenburg County. Where that tool uses
		Neighborhood Profile Areas, the regional Explorer uses U.S. Census tracts so it can extend across
		the whole region.
	</p>

	<h2>Built to grow</h2>
	<p>
		The platform is designed to expand as more counties and partners contribute data and engagement.
		Future releases will broaden the indicator set and, with community input, may introduce
		locally-defined neighborhood areas.
	</p>

	<h2>Get involved</h2>
	<p>
		This Explorer is a project of the UNC Charlotte Urban Institute and partners. To contribute data
		or partner with us, visit the <a href="https://ui.charlotte.edu/" target="_blank" rel="noopener noreferrer">UNC Charlotte Urban Institute</a>.
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
