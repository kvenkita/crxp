<script>
	import { LISA_COLORS } from '$lib/map/MapController.js';
	let { active = [1, 2, 3, 4], onToggle = () => {} } = $props();
	const quads = [
		{ code: 1, label: 'High–High (hot spot)', color: LISA_COLORS[1] },
		{ code: 4, label: 'High–Low (outlier)', color: LISA_COLORS[4] },
		{ code: 2, label: 'Low–High (outlier)', color: LISA_COLORS[2] },
		{ code: 3, label: 'Low–Low (cold spot)', color: LISA_COLORS[3] }
	];
</script>

<ul class="lisa-legend">
	{#each quads as q (q.code)}
		<li>
			<button
				class="q"
				class:off={!active.includes(q.code)}
				aria-pressed={active.includes(q.code)}
				onclick={() => onToggle(q.code)}
			>
				<span class="sw" style="background:{q.color}"></span>
				{q.label}
			</button>
		</li>
	{/each}
	<li class="ns">
		<span class="sw" style="background:{LISA_COLORS[0]}"></span> Not significant
	</li>
</ul>

<style>
	.lisa-legend {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.q {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		width: 100%;
		border: 0;
		background: transparent;
		padding: 3px var(--sp-2);
		border-radius: var(--r-sm);
		font-size: var(--t-sm);
		color: var(--c-text-2);
		text-align: left;
	}
	.q:hover {
		background: var(--c-surface-2);
	}
	.q.off {
		opacity: 0.4;
	}
	.sw {
		width: 0.9rem;
		height: 0.9rem;
		border-radius: 3px;
		flex-shrink: 0;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
	}
	.ns {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		font-size: var(--t-xs);
		color: var(--c-text-3);
		padding: 3px var(--sp-2);
	}
</style>
