<script>
	/**
	 * Interactive choropleth legend. Hovering a class highlights matching
	 * features on the map (transient); clicking pins the filter (sticky).
	 */
	let {
		classes = [],
		title = '',
		activeRange = null,
		sticky = false,
		onClassHover = () => {},
		onClassSelect = () => {}
	} = $props();

	const sameRange = (a, b) => a && b && a.min === b.min && a.max === b.max;

	function toggle(c) {
		if (sticky && sameRange(activeRange, c)) onClassSelect(null);
		else onClassSelect({ min: c.min, max: c.max });
	}
</script>

<div class="legend card">
	{#if title}<div class="legend-title">{title}</div>{/if}
	<ul class="legend-list">
		{#each classes as c (c.min + '-' + c.max)}
			{@const isActive = sameRange(activeRange, c)}
			<li>
				<button
					class="legend-item"
					class:active={isActive}
					class:dimmed={activeRange && !isActive}
					onmouseenter={() => !sticky && onClassHover({ min: c.min, max: c.max })}
					onmouseleave={() => !sticky && onClassHover(null)}
					onfocus={() => onClassHover({ min: c.min, max: c.max })}
					onblur={() => !sticky && onClassHover(null)}
					onclick={() => toggle(c)}
					aria-pressed={isActive}
				>
					<span class="swatch" style="background:{c.color}"></span>
					<span class="lbl">{c.label}</span>
				</button>
			</li>
		{/each}
	</ul>
	{#if activeRange}
		<button class="clear" onclick={() => onClassSelect(null)}>Clear filter</button>
	{:else}
		<p class="hint">Hover a class to highlight · click to filter</p>
	{/if}
</div>

<style>
	.legend {
		padding: var(--sp-3);
		min-width: 11rem;
	}
	.legend-title {
		font-size: var(--t-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--c-text-3);
		margin-bottom: var(--sp-2);
	}
	.legend-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		width: 100%;
		border: 0;
		background: transparent;
		padding: 3px var(--sp-2);
		border-radius: var(--r-sm);
		text-align: left;
		font-size: var(--t-sm);
		color: var(--c-text-2);
		transition: background 0.12s ease, opacity 0.12s ease;
	}
	.legend-item:hover,
	.legend-item.active {
		background: var(--c-surface-2);
		color: var(--c-text);
	}
	.legend-item.dimmed {
		opacity: 0.45;
	}
	.swatch {
		width: 1rem;
		height: 1rem;
		border-radius: 3px;
		flex-shrink: 0;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
	}
	.hint {
		margin: var(--sp-2) 0 0;
		font-size: 0.68rem;
		color: var(--c-text-3);
	}
	.clear {
		margin-top: var(--sp-2);
		border: 0;
		background: transparent;
		color: var(--c-link);
		font-size: var(--t-xs);
		padding: 2px;
	}
</style>
