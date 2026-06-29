<script>
	// A reusable "About this region" context block shown on every indicator page so each brief can
	// stay focused while every page inherits the regional spine (mobility, crescent/wedge, companions).
	import { base } from '$app/paths';
</script>

<details class="region-context">
	<summary>About the Charlotte region</summary>
	<div class="rc-body">
		<p>
			This explorer covers the <strong>14-county, two-state Charlotte region</strong> (11 North Carolina
			and 3 South Carolina counties). Many of these indicators connect to a defining regional story: a
			landmark Harvard study ranked Charlotte <strong>last, 50th of the 50 largest U.S. metros</strong>
			for economic mobility (a child raised in the poorest fifth had about a 4.4% chance of reaching the
			top fifth), a finding that launched the region's <em>Leading on Opportunity</em> agenda. Updated
			2024 data show Charlotte has since climbed to <strong>38th</strong>.
		</p>
		<p>
			Opportunity here is also unevenly mapped. An affluent <strong>“wedge”</strong> fanning southeast
			from uptown holds a large majority of the city's wealth on under a quarter of its land, while a
			<strong>”crescent”</strong> to the north, west, and east carries higher poverty, a legacy of
			redlining, exclusionary zoning, and highway routing that recurs across the race, income, health,
			tree-canopy, and school maps in this tool. No single indicator is good or bad on its own; together
			they describe how the region sorted opportunity.
		</p>
		<p class="rc-links">
			Companion resources:
			<a href="https://ui.charlotte.edu/our-work/quality-life-explorer/" target="_blank" rel="noopener noreferrer">Charlotte-Mecklenburg Quality of Life Explorer</a>
			· <a href="https://ui.charlotte.edu/" target="_blank" rel="noopener noreferrer">UNC Charlotte Urban Institute</a>
			· <a href="https://www.opportunityatlas.org/" target="_blank" rel="noopener noreferrer">Opportunity Atlas</a>
			· <a href="{base}/methods/">Methods &amp; sources</a>
		</p>
	</div>
</details>

<style>
	.region-context {
		margin-top: var(--sp-6);
		background: var(--c-surface-2);
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
		padding: var(--sp-3) var(--sp-4);
	}
	.region-context summary {
		cursor: pointer;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--t-sm);
		color: var(--c-text);
		list-style: none;
	}
	.region-context summary::-webkit-details-marker {
		display: none;
	}
	.region-context summary::before {
		content: '▸';
		display: inline-block;
		margin-right: 0.5rem;
		color: var(--c-text-3);
		transition: transform 0.15s ease;
	}
	.region-context[open] summary::before {
		transform: rotate(90deg);
	}
	.rc-body {
		margin-top: var(--sp-3);
	}
	.rc-body p {
		font-size: var(--t-sm);
		color: var(--c-text-2);
		line-height: 1.5;
		margin: 0 0 var(--sp-2);
	}
	.rc-links {
		font-size: var(--t-xs);
		color: var(--c-text-3);
	}
	.rc-links a {
		white-space: nowrap;
	}
</style>
