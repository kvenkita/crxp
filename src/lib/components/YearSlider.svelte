<script>
	let { years = [], value, onChange = () => {} } = $props();

	let idx = $derived(Math.max(0, years.indexOf(value)));

	function commit(e) {
		const i = Number(e.target.value);
		if (years[i] != null) onChange(years[i]);
	}
</script>

{#if years.length > 1}
	<div class="year-slider">
		<span class="yr-label">{years[0]}</span>
		<input
			type="range"
			min="0"
			max={years.length - 1}
			step="1"
			value={idx}
			oninput={commit}
			aria-label="Year"
			aria-valuetext={String(value)}
			list="year-ticks"
		/>
		<span class="yr-label">{years[years.length - 1]}</span>
		<output class="yr-current">{value}</output>
	</div>
{/if}

<style>
	.year-slider {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
	}
	input[type='range'] {
		flex: 1;
		accent-color: var(--c-teal);
		min-width: 8rem;
	}
	.yr-label {
		font-size: var(--t-xs);
		color: var(--c-text-3);
	}
	.yr-current {
		font-family: var(--font-display);
		font-weight: 600;
		color: var(--c-teal);
		min-width: 3ch;
		text-align: right;
	}
</style>
