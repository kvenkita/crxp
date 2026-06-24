<script>
	import LisaLegend from './LisaLegend.svelte';
	let { indicators = [], lisaId = null, quadrants = [1, 2, 3, 4], onIndicator = () => {}, onToggle = () => {} } = $props();
</script>

<div class="lisa">
	<label class="f">
		<span>Indicator</span>
		<select value={lisaId} onchange={(e) => onIndicator(Number(e.target.value))}>
			{#each indicators as i (i.id)}<option value={i.id}>{i.label}</option>{/each}
		</select>
	</label>

	<div class="legend">
		<span class="cap">Cluster types</span>
		<LisaLegend active={quadrants} {onToggle} />
	</div>
	<p class="hint">
		Local Moran's I (LISA) finds statistically significant clusters of similar
		values and spatial outliers. Toggle cluster types to filter the map.
	</p>
</div>

<style>
	.lisa {
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
	.cap {
		font-size: var(--t-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--c-text-3);
		display: block;
		margin-bottom: var(--sp-1);
	}
	.hint {
		font-size: 0.7rem;
		color: var(--c-text-3);
		margin: 0;
	}
</style>
