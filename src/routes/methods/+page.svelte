<svelte:head>
	<title>Methods — Carolinas Regional Explorer</title>
	<meta name="description" content="How the Carolinas Regional Explorer calculates and classifies its indicators." />
</svelte:head>

<div class="container prose-page">
	<p class="eyebrow">Methodology</p>
	<h1>Methods</h1>

	<h2>Geography</h2>
	<p>
		Indicators are reported for 2020 U.S. Census tracts across the 14-county Charlotte region
		(11 North Carolina counties: Anson, Cabarrus, Catawba, Cleveland, Gaston, Iredell, Lincoln,
		Mecklenburg, Rowan, Stanly, Union; and 3 South Carolina counties: York, Chester, Lancaster).
		County and city views aggregate tract-level estimates.
	</p>

	<h2>Data sources</h2>
	<p>
		Indicators in this release are drawn from the U.S. Census Bureau's American Community Survey
		(ACS) 5-Year Estimates. Future releases will add health, housing, environment, food access,
		broadband, and economic-mobility measures from partner sources.
	</p>

	<h2>Classification &amp; color</h2>
	<p>
		Choropleth maps use quantile class breaks computed per indicator and year, so each map shows
		roughly equal numbers of tracts in each color class. Color ramps are perceptually ordered; for
		indicators where higher values are less favorable, read darker shades as greater need.
	</p>

	<h2>Bivariate analysis</h2>
	<p>
		The bivariate map crosses two indicators on a 3×3 grid. Each indicator is split into thirds
		(low / middle / high) and the two classes combine into nine colors — darker cells mark tracts
		that are high on both measures.
	</p>

	<h2>Spatial clusters (LISA)</h2>
	<p>
		The spatial-cluster map uses Local Indicators of Spatial Association (Local Moran's I) with an
		8-nearest-neighbor spatial weights matrix and a conditional-permutation pseudo significance test
		(p ≤ 0.05). Significant tracts are labeled High–High (hot spots), Low–Low (cold spots), or
		High–Low / Low–High spatial outliers.
	</p>

	<h2>Data availability &amp; gaps</h2>
	<p>
		Each indicator carries its own available years; the year slider only offers years with data. One
		gap applies across all indicators in this release: <strong>2018 and 2019</strong> cover roughly
		480 tracts rather than ~750, because those ACS vintages predate the 2020 Census tract boundaries
		used here. The newer tracts have no value in those two years and appear as “no data.” This will be
		reconciled in the Phase 2 data pipeline.
	</p>

	<h2>Margins of error</h2>
	<p>
		ACS figures are survey estimates and carry margins of error that are larger for small
		populations. Interpret single-tract values and year-to-year changes with appropriate caution.
	</p>

	<h2>Current limitations</h2>
	<p>
		This is a Phase 1 release built on a sample data fixture. County boundaries are shown as
		simplified extents pending the Phase 2 data pipeline, which will publish dissolved county and
		municipal boundaries and a broader indicator set.
	</p>
</div>

<style>
	.prose-page {
		max-width: 48rem;
		padding: var(--sp-6) var(--sp-5) var(--sp-8);
	}
	.prose-page h2 {
		margin-top: var(--sp-6);
	}
	.prose-page p {
		color: var(--c-text-2);
	}
</style>
