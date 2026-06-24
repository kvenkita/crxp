<script>
	import { BIVARIATE_MATRIX } from '$lib/map/bivariate.js';
	let { matrix = BIVARIATE_MATRIX, labelA = 'Variable A', labelB = 'Variable B' } = $props();
	// rows top→bottom should be high→low A, so reverse for display
	let rows = $derived([...matrix].map((r, i) => ({ a: i, cells: r })).reverse());
</script>

<div class="bi-legend">
	<div class="grid-wrap">
		<span class="axis-a">{labelA} →</span>
		<div class="grid">
			{#each rows as row (row.a)}
				{#each row.cells as color, b (b)}
					<span class="cell" style="background:{color}"></span>
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
	}
	.axis-b {
		grid-area: axisB;
		font-size: 0.66rem;
		color: var(--c-text-3);
		text-align: center;
	}
</style>
