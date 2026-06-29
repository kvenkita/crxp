<script>
	/**
	 * Scatter of two indicators' STANDARDIZED (z-score) values, colored by the same 3×3
	 * bivariate class as the choropleth, with marginal histograms, a regression line, and
	 * two-way hover linking to the map.
	 */
	let {
		points = [], // [{ geoid, zx, zy, color }]
		r = null, // Pearson correlation (linear)
		rho = null, // Spearman correlation (rank)
		labelA = 'Variable A',
		labelB = 'Variable B',
		hoverGeoid = null,
		hoverName = '',
		onHover = () => {}
	} = $props();

	const W = 320;
	const H = 300;
	const MT = 30; // top marginal band (x distribution)
	const MR = 30; // right marginal band (y distribution)
	const L = 32; // left pad
	const B = 26; // bottom pad
	const x0 = L;
	const x1 = W - MR;
	const y0 = MT;
	const y1 = H - B;
	const plotW = x1 - x0;
	const plotH = y1 - y0;

	let dmax = $derived.by(() => {
		let m = 3;
		for (const p of points) m = Math.max(m, Math.abs(p.zx), Math.abs(p.zy));
		return Math.min(4, Math.ceil(m * 10) / 10);
	});
	const sx = (z) => x0 + ((Math.max(-dmax, Math.min(dmax, z)) + dmax) / (2 * dmax)) * plotW;
	const sy = (z) => y1 - ((Math.max(-dmax, Math.min(dmax, z)) + dmax) / (2 * dmax)) * plotH;

	// marginal histograms (shared bins across the z domain)
	const NB = 24;
	function hist(getz) {
		const bins = new Array(NB).fill(0);
		for (const p of points) {
			const z = Math.max(-dmax, Math.min(dmax, getz(p)));
			let k = Math.floor(((z + dmax) / (2 * dmax)) * NB);
			if (k >= NB) k = NB - 1;
			if (k < 0) k = 0;
			bins[k]++;
		}
		const mx = Math.max(1, ...bins);
		return bins.map((c) => c / mx);
	}
	let xhist = $derived(hist((p) => p.zx));
	let yhist = $derived(hist((p) => p.zy));

	let hoverPt = $derived(points.find((p) => p.geoid === hoverGeoid) ?? null);

	function onMove(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * W;
		const py = ((e.clientY - rect.top) / rect.height) * H;
		let best = null;
		let bestD = 12 * 12; // px^2 threshold
		for (const p of points) {
			const dx = sx(p.zx) - px;
			const dy = sy(p.zy) - py;
			const d = dx * dx + dy * dy;
			if (d < bestD) {
				bestD = d;
				best = p;
			}
		}
		onHover(best ? best.geoid : null);
	}
	function onLeave() {
		onHover(null);
	}
</script>

<figure class="scatter">
	<div class="hovered-name" class:on={hoverName}>{hoverName || 'Hover a tract or dot'}</div>
	<svg viewBox="0 0 {W} {H}" role="img" aria-label="Scatter of standardized values" onpointermove={onMove} onpointerleave={onLeave}>
		<!-- plot frame + mean gridlines -->
		<rect class="frame" x={x0} y={y0} width={plotW} height={plotH} />
		<line class="grid" x1={sx(0)} x2={sx(0)} y1={y0} y2={y1} />
		<line class="grid" x1={x0} x2={x1} y1={sy(0)} y2={sy(0)} />

		<!-- top marginal: x distribution -->
		{#each xhist as h, i (i)}
			<rect class="margin" x={x0 + (i / NB) * plotW} y={MT - 2 - h * (MT - 4)} width={plotW / NB - 0.6} height={h * (MT - 4)} />
		{/each}
		<!-- right marginal: y distribution -->
		{#each yhist as h, i (i)}
			<rect class="margin" x={x1 + 2} y={y1 - ((i + 1) / NB) * plotH} width={h * (MR - 4)} height={plotH / NB - 0.6} />
		{/each}

		<!-- regression line: standardized slope = r, through origin -->
		{#if r != null && Number.isFinite(r)}
			<line class="fit" x1={sx(-dmax)} y1={sy(-dmax * r)} x2={sx(dmax)} y2={sy(dmax * r)} />
		{/if}

		<!-- dots -->
		{#each points as p (p.geoid)}
			<circle cx={sx(p.zx)} cy={sy(p.zy)} r="2.4" fill={p.color} fill-opacity="0.7" />
		{/each}
		<!-- hovered dot on top -->
		{#if hoverPt}
			<circle cx={sx(hoverPt.zx)} cy={sy(hoverPt.zy)} r="5" fill={hoverPt.color} stroke="#1f1a17" stroke-width="1.4" />
		{/if}

		<!-- axis ticks (z = -2,0,2) -->
		{#each [-2, 0, 2] as t (t)}
			<text class="axis" x={sx(t)} y={y1 + 10} text-anchor="middle">{t}</text>
			<text class="axis" x={x0 - 4} y={sy(t) + 3} text-anchor="end">{t}</text>
		{/each}
	</svg>

	<div class="legend">
		<div class="rrow">
			<span>Correlation</span>
			<strong>
				Pearson {r == null || !Number.isFinite(r) ? '—' : (r >= 0 ? '+' : '') + r.toFixed(2)}
				· Spearman {rho == null || !Number.isFinite(rho) ? '—' : (rho >= 0 ? '+' : '') + rho.toFixed(2)}
			</strong>
		</div>
		<p class="axes">x: {labelA} · y: {labelB} <span class="z">(standardized, z-scores)</span></p>
		<p class="caveat">Descriptive only: tracts are spatially autocorrelated, so this is not a significance test.</p>
	</div>
</figure>

<style>
	.scatter {
		margin: 0;
	}
	.hovered-name {
		font-size: var(--t-xs);
		font-weight: 700;
		color: var(--c-text);
		min-height: 1.2em;
		margin-bottom: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.hovered-name:not(.on) {
		font-weight: 400;
		color: var(--c-text-3);
		font-style: italic;
	}
	svg {
		width: 100%;
		height: auto;
		display: block;
		touch-action: none;
	}
	.frame {
		fill: none;
		stroke: var(--c-border);
		stroke-width: 1;
	}
	.grid {
		stroke: var(--c-border-strong);
		stroke-width: 1;
		stroke-dasharray: 2 3;
		opacity: 0.7;
	}
	.margin {
		fill: var(--c-text-3);
		opacity: 0.45;
	}
	.fit {
		stroke: #1f1a17;
		stroke-width: 1.6;
		stroke-dasharray: 4 3;
		opacity: 0.8;
	}
	.axis {
		font-size: 8px;
		fill: var(--c-text-3);
		font-family: var(--font-body);
	}
	.legend {
		margin-top: var(--sp-2);
		font-size: var(--t-xs);
		color: var(--c-text-2);
	}
	.rrow {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0 var(--sp-2);
	}
	.rrow strong {
		font-size: var(--t-sm);
		color: var(--c-text);
		font-variant-numeric: tabular-nums;
	}
	.axes {
		margin: 2px 0 0;
		color: var(--c-text-3);
		line-height: 1.3;
	}
	.z {
		opacity: 0.8;
	}
	.caveat {
		margin: 3px 0 0;
		font-size: var(--t-2xs, 0.65rem);
		color: var(--c-text-3);
		font-style: italic;
		line-height: 1.3;
	}
</style>
