<script>
	import { pins, toggle, pinned, MAX_PINS } from '$lib/state/pins.svelte.js';

	let { area = null, compact = false } = $props();

	let isPinned = $derived(area ? pinned(area.geoid) : false);
	let full = $derived(pins.items.length >= MAX_PINS);
</script>

{#if area}
	<button
		class="pin"
		class:compact
		class:on={isPinned}
		disabled={!isPinned && full}
		title={isPinned ? 'Remove from comparison' : full ? `Comparison full (${MAX_PINS} max)` : 'Add to comparison'}
		onclick={() => toggle(area)}
	>
		<span aria-hidden="true">{isPinned ? '★' : '☆'}</span>
		{#if !compact}{isPinned ? 'Pinned' : 'Compare'}{/if}
	</button>
{/if}

<style>
	.pin {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-1);
		border: 1px solid var(--c-border-strong);
		background: var(--c-surface);
		border-radius: var(--r-pill);
		padding: 2px var(--sp-3);
		font-size: var(--t-xs);
		color: var(--c-text-2);
	}
	.pin.on {
		background: var(--c-sand-faint);
		border-color: var(--c-sand);
		color: var(--c-plum);
	}
	.pin:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.pin.compact {
		padding: 2px var(--sp-2);
	}
</style>
