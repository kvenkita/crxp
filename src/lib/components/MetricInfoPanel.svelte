<script>
	import MarkdownBlock from './MarkdownBlock.svelte';
	let { indicator = null, meta = '', compact = false } = $props();
</script>

{#if indicator}
	<div class="info" class:compact>
		<div class="chips">
			<span class="chip">{indicator.source}</span>
			{#if indicator.vintage}<span class="chip">{indicator.vintage}</span>{/if}
			{#if indicator.higherIsBetter === true}<span class="chip good">Higher is better</span>{/if}
			{#if indicator.higherIsBetter === false}<span class="chip need">Higher = more need</span>{/if}
		</div>
		{#if meta}
			<MarkdownBlock source={meta} />
		{:else}
			<p class="loading">Loading details…</p>
		{/if}
	</div>
{/if}

<style>
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
		margin-bottom: var(--sp-3);
	}
	.chip {
		font-size: 0.68rem;
		background: var(--c-surface-2);
		color: var(--c-text-2);
		border: 1px solid var(--c-border);
		border-radius: var(--r-pill);
		padding: 2px var(--sp-2);
	}
	.chip.good {
		background: #e8f3ef;
		color: var(--c-accent-strong);
		border-color: #cfe7df;
	}
	.chip.need {
		background: #f7eede;
		color: var(--c-warn);
		border-color: #ecdcc0;
	}
	.loading {
		color: var(--c-text-3);
		font-size: var(--t-sm);
	}
	.compact :global(.prose p) {
		font-size: var(--t-sm);
	}
</style>
