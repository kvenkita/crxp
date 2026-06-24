<script>
	let { mode = 'explore', onChange = () => {} } = $props();
	const modes = [
		{ key: 'explore', label: 'Explore', desc: 'Single indicator' },
		{ key: 'bivariate', label: 'Bivariate', desc: 'Two indicators' },
		{ key: 'lisa', label: 'Spatial clusters', desc: 'Hot & cold spots' }
	];
</script>

<div class="modebar" role="tablist" aria-label="Analysis mode">
	{#each modes as m (m.key)}
		<button
			role="tab"
			aria-selected={mode === m.key}
			class="mode"
			class:active={mode === m.key}
			onclick={() => onChange(m.key)}
		>
			<span class="m-label">{m.label}</span>
			<span class="m-desc">{m.desc}</span>
		</button>
	{/each}
</div>

<style>
	.modebar {
		display: flex;
		gap: var(--sp-1);
		background: var(--c-surface-2);
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
		padding: 3px;
	}
	.mode {
		flex: 1;
		border: 0;
		background: transparent;
		border-radius: var(--r-sm);
		padding: var(--sp-2) var(--sp-2);
		display: flex;
		flex-direction: column;
		gap: 1px;
		line-height: 1.15;
	}
	.mode.active {
		background: var(--c-surface);
		box-shadow: var(--shadow-sm);
	}
	.m-label {
		font-size: var(--t-sm);
		font-weight: 600;
		color: var(--c-text);
	}
	.mode.active .m-label {
		color: var(--c-teal);
	}
	.m-desc {
		font-size: 0.66rem;
		color: var(--c-text-3);
	}
</style>
