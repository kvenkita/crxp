<script>
	import DumbbellChart from './DumbbellChart.svelte';
	import { formatValue } from '$lib/map/colorScale.js';

	let { rows = [], indicator = null, domain = { min: 0, max: 100 }, onUnpin = () => {} } = $props();
</script>

<div class="compare card">
	<div class="cmp-head">
		<h3>Compare <span class="count">{rows.length}</span></h3>
	</div>
	{#if rows.length === 0}
		<p class="empty">Pin tracts, cities, or counties (★) to compare them here.</p>
	{:else}
		<ul class="rows">
			{#each rows as r (r.geoid)}
				<li class="row">
					<div class="row-top">
						<span class="r-name" title={r.name}>{r.name}</span>
						<span class="r-val">{formatValue(r.current, indicator?.format ?? 'number', indicator?.decimals ?? 1)}</span>
						<button class="x" title="Remove" onclick={() => onUnpin(r.geoid)}>✕</button>
					</div>
					<DumbbellChart
						values={r.values}
						min={domain.min}
						max={domain.max}
						format={indicator?.format ?? 'number'}
						decimals={indicator?.decimals ?? 1}
					/>
				</li>
			{/each}
		</ul>
		{#if rows.length > 1}
			<p class="hint">Dot = latest year · line shows change over time</p>
		{/if}
	{/if}
</div>

<style>
	.compare {
		padding: var(--sp-3) var(--sp-4);
	}
	.cmp-head h3 {
		font-size: var(--t-base);
		margin: 0 0 var(--sp-2);
	}
	.count {
		font-size: var(--t-xs);
		background: var(--c-surface-2);
		border-radius: var(--r-pill);
		padding: 0 var(--sp-2);
		color: var(--c-text-3);
	}
	.empty {
		font-size: var(--t-sm);
		color: var(--c-text-3);
		margin: 0;
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
	}
	.row-top {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		margin-bottom: 3px;
	}
	.r-name {
		font-size: var(--t-sm);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.r-val {
		margin-left: auto;
		font-weight: 600;
		font-size: var(--t-sm);
		color: var(--c-plum);
	}
	.x {
		border: 0;
		background: transparent;
		color: var(--c-text-3);
		font-size: var(--t-xs);
	}
	.hint {
		margin: var(--sp-2) 0 0;
		font-size: 0.68rem;
		color: var(--c-text-3);
	}
</style>
