<script>
	import { formatValue } from '$lib/map/colorScale.js';
	/**
	 * A gradient strip showing where a value sits within the regional range,
	 * with optional reference markers (region average, selected value).
	 */
	let {
		value = null,
		regionAvg = null,
		min = 0,
		max = 100,
		colors = [],
		format = 'number',
		decimals = 1,
		label = ''
	} = $props();

	const span = $derived(max - min || 1);
	const pct = (v) => Math.max(0, Math.min(100, ((v - min) / span) * 100));
	const gradient = $derived(
		colors.length ? `linear-gradient(90deg, ${colors.join(', ')})` : 'var(--c-surface-2)'
	);
</script>

<div class="strip-wrap">
	{#if label}<div class="strip-label">{label}</div>{/if}
	<div class="strip" style="background:{gradient}">
		{#if regionAvg != null}
			<span class="marker region" style="left:{pct(regionAvg)}%" title="Region average"></span>
		{/if}
		{#if value != null}
			<span class="marker value" style="left:{pct(value)}%"></span>
		{/if}
	</div>
	<div class="ends">
		<span>{formatValue(min, format, decimals)}</span>
		{#if value != null}<strong>{formatValue(value, format, decimals)}</strong>{/if}
		<span>{formatValue(max, format, decimals)}</span>
	</div>
</div>

<style>
	.strip-wrap {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.strip-label {
		font-size: var(--t-xs);
		color: var(--c-text-3);
	}
	.strip {
		position: relative;
		height: 0.55rem;
		border-radius: var(--r-pill);
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
	}
	.marker {
		position: absolute;
		top: 50%;
		width: 2px;
		height: 1.1rem;
		transform: translate(-50%, -50%);
		border-radius: 2px;
	}
	.marker.region {
		background: var(--c-text-3);
		opacity: 0.7;
	}
	.marker.value {
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 50%;
		background: var(--c-surface);
		box-shadow: 0 0 0 2px var(--c-plum);
	}
	.ends {
		display: flex;
		justify-content: space-between;
		font-size: 0.68rem;
		color: var(--c-text-3);
	}
	.ends strong {
		color: var(--c-plum);
	}
</style>
