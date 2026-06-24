<script>
	import { buildAreaIndex, searchAreas } from '$lib/search/areaIndex.js';

	let { areas = [], onPick = () => {}, placeholder = 'Search a tract, city, or county…' } = $props();

	let query = $state('');
	let open = $state(false);
	let active = $state(-1);

	let index = $derived(buildAreaIndex(areas));
	let results = $derived(searchAreas(index, query));

	const LEVEL_LABEL = { tract: 'Tract', place: 'City', county: 'County' };

	function choose(area) {
		onPick(area);
		query = '';
		open = false;
		active = -1;
	}

	function onKey(e) {
		if (!results.length) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			active = (active + 1) % results.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			active = (active - 1 + results.length) % results.length;
		} else if (e.key === 'Enter' && active >= 0) {
			e.preventDefault();
			choose(results[active]);
		} else if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

<div class="search-wrap">
	<input
		type="search"
		role="combobox"
		aria-expanded={open && results.length > 0}
		aria-controls="area-results"
		aria-autocomplete="list"
		{placeholder}
		bind:value={query}
		oninput={() => (open = true)}
		onfocus={() => (open = true)}
		onkeydown={onKey}
	/>
	{#if open && results.length}
		<ul class="results card" id="area-results" role="listbox">
			{#each results as r, i (r.geoid)}
				<li role="option" aria-selected={i === active}>
					<button class="result" class:active={i === active} onclick={() => choose(r)}>
						<span class="r-name">{r.name}</span>
						<span class="r-level">{LEVEL_LABEL[r.level] ?? r.level}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.search-wrap {
		position: relative;
		width: 100%;
	}
	input {
		width: 100%;
		padding: var(--sp-2) var(--sp-3);
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-pill);
		font: inherit;
		background: var(--c-surface);
	}
	.results {
		position: absolute;
		z-index: 30;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		max-height: 16rem;
		overflow-y: auto;
		list-style: none;
		margin: 0;
		padding: var(--sp-1);
	}
	.result {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		border: 0;
		background: transparent;
		padding: var(--sp-2) var(--sp-3);
		border-radius: var(--r-sm);
		text-align: left;
		font-size: var(--t-sm);
		color: var(--c-text);
	}
	.result:hover,
	.result.active {
		background: var(--c-surface-2);
	}
	.r-level {
		font-size: var(--t-xs);
		color: var(--c-text-3);
	}
</style>
