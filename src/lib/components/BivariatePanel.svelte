<script>
	import BivariateLegend from './BivariateLegend.svelte';
	let {
		indicators = [],
		biA = null,
		biB = null,
		activeCell = null,
		onChangeA = () => {},
		onChangeB = () => {},
		onCellHover = () => {}
	} = $props();

	let labelA = $derived(indicators.find((i) => i.id === biA)?.label ?? 'Variable A');
	let labelB = $derived(indicators.find((i) => i.id === biB)?.label ?? 'Variable B');

	function setA(e) {
		onChangeA(Number(e.target.value));
	}
	function setB(e) {
		onChangeB(Number(e.target.value));
	}
</script>

<div class="bivariate">
	<label class="f">
		<span>First indicator (vertical)</span>
		<select value={biA} onchange={setA}>
			{#each indicators as i (i.id)}<option value={i.id}>{i.label}</option>{/each}
		</select>
	</label>
	<label class="f">
		<span>Second indicator (horizontal)</span>
		<select value={biB} onchange={setB}>
			{#each indicators as i (i.id)}<option value={i.id}>{i.label}</option>{/each}
		</select>
	</label>

	<div class="legend-row">
		<BivariateLegend {labelA} {labelB} active={activeCell} {onCellHover} />
	</div>
	<p class="hint">Darker = high on both. Each axis is split into thirds (low / middle / high). Hover a color block to highlight matching tracts.</p>
</div>

<style>
	.bivariate {
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
	}
	.f {
		display: flex;
		flex-direction: column;
		gap: 3px;
		font-size: var(--t-xs);
		color: var(--c-text-3);
	}
	select {
		padding: var(--sp-2) var(--sp-3);
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		font: inherit;
		background: var(--c-surface);
		color: var(--c-text);
	}
	.legend-row {
		display: flex;
		justify-content: center;
		padding: var(--sp-2) 0;
	}
	.hint {
		font-size: 0.7rem;
		color: var(--c-text-3);
		margin: 0;
	}
</style>
