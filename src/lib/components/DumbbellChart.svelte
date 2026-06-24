<script>
	import { formatValue } from '$lib/map/colorScale.js';
	/** Shows first→last change of a value within the regional [min,max] domain. */
	let { values = [], min = 0, max = 100, color = 'var(--c-plum)', format = 'number', decimals = 1 } = $props();

	let finite = $derived(values.map((v, i) => ({ v, i })).filter((p) => p.v != null && Number.isFinite(p.v)));
	let first = $derived(finite[0]?.v ?? null);
	let last = $derived(finite.at(-1)?.v ?? null);
	const span = $derived(max - min || 1);
	const pct = (v) => Math.max(0, Math.min(100, ((v - min) / span) * 100));
</script>

<div class="dumbbell" title="{formatValue(first, format, decimals)} → {formatValue(last, format, decimals)}">
	<div class="track">
		{#if first != null && last != null}
			<span class="bar" style="left:{Math.min(pct(first), pct(last))}%; width:{Math.abs(pct(last) - pct(first))}%; background:{color}"></span>
			<span class="dot start" style="left:{pct(first)}%"></span>
			<span class="dot end" style="left:{pct(last)}%; background:{color}"></span>
		{/if}
	</div>
</div>

<style>
	.dumbbell {
		width: 100%;
	}
	.track {
		position: relative;
		height: 0.8rem;
		background: var(--c-surface-2);
		border-radius: var(--r-pill);
	}
	.bar {
		position: absolute;
		top: 50%;
		height: 3px;
		transform: translateY(-50%);
		opacity: 0.5;
		border-radius: 2px;
	}
	.dot {
		position: absolute;
		top: 50%;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		transform: translate(-50%, -50%);
	}
	.dot.start {
		background: var(--c-surface);
		box-shadow: inset 0 0 0 2px var(--c-text-3);
	}
</style>
