<svelte:head>
	<title>Methods — Carolinas Regional Explorer</title>
	<meta name="description" content="How the Carolinas Regional Explorer sources, computes, harmonizes, and classifies its indicators — including margins of error, comparability over time, and spatial analysis." />
</svelte:head>

<div class="container prose-page">
	<p class="eyebrow">Methodology</p>
	<h1>Methods</h1>
	<p>
		The Carolinas Regional Explorer is built from an open, reproducible data pipeline. Every indicator
		is computed to the Census-tract level, carries its source and vintage, and — where it comes from a
		survey — carries a margin of error. This page explains where the data comes from and how it is
		processed, classified, and analyzed.
	</p>

	<h2>Geography</h2>
	<p>
		Indicators are reported for <strong>2020 U.S. Census tracts</strong> across the 14-county Charlotte
		region (11 North Carolina counties: Anson, Cabarrus, Catawba, Cleveland, Gaston, Iredell, Lincoln,
		Mecklenburg, Rowan, Stanly, Union; and 3 South Carolina counties: York, Chester, Lancaster).
		County and region trend lines are the <strong>unweighted average of the tracts</strong> involved
		(labeled "avg of tracts") — a simple, transparent summary, not a population-weighted rate, so
		small and large tracts count equally; their margins of error are propagated and shown as a band.
		Indicators drawn from a statistical model rather than a direct count (e.g. CDC PLACES health
		measures) are flagged <em>model-based</em>, and pre-2020 years reallocated to 2020 tract boundaries
		are flagged <em>harmonized</em>.
	</p>

	<h2>Data sources</h2>
	<p>The current release draws on four public sources, spanning seven themes:</p>
	<ul>
		<li>
			<strong>U.S. Census Bureau — American Community Survey (ACS) 5-Year Estimates</strong> (latest
			2024): demographics, economy, education, housing, transportation, health insurance, disability,
			and more. Published at the tract level with margins of error.
		</li>
		<li>
			<strong>CDC PLACES</strong> (2023): adult health measures (e.g. obesity, diabetes, frequent
			mental distress, uninsured) as model-based small-area estimates with confidence intervals.
		</li>
		<li>
			<strong>USGS National Land Cover Database (NLCD)</strong>: environment measures — forest,
			cropland/farmland, wetlands, developed land, impervious surface (land-cover epochs 2001–2021),
			and continuous tree-canopy cover (annual 2015–2023).
		</li>
		<li>
			<strong>EOG VIIRS Nighttime Lights</strong>: light pollution (mean night-light radiance),
			2014–2024.
		</li>
	</ul>
	<p>
		Each indicator lists its source and vintage. A few legacy indicators are kept at their last
		available year where a source has been discontinued and labeled accordingly.
	</p>

	<h2>Margins of error &amp; reliability</h2>
	<p>
		ACS figures are survey estimates, each with a 90% margin of error (MOE) that is larger for small
		populations. Derived rates propagate MOE using the Census Bureau's formulas. When you select a
		tract, the trend chart shows the estimate with a shaded <strong>± MOE band</strong> and a
		reliability flag derived from the coefficient of variation (CV = standard error ÷ estimate):
		<em>caution</em> when CV exceeds 15%, <em>unreliable</em> above 30%. On the map, tracts whose
		estimate is <strong>unreliable</strong> are drawn with a diagonal <strong>hatch</strong> (off by
		default; toggle under <em>Map settings → Flag unreliable areas</em>). Satellite-derived measures (land cover,
		tree canopy, night lights) are measurements rather than surveys, so they carry no sampling MOE.
	</p>

	<h2>Comparing over time</h2>
	<p>
		ACS 5-year estimates <strong>overlap</strong> from one year to the next (adjacent vintages share
		four years of sample), so the annual series (2014–2024) is best read as a <strong>rolling</strong>
		estimate. Valid change and significance comparisons use only <strong>non-overlapping</strong>
		periods. For a selected tract the explorer reports two changes — the <strong>5-year</strong>
		(e.g. 2019→2024) and the <strong>10-year</strong> (e.g. 2014→2024) — each tested for
		<strong>statistical significance</strong> at 90% confidence using the Census difference test.
		These periods advance automatically as new years are released.
	</p>

	<h2>Harmonizing tract boundaries</h2>
	<p>
		Census tract boundaries changed between the 2010 and 2020 censuses. ACS years through 2019 use 2010
		tracts; 2020 onward use 2020 tracts. To make the time series comparable on a single 2020 geography,
		pre-2020 years are <strong>harmonized</strong> using an area-weighted crosswalk (counts are
		allocated by the share of land area each old tract contributes to each new tract; margins of error
		are propagated accordingly). This replaces the earlier limitation where 2014–2019 covered only part
		of the region.
	</p>

	<h2>Environment measures (satellite rasters)</h2>
	<p>
		Environment indicators are computed from 30-meter satellite rasters using <strong>area-weighted
		zonal statistics</strong> — the exact fraction of each pixel inside a tract is used. Land-cover
		shares (forest, farmland, wetlands, developed) are the share of a tract's area in the relevant
		classes; impervious surface, tree canopy, and night-light radiance are area-weighted averages.
	</p>

	<h2>Classification &amp; color</h2>
	<p>
		Choropleth maps use quantile class breaks held <strong>consistent across years</strong> for each
		indicator, so a given color always means the same value range — making year-to-year change legible.
		Color ramps are perceptually ordered; for indicators where higher values are less favorable, read
		darker shades as greater need.
	</p>

	<h2>Bivariate analysis</h2>
	<p>
		The bivariate map crosses two indicators on a 3×3 grid. Each indicator is split into thirds
		(low / middle / high) and the two classes combine into nine colors — darker cells mark tracts that
		are high on both measures. Hovering a legend cell highlights the matching tracts. A companion
		<strong>correlation scatter</strong> plots the two indicators' standardized (z-score) values — one
		dot per tract, colored by its grid class — with the distribution of each variable along the axes, a
		trend line, and the correlation coefficient. Hovering a dot or a tract links the two and names the
		neighborhood.
	</p>

	<h2>Spatial clusters (LISA)</h2>
	<p>
		The spatial-cluster map uses Local Indicators of Spatial Association (Local Moran's I) with an
		8-nearest-neighbor spatial weights matrix and a conditional-permutation pseudo significance test.
		The permutation holds each tract fixed and draws its hypothetical neighbors <em>without
		replacement</em> from the other tracts (999 permutations), and significance is then
		<strong>FDR-controlled</strong> (Benjamini–Hochberg) so that testing every tract at once does not
		inflate the number of false clusters. Significant tracts are labeled High–High (hot spots),
		Low–Low (cold spots), or High–Low / Low–High spatial outliers.
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

	<h2>Data availability</h2>
	<p>
		Each indicator carries its own available years and cadence; the year slider only offers years with
		data. Cadence varies by source — ACS is annual (rolling), CDC PLACES and NLCD update on multi-year
		cycles, and tree canopy and night lights are annual. Indicators update as new source data is
		released.
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
	.prose-page p,
	.prose-page li {
		color: var(--c-text-2);
	}
	.prose-page ul {
		color: var(--c-text-2);
		padding-left: var(--sp-5);
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
	}
</style>
