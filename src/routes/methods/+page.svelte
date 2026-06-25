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

	<h2>Neighborhood names</h2>
	<p>
		To help residents orient themselves, each tract is labeled with one or more nearby
		<strong>named neighborhoods</strong>. Neighborhood names and locations come from
		<a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>,
		which records them as points. We approximate each neighborhood's extent with a Voronoi area
		(every location is assigned to its nearest neighborhood) and label each tract with the
		neighborhood(s) covering the largest share of its area. Tracts with no nearby named neighborhood
		fall back to their city or county. These labels are <strong>approximate and for orientation only</strong>;
		neighborhood boundaries are informal and contested. Neighborhood names ©
		<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> (ODbL).
	</p>

	<h2>Margins of error &amp; reliability</h2>
	<p>
		ACS figures are survey estimates, each with a 90% margin of error (MOE) that is larger for
		small populations. When you select a tract, the trend chart shows the estimate with a shaded
		<strong>± MOE band</strong> and a reliability flag derived from the coefficient of variation
		(CV = standard error ÷ estimate): <em>caution</em> when CV exceeds 15%, <em>unreliable</em>
		above 30%. Treat unreliable single-tract values, and small year-to-year differences, with care.
	</p>
	<p>
		ACS 5-year estimates <strong>overlap</strong> from one year to the next (adjacent vintages share
		four years of sample), so the annual series is best read as a <strong>rolling</strong> estimate.
		Valid change and statistical-significance comparisons use only <strong>non-overlapping</strong>
		periods (e.g. 2014 vs. 2019 vs. 2024).
	</p>

	<h2>Data sources</h2>
	<p>
		Indicators are produced by an open, reproducible pipeline. Demographic, social, economic, housing,
		and transportation measures come directly from the U.S. Census Bureau's American Community Survey
		5-Year Estimates (latest: 2024), with margins of error. Health measures are model-based small-area
		estimates from the CDC PLACES project. Each indicator lists its source and vintage; a few legacy
		indicators are labeled with their last available year where a source has been discontinued.
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
