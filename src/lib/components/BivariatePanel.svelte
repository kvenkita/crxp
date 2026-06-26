<script>
	import BivariateLegend from './BivariateLegend.svelte';
	import IndicatorSelect from './IndicatorSelect.svelte';
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
</script>

<div class="bivariate">
	<label class="f">
		<span>First indicator (vertical)</span>
		<IndicatorSelect {indicators} value={biA} onChange={onChangeA} ariaLabel="First indicator" />
	</label>
	<label class="f">
		<span>Second indicator (horizontal)</span>
		<IndicatorSelect {indicators} value={biB} onChange={onChangeB} ariaLabel="Second indicator" />
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
