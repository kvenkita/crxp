<script>
	/** Lightweight SVG locator: all counties as rectangles, active one highlighted. */
	let { counties = [], activeFips = null, width = 260, height = 170 } = $props();

	let region = $derived.by(() => {
		let bb = [Infinity, Infinity, -Infinity, -Infinity];
		for (const c of counties) {
			if (!c.bbox) continue;
			bb = [Math.min(bb[0], c.bbox[0]), Math.min(bb[1], c.bbox[1]), Math.max(bb[2], c.bbox[2]), Math.max(bb[3], c.bbox[3])];
		}
		return bb;
	});

	const pad = 8;
	function rect(b) {
		const [x0, y0, x1, y1] = region;
		const w = x1 - x0 || 1;
		const h = y1 - y0 || 1;
		const sx = (width - pad * 2) / w;
		const sy = (height - pad * 2) / h;
		const s = Math.min(sx, sy);
		const px = (lng) => pad + (lng - x0) * s;
		const py = (lat) => height - pad - (lat - y0) * s; // flip y
		return { x: px(b[0]), y: py(b[3]), w: (b[2] - b[0]) * s, h: (b[3] - b[1]) * s };
	}
</script>

<svg viewBox="0 0 {width} {height}" class="snapshot" role="img" aria-label="Location within the region">
	{#each counties as c (c.fips)}
		{#if c.bbox}
			{@const r = rect(c.bbox)}
			<rect
				x={r.x}
				y={r.y}
				width={Math.max(0, r.w)}
				height={Math.max(0, r.h)}
				class:active={c.fips === activeFips}
				rx="1"
			/>
		{/if}
	{/each}
</svg>

<style>
	.snapshot {
		width: 100%;
		height: auto;
		background: var(--c-surface-2);
		border-radius: var(--r-md);
	}
	rect {
		fill: var(--c-border);
		stroke: var(--c-surface);
		stroke-width: 0.75;
	}
	rect.active {
		fill: var(--c-teal);
	}
</style>
