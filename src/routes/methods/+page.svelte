<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	// Section anchors for the floating contents menu (must match the h2 ids below, in order).
	const sections = [
		{ id: 'geography', label: 'Geography & combining areas' },
		{ id: 'sources', label: 'Data sources' },
		{ id: 'estimates', label: 'How estimates are produced' },
		{ id: 'moe', label: 'Margins of error & reliability' },
		{ id: 'time', label: 'Comparing over time' },
		{ id: 'harmonize', label: 'Harmonizing tract boundaries' },
		{ id: 'environment', label: 'Environment (satellite rasters)' },
		{ id: 'classification', label: 'Classification & color' },
		{ id: 'bivariate', label: 'Bivariate analysis' },
		{ id: 'lisa', label: 'Spatial clusters (LISA)' },
		{ id: 'neighborhoods', label: 'Neighborhood names' },
		{ id: 'open', label: 'Open & reproducible' },
		{ id: 'availability', label: 'Data availability' }
	];

	let open = $state(false);
	let activeId = $state(sections[0].id);
	let navEl;

	function go(id) {
		open = false;
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function onKey(e) {
		if (e.key === 'Escape') open = false;
	}
	function onDocClick(e) {
		if (open && navEl && !navEl.contains(e.target)) open = false;
	}

	onMount(() => {
		const headings = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
		// Scrollspy: mark the section currently in the upper-middle of the viewport.
		const io = new IntersectionObserver(
			(entries) => {
				for (const en of entries) if (en.isIntersecting) activeId = en.target.id;
			},
			{ rootMargin: '-20% 0px -70% 0px', threshold: 0 }
		);
		headings.forEach((h) => io.observe(h));
		document.addEventListener('keydown', onKey);
		document.addEventListener('click', onDocClick);
		return () => {
			io.disconnect();
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('click', onDocClick);
		};
	});
</script>

<svelte:head>
	<title>Methods — Carolinas Regional Explorer</title>
	<meta name="description" content="How the Carolinas Regional Explorer sources, computes, harmonizes, classifies, and analyzes its indicators — margins of error and reliability, comparability over time, boundary harmonization, spatial clusters, and neighborhood naming." />
</svelte:head>

<div class="container prose-page">
	<p class="eyebrow">Methodology</p>
	<h1>Methods</h1>
	<p class="lede">
		The Carolinas Regional Explorer is built from an open, reproducible data pipeline. Every indicator
		is computed to the Census-tract level, carries its source and vintage, and, where it comes from a
		survey, carries a margin of error. This page explains, in plain language, where the data comes from
		and how it is processed, classified, and analyzed. For the full technical treatment and citations,
		see the project's methodology guide and working paper.
	</p>

	<h2 id="geography">Geography &amp; how areas are combined</h2>
	<p>
		Indicators are reported for <strong>2020 U.S. Census tracts</strong>, neighborhood-scale areas of
		roughly 1,200–8,000 residents, across the 14-county Charlotte region (11 North Carolina counties:
		Anson, Cabarrus, Catawba, Cleveland, Gaston, Iredell, Lincoln, Mecklenburg, Rowan, Stanly, Union;
		and 3 South Carolina counties: York, Chester, Lancaster). The tract is the finest geography at which
		most public data can be reliably placed.
	</p>
	<p>
		<strong>County</strong> values (on county profiles and the county trend line) are the
		authoritative county-level estimate published by the source: the U.S. Census
		Bureau's ACS county tables (with their own, smaller county margin of error), the CDC PLACES county
		model, or county zonal statistics for satellite measures. They are <em>not</em> an average of the
		county's tracts: averaging tract rates is biased toward small tracts, and you cannot average tract
		medians or indices (e.g. a county's median income or Gini coefficient must come from the published
		county figure, not from averaging its tracts).
	</p>
	<p>
		The 14-county <strong>region</strong> has no single published estimate, so it is <strong>pooled</strong>
		correctly by measure type: counts are summed; rates use the pooled numerator ÷ pooled denominator; and
		medians and indices use a population-weighted average of the county values (a documented approximation,
		since an exact regional median would require microdata). Margins of error are carried through and shown
		as a band.
	</p>

	<h2 id="sources">Data sources</h2>
	<p>The current release has 65 indicators from four public sources, across eight of the
		ten themes (Safety and Arts &amp; Culture are still being populated):</p>
	<ul>
		<li>
			<strong>U.S. Census Bureau — American Community Survey (ACS) 5-Year Estimates</strong> (annual,
			latest 2024): demographics, economy, education, housing, transportation, health insurance,
			disability, residential stability, and more, published at the tract level with margins of error.
		</li>
		<li>
			<strong>CDC PLACES</strong>: 16 adult-health measures as <em>model-based</em> small-area estimates
			with confidence intervals: chronic conditions (obesity, diabetes, high blood pressure, asthma,
			depression), behaviors (smoking, inactivity), access (uninsured, routine checkup), and
			health-related social needs (food and housing insecurity, transportation barriers, social support,
			loneliness).
		</li>
		<li>
			<strong>USGS National Land Cover Database (NLCD)</strong>: environment measures: forest,
			cropland/farmland, wetlands, developed land, impervious surface (annual land cover from 2001
			onward), and continuous tree-canopy cover.
		</li>
		<li>
			<strong>EOG VIIRS Nighttime Lights</strong>: light pollution (mean night-light radiance).
		</li>
	</ul>
	<p>
		Each source is tracked with its update cadence and a sustainability rating, and each indicator shows
		its source and vintage so you always know how current a number is. A few legacy indicators are kept
		at their last available year where a source has been discontinued, and labeled accordingly. Every
		indicator can be downloaded as CSV or JSON, and the whole dataset as a single archive, from the
		<a href="{base}/data/">Data</a> page.
	</p>

	<h2 id="estimates">How estimates are produced</h2>
	<p>
		Most indicators are <strong>direct estimates</strong> the ACS publishes for each tract. Health
		measures from CDC PLACES are <strong>model-based</strong>: they combine survey responses with
		population data to estimate a rate for every tract, and are flagged <em>model-based</em> in the app
		because that uncertainty is different in kind from a survey margin of error. Satellite measures
		(land cover, tree canopy, night lights) are wall-to-wall measurements, not surveys.
	</p>

	<h2 id="moe">Margins of error &amp; reliability</h2>
	<p>
		ACS figures are survey estimates, each with a 90% <strong>margin of error (MOE)</strong> that is
		larger for small populations. Derived rates propagate the MOE using the Census Bureau's formulas
		(when estimates are combined, their uncertainties add through squares and square roots, not simple
		addition). From the MOE we compute a <strong>coefficient of variation (CV)</strong>, the typical
		sampling error as a percentage of the estimate, and flag each value's reliability:
	</p>
	<p class="rel-key">
		<span class="rel rel-ok">ok</span> CV ≤ 15% &nbsp;·&nbsp;
		<span class="rel rel-caution">caution</span> 15–30% &nbsp;·&nbsp;
		<span class="rel rel-unreliable">unreliable</span> CV &gt; 30%
	</p>
	<p>
		When you select a tract, its trend shows the estimate with a shaded <strong>± MOE band</strong>, the
		reliability badge, and, for the survey-based ACS indicators, a significance-tested change (below).
		On the map, unreliable tracts can be
		drawn with a diagonal <strong>hatch</strong> (toggle under <em>Map settings → Flag unreliable
		areas</em>). Satellite-derived measures carry no sampling MOE (they have classification accuracy
		instead), so no band is shown for them.
	</p>
	<figure>
		<img src="{base}/img/methods/uncertainty.png" alt="A tract's trend chart with a shaded ±90% margin-of-error band, a reliability badge, and 5- and 10-year change markers." loading="lazy" />
		<figcaption>
			Uncertainty at the point of use: a selected tract's trend with its ±90% MOE band, an
			ok/caution/unreliable badge, and significance-tested 5- and 10-year change.
		</figcaption>
	</figure>

	<h2 id="time">Comparing over time</h2>
	<p>
		ACS 5-year estimates <strong>overlap</strong> from one year to the next (adjacent vintages share
		four years of sample), so the annual series (2014–2024) is best read as a rolling
		estimate. Valid change comparisons therefore use only non-overlapping periods. For a
		selected tract the explorer reports two changes — the <strong>5-year</strong> (e.g. 2019→2024) and the
		<strong>10-year</strong> (e.g. 2014→2024) — each tested for <strong>statistical significance</strong>
		at 90% confidence with the Census difference test, which guards against reading sampling noise as real
		change. These periods advance automatically as new years are released.
	</p>
	<p>
		CDC PLACES health measures are different. Each annual PLACES release is a separate
		model fit, so the multi-year series shown here is stitched across releases rather than
		one consistent time series. CDC states the estimates <strong>do not support tracking change over
		time</strong>: sub-county models hold the population distribution fixed, time is not a model variable
		even at county level, and apparent movement can reflect questionnaire changes or the pandemic-affected
		2020 survey. The app therefore shows each year's estimate with its model uncertainty band but reports
		no change figure at all for these measures: no significance-tested change markers, no
		change column in reports, no county-card delta. Read them as levels in each year, not
		as a trend.
	</p>

	<h2 id="harmonize">Harmonizing tract boundaries</h2>
	<p>
		Census tract boundaries are redrawn each decade: ACS years through 2019 use 2010 tracts, and 2020
		onward use 2020 tracts. Comparing an older value to a newer one therefore means comparing two
		different maps. To put the whole series on one 2020 geography, pre-2020 years are
		<strong>harmonized</strong>. We split each old tract's value across the new tracts that absorbed it,
		weighting by population (using 2020 Census block populations) rather than by land
		area — because people are not spread evenly within a tract, and a small, dense piece can hold far more
		residents than its area suggests. Counts are summed, margins of error are propagated, and the
		factors for each old tract add to one.
	</p>
	<figure class="narrow">
		<img src="{base}/img/methods/harmonize.png" alt="Diagram: a changed 2010 tract split across two 2020 tracts with allocation factors 0.6 and 0.4." loading="lazy" />
		<figcaption>
			A changed 2010 tract's value is split across the 2020 tracts that absorbed its population
			(the factors sum to 1). Harmonized pre-2020 years are flagged in the app.
		</figcaption>
	</figure>

	<h2 id="environment">Environment measures (satellite rasters)</h2>
	<p>
		Environment indicators are computed from 30-meter satellite rasters using <strong>area-weighted
		zonal statistics</strong>: the exact fraction of each pixel inside a tract is used, not just whether
		the pixel's center falls inside. Land-cover shares (forest, farmland, wetlands, developed) are the
		share of a tract's land in the relevant classes; impervious surface, tree canopy, and night-light
		radiance are area-weighted averages.
	</p>

	<h2 id="classification">Classification &amp; color</h2>
	<p>
		Choropleth maps use quantile class breaks held consistent across years for each
		indicator, so a given color always means the same value range, which is what makes year-to-year
		change on the map legible rather than misleading. Color ramps are perceptually ordered; for
		indicators where higher values signal greater need, read darker shades as more need.
	</p>

	<h2 id="bivariate">Bivariate analysis</h2>
	<p>
		The bivariate map crosses two indicators on a 3×3 grid: each is split into thirds (low / middle /
		high) and the two combine into nine colors, so darker cells mark tracts that are high on both. A
		companion <strong>correlation scatter</strong> plots the two indicators' standardized (z-score)
		values — one dot per tract, colored by its grid class — with the distribution of each variable along
		the axes, a trend line, and both the Pearson and Spearman correlations. These are
		<strong>descriptive only</strong>: because nearby tracts tend to be similar, an ordinary significance
		test would overstate confidence, so we report the relationship without a p-value. Hovering a dot or a
		tract links the two and names the neighborhood.
	</p>
	<figure>
		<img src="{base}/img/methods/bivariate.png" alt="A 3×3 bivariate choropleth of poverty and education with a companion correlation scatter." loading="lazy" />
		<figcaption>
			Bivariate view: a 3×3 tercile map (here, poverty rate × bachelor's-degree attainment) with the
			companion correlation scatter (Pearson and Spearman, shown as descriptive).
		</figcaption>
	</figure>

	<h2 id="lisa">Spatial clusters (LISA)</h2>
	<p>
		The spatial-cluster map uses Local Indicators of Spatial Association (Local Moran's I) with an
		8-nearest-neighbor spatial weights matrix and a conditional-permutation significance test: each
		tract is held fixed while its hypothetical neighbors are drawn <em>without replacement</em> from the
		other tracts (999 times). Because every tract is tested at once, significance is then
		<strong>FDR-controlled</strong> (Benjamini–Hochberg) so chance alone doesn't light up dozens of
		tracts. Significant tracts are labeled High–High (hot spots), Low–Low (cold spots), or High–Low /
		Low–High spatial outliers.
	</p>
	<figure>
		<img src="{base}/img/methods/lisa.png" alt="A map of significant High-High and Low-Low clusters and spatial outliers." loading="lazy" />
		<figcaption>Spatial clusters (LISA): hot spots, cold spots, and spatial outliers, after FDR correction.</figcaption>
	</figure>

	<h2 id="neighborhoods">Neighborhood names</h2>
	<p>
		To help residents orient themselves, each tract is labeled with one or more nearby
		<strong>named neighborhoods</strong>. Names and locations come from
		<a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>,
		which records them as points. We approximate each neighborhood's extent with a <strong>Voronoi area</strong>
		(every location belongs to its nearest named point), measure how much of each tract falls in each
		neighborhood's area, and label the tract with the neighborhood(s) covering the largest share, up to
		three. A tract with no nearby named neighborhood (none within about 8 km) falls back to its city or
		county. These labels are approximate and for orientation only: neighborhood
		boundaries are informal and contested, and OpenStreetMap coverage varies. Neighborhood names ©
		<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> (ODbL).
	</p>

	<h2 id="open">Open &amp; reproducible</h2>
	<p>
		The application and the data pipeline are open source, use no proprietary GIS, and pin their software
		versions; each data build records the exact library versions that produced it. The data is published
		as a versioned, validated contract, and another region can stand up its own explorer largely by
		changing configuration. We document these choices, and their limitations, precisely so they can be
		scrutinized and improved.
	</p>

	<h2 id="availability">Data availability</h2>
	<p>
		Each indicator carries its own available years and cadence; the year slider only offers years with
		data. Cadence varies by source — ACS is annual (rolling), CDC PLACES and the satellite layers update
		on their own schedules — and indicators update as new source data is released.
	</p>

	<p class="see-also">
		See also the full <a href="{base}/indicators/">indicator list</a> and
		<a href="{base}/about/">About the Explorer</a>.
	</p>
</div>

<nav class="toc no-print" class:open bind:this={navEl} aria-label="Sections on this page">
	{#if open}
		<ul id="toc-list" class="toc-list">
			{#each sections as s (s.id)}
				<li>
					<a
						href="#{s.id}"
						class:active={activeId === s.id}
						aria-current={activeId === s.id ? 'true' : undefined}
						onclick={(e) => {
							e.preventDefault();
							go(s.id);
						}}>{s.label}</a
					>
				</li>
			{/each}
		</ul>
	{/if}
	<button
		class="toc-toggle"
		type="button"
		onclick={() => (open = !open)}
		aria-expanded={open}
		aria-controls="toc-list"
	>
		<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
			<path
				d="M2 3.5h12M2 8h12M2 12.5h12"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
			/>
		</svg>
		<span>Contents</span>
	</button>
</nav>

<style>
	.prose-page {
		max-width: 48rem;
		padding: var(--sp-6) var(--sp-5) var(--sp-8);
	}
	/* keep anchored sections clear of the sticky site header when jumped to */
	.prose-page :global(h2) {
		scroll-margin-top: calc(var(--header-h) + 1rem);
	}
	.lede {
		font-size: var(--t-lg);
		color: var(--c-text-2);
	}
	.see-also {
		margin-top: var(--sp-7);
		border-top: 1px solid var(--c-border);
		padding-top: var(--sp-4);
		font-size: var(--t-sm);
		color: var(--c-text-3);
	}
	.prose-page h2 {
		margin-top: var(--sp-7);
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
	figure {
		margin: var(--sp-5) 0;
	}
	figure.narrow img {
		max-width: 26rem;
	}
	figure img {
		display: block;
		width: 100%;
		height: auto;
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08));
	}
	figcaption {
		margin-top: var(--sp-2);
		font-size: var(--t-sm);
		color: var(--c-text-3);
		line-height: 1.4;
	}
	.rel-key {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-1);
	}
	.rel {
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		padding: 1px 6px;
		border-radius: 3px;
	}
	.rel-ok {
		background: #e8f3ef;
		color: var(--c-accent-strong, #1f6f63);
	}
	.rel-caution {
		background: #fdecc8;
		color: #8a5a00;
	}
	.rel-unreliable {
		background: #f7d4d4;
		color: #9a1f1f;
	}

	/* ---- floating contents menu ---- */
	.toc {
		position: fixed;
		right: var(--sp-4);
		bottom: var(--sp-4);
		z-index: 45;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--sp-2);
		max-width: calc(100vw - 2 * var(--sp-4));
	}
	.toc-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		background: var(--c-accent-strong);
		color: #fff;
		border: none;
		border-radius: var(--r-pill);
		padding: 0.55rem 0.95rem;
		font-family: var(--font-display);
		font-size: var(--t-sm);
		font-weight: 600;
		box-shadow: var(--shadow-md);
		cursor: pointer;
	}
	.toc-toggle:hover {
		filter: brightness(1.08);
	}
	.toc-toggle:focus-visible {
		outline: 2px solid var(--c-accent-strong);
		outline-offset: 2px;
	}
	.toc-list {
		list-style: none;
		margin: 0;
		padding: var(--sp-2);
		width: 17rem;
		max-width: calc(100vw - 2 * var(--sp-4));
		max-height: min(62vh, 30rem);
		overflow-y: auto;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.toc-list a {
		display: block;
		padding: 0.4rem 0.6rem;
		border-radius: 6px;
		font-size: var(--t-sm);
		line-height: 1.3;
		color: var(--c-text-2);
		text-decoration: none;
	}
	.toc-list a:hover {
		background: var(--c-surface-2);
	}
	.toc-list a.active {
		background: var(--c-surface-2);
		color: var(--c-accent-strong);
		font-weight: 600;
	}
	@media print {
		.toc {
			display: none;
		}
	}
</style>
