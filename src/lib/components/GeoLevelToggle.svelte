<script>
	let { value = 'tract', onChange = () => {} } = $props();
	const levels = [
		{ key: 'tract', label: 'Tracts' },
		{ key: 'county', label: 'Counties' }
	];
</script>

<div class="seg" role="group" aria-label="Geographic level">
	{#each levels as l (l.key)}
		<button
			class="seg-btn"
			class:active={value === l.key}
			aria-pressed={value === l.key}
			onclick={() => onChange(l.key)}
		>
			{l.label}
		</button>
	{/each}
</div>

<style>
	.seg {
		display: inline-flex;
		background: var(--c-surface-2);
		border: 1px solid var(--c-border);
		border-radius: var(--r-pill);
		padding: 2px;
	}
	.seg-btn {
		border: 0;
		background: transparent;
		color: var(--c-text-2);
		padding: var(--sp-1) var(--sp-3);
		border-radius: var(--r-pill);
		font-size: var(--t-sm);
		font-weight: 500;
	}
	.seg-btn.active {
		background: var(--c-surface);
		color: var(--c-teal);
		box-shadow: var(--shadow-sm);
	}
</style>
