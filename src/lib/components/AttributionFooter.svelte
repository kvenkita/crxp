<script>
	/**
	 * Standard attribution footer for shareable / printable artifacts (county profiles, reports).
	 * Prints with the page. Year defaults to the current year (build-time for prerendered pages).
	 */
	let { year = new Date().getFullYear() } = $props();
</script>

<footer class="crxp-attribution">
	<strong>Carolinas Regional Explorer</strong> · UNC Charlotte Urban Institute · {year}
</footer>

<style>
	.crxp-attribution {
		margin-top: var(--sp-6);
		padding-top: var(--sp-3);
		border-top: 1px solid var(--c-border);
		text-align: center;
		font-size: var(--t-xs);
		color: var(--c-text-3);
	}
	.crxp-attribution strong {
		color: var(--c-text-2);
		font-weight: 600;
	}
	@media print {
		.crxp-attribution {
			margin-top: var(--sp-4);
			color: #000;
		}
	}
</style>
