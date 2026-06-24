<script>
	import Fuse from 'fuse.js';
	import { manifest } from '$lib/state/manifest.svelte.js';

	let { variant = 'panel', selectedId = null, onSelect = () => {} } = $props();

	let query = $state('');

	let fuse = $derived(
		new Fuse(manifest.indicators, { keys: ['label', 'category', 'source'], threshold: 0.4 })
	);

	let results = $derived(
		query.trim() ? fuse.search(query.trim()).map((r) => r.item) : manifest.indicators
	);

	function grouped(list) {
		return manifest.categories
			.map((c) => ({ ...c, items: list.filter((i) => i.category === c.key) }))
			.filter((c) => c.items.length);
	}
	let groups = $derived(grouped(results));
</script>

<div class="browser" class:grid={variant === 'grid'}>
	<input
		class="search"
		type="search"
		placeholder="Search indicators…"
		bind:value={query}
		aria-label="Search indicators"
	/>

	{#each groups as cat (cat.key)}
		<section class="cat">
			<h3 class="cat-title">{cat.label}</h3>
			<ul class="cat-list">
				{#each cat.items as ind (ind.id)}
					<li>
						<button
							class="ind"
							class:active={ind.id === selectedId}
							aria-pressed={ind.id === selectedId}
							onclick={() => onSelect(ind.id)}
						>
							{ind.label}
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{:else}
		<p class="empty">No indicators match “{query}”.</p>
	{/each}
</div>

<style>
	.browser {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
	}
	.search {
		width: 100%;
		padding: var(--sp-2) var(--sp-3);
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		font: inherit;
		background: var(--c-surface);
	}
	.cat-title {
		font-size: var(--t-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--c-text-3);
		margin: 0 0 var(--sp-2);
	}
	.cat-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.ind {
		width: 100%;
		text-align: left;
		border: 0;
		background: transparent;
		padding: var(--sp-2) var(--sp-3);
		border-radius: var(--r-md);
		font-size: var(--t-sm);
		color: var(--c-text-2);
	}
	.ind:hover {
		background: var(--c-surface-2);
		color: var(--c-text);
	}
	.ind.active {
		background: var(--c-sand-faint);
		color: var(--c-plum);
		font-weight: 600;
	}
	.grid .cat-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
		gap: var(--sp-2);
	}
	.grid .ind {
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
		padding: var(--sp-3);
	}
	.empty {
		color: var(--c-text-3);
		font-size: var(--t-sm);
	}
</style>
