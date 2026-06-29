<script>
	import { BIVARIATE_MATRIX } from '$lib/map/bivariate.js';
	let {
		matrix = BIVARIATE_MATRIX,
		labelA = 'Variable A',
		labelB = 'Variable B',
		active = null,
		onCellHover = () => {}
	} = $props();
	// rows top-to-bottom should be high-to-low A, so reverse for display
	let rows = $derived([...matrix].map((r, i) => ({ a: i, cells: r })).reverse());
	const isActive = (a, b) => active && active.a === a && active.b === b;
	const LO_MID_HI = ['low', 'middle', 'high'];
</script>

<div class="bi-legend">
	<div class="grid-wrap">
		<span class="axis-a">{labelA} →</span>
		<div class="grid">
			{#each rows as row (row.a)}
				{#each row.cells as color, b (b)}
					<button
						class="cell"
						class:active={isActive(row.a, b)}
						class:dimmed={active && !isActive(row.a, b)}
						style="background:{color}"
						title="{labelA}: {LO_MID_HI[row.a]} · {labelB}: {LO_MID_HI[b]}"
						aria-label="Highlight tracts with {labelA} {LO_MID_HI[row.a]} and {labelB} {LO_MID_HI[b]}"
						onmouseenter={() => onCellHover(row.a, b)}
						onmouseleave={() => onCellHover(null)}
						onfocus={() => onCellHover(row.a, b)}
						onblur={() => onCellHover(null)}
					></button>
				{/each}
			{/each}
		</div>
		<span class="axis-b">{labelB} →</span>
	</div>
</div>

<style>
	.bi-legend {
		display: inline-block;
	}
	.grid-wrap {
		display: grid;
		grid-template-columns: auto auto;
		grid-template-areas: 'axisA grid' '. axisB';
		gap: 4px;
		align-items: center;
	}
	.axis-a {
		grid-area: axisA;
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		font-size: 0.66rem;
		color: var(--c-text-3);
		justify-self: center;
	}
	.grid {
		grid-area: grid;
		display: grid;
		grid-template-columns: repeat(3, 1.6rem);
		grid-template-rows: repeat(3, 1.6rem);
		gap: 2px;
	}
	.cell {
		width: 100%;
		height: 100%;
		border-radius: 2px;
		border: 0;
		padding: 0;
		cursor: pointer;
		transition: opacity 0.12s ease, transform 0.12s ease, box-shadow 0.12s ease;
	}
	.cell:hover,
	.cell.active {
		box-shadow: 0 0 0 2px var(--c-text);
		transform: scale(1.08);
	}
	.cell.dimmed {
		opacity: 0.4;
	}
	.axis-b {
		grid-area: axisB;
		font-size: 0.66rem;
		color: var(--c-text-3);
		text-align: center;
	}
</style>
