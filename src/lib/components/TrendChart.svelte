<script>
	import { formatValue } from '$lib/map/colorScale.js';

	let {
		years = [],
		series = [],
		currentYearIndex = -1,
		format = 'number',
		decimals = 1,
		animKey = ''
	} = $props();

	const W = 300;
	const H = 140;
	const PAD = { t: 12, r: 12, b: 24, l: 40 };

	let pathEls = $state([]);
	let hoverIdx = $state(-1);

	let domain = $derived.by(() => {
		const all = [];
		for (const s of series) {
			s.values.forEach((v, i) => {
				if (v == null || !Number.isFinite(v)) return;
				all.push(v);
				const m = s.band?.[i];
				if (m != null && Number.isFinite(m)) all.push(v + m, v - m);
			});
		}
		if (!all.length) return [0, 1];
		let min = Math.min(...all);
		let max = Math.max(...all);
		if (min === max) {
			min -= 1;
			max += 1;
		}
		const pad = (max - min) * 0.12;
		return [min - pad, max + pad];
	});

	const plotW = W - PAD.l - PAD.r;
	const xAt = (i) => PAD.l + (years.length <= 1 ? 0 : (i * plotW) / (years.length - 1));
	const yAt = (v) => {
		const [lo, hi] = domain;
		return PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
	};

	function pathD(values) {
		let d = '';
		let pen = false;
		values.forEach((v, i) => {
			if (v == null || !Number.isFinite(v)) {
				pen = false;
				return;
			}
			d += `${pen ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)} `;
			pen = true;
		});
		return d.trim();
	}

	// contiguous runs where both value and its margin of error are finite
	function bandSegments(values, band) {
		const segs = [];
		let cur = [];
		values.forEach((v, i) => {
			const m = band?.[i];
			if (v != null && Number.isFinite(v) && m != null && Number.isFinite(m)) cur.push({ i, hi: v + m, lo: v - m });
			else if (cur.length) {
				segs.push(cur);
				cur = [];
			}
		});
		if (cur.length) segs.push(cur);
		return segs;
	}
	function bandD(seg) {
		let d = '';
		seg.forEach((p, k) => (d += `${k ? 'L' : 'M'}${xAt(p.i).toFixed(1)},${yAt(p.hi).toFixed(1)} `));
		for (let k = seg.length - 1; k >= 0; k--) d += `L${xAt(seg[k].i).toFixed(1)},${yAt(seg[k].lo).toFixed(1)} `;
		return d.trim() + ' Z';
	}
	const hasBand = $derived(series.some((s) => s.band));

	// thinned x-axis labels (~6 max), always include last
	let labelIdx = $derived.by(() => {
		const n = years.length;
		if (n <= 1) return [0];
		const step = Math.max(1, Math.ceil(n / 6));
		const out = [];
		for (let i = 0; i < n; i += step) out.push(i);
		if (out[out.length - 1] !== n - 1) out.push(n - 1);
		return out;
	});

	// active index for the guide/tooltip: hover wins, else current year
	let activeIdx = $derived(hoverIdx >= 0 ? hoverIdx : currentYearIndex);

	function onMove(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const frac = (e.clientX - rect.left) / rect.width;
		const px = frac * W;
		const i = Math.round(((px - PAD.l) / plotW) * (years.length - 1));
		hoverIdx = Math.max(0, Math.min(years.length - 1, i));
	}
	function onLeave() {
		hoverIdx = -1;
	}

	// staggered draw-in animation, replayed when animKey changes
	$effect(() => {
		animKey; // dependency
		const reduce =
			typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		pathEls.forEach((el, i) => {
			if (!el) return;
			const len = el.getTotalLength?.() ?? 0;
			if (reduce || !len) {
				el.style.transition = 'none';
				el.style.strokeDashoffset = '0';
				el.style.strokeDasharray = 'none';
				return;
			}
			el.style.transition = 'none';
			el.style.strokeDasharray = `${len}`;
			el.style.strokeDashoffset = `${len}`;
			void el.getBoundingClientRect();
			requestAnimationFrame(() => {
				el.style.transition = `stroke-dashoffset 700ms ${series[i]?.delay ?? 0}ms ease-out`;
				el.style.strokeDashoffset = '0';
			});
		});
	});
</script>

<figure class="trend">
	<div class="chart-box">
		<svg viewBox="0 0 {W} {H}" role="img" aria-label="Trend over time" onpointermove={onMove} onpointerleave={onLeave}>
			<!-- y gridlines -->
			{#each [domain[0], (domain[0] + domain[1]) / 2, domain[1]] as g (g)}
				<line class="grid" x1={PAD.l} x2={W - PAD.r} y1={yAt(g)} y2={yAt(g)} />
				<text class="axis" x={PAD.l - 5} y={yAt(g) + 3} text-anchor="end">{formatValue(g, format, 0)}</text>
			{/each}
			<!-- margin-of-error bands (drawn under lines) -->
			{#each series as s (s.label)}
				{#if s.band}
					{#each bandSegments(s.values, s.band) as seg, k (k)}
						<path class="band" d={bandD(seg)} fill={s.color} />
					{/each}
				{/if}
			{/each}
			<!-- active-year guide -->
			{#if activeIdx >= 0}
				<line class="guide" x1={xAt(activeIdx)} x2={xAt(activeIdx)} y1={PAD.t} y2={H - PAD.b} />
			{/if}
			<!-- series lines -->
			{#each series as s, i (s.label)}
				<path
					bind:this={pathEls[i]}
					d={pathD(s.values)}
					fill="none"
					stroke={s.color}
					stroke-width={s.dash === 'solid' ? 2.4 : 1.6}
					stroke-dasharray={s.dash === 'dash' ? '5 4' : s.dash === 'dot' ? '1.5 3' : ''}
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			{/each}
			<!-- markers (drawn after lines so they sit on top) -->
			{#each series as s (s.label)}
				{#each s.values as v, i (i)}
					{#if v != null && Number.isFinite(v)}
						<circle cx={xAt(i)} cy={yAt(v)} r={i === activeIdx ? 3.6 : 2} fill={s.color} stroke="#fff" stroke-width={i === activeIdx ? 1 : 0.5} />
					{/if}
				{/each}
			{/each}
			<!-- x labels (thinned) -->
			{#each labelIdx as i (i)}
				<text class="axis" x={xAt(i)} y={H - 8} text-anchor={i === 0 ? 'start' : i === years.length - 1 ? 'end' : 'middle'}>{years[i]}</text>
			{/each}
		</svg>
	</div>

	<!-- stable readout: legend + the value for the active year (hover, else current year) -->
	<ul class="legend">
		{#if activeIdx >= 0}
			<li class="legend-year">{years[activeIdx]}</li>
		{/if}
		{#each series as s (s.label)}
			<li>
				<span class="dot" style="background:{s.color}; {s.dash !== 'solid' ? 'opacity:.7' : ''}"></span>
				<span class="leg-lbl">{s.label}</span>
				{#if s.reliability?.[activeIdx] && s.reliability[activeIdx] !== 'ok'}
					<span class="rel rel-{s.reliability[activeIdx]}" title="Estimate reliability based on its margin of error">{s.reliability[activeIdx]}</span>
				{/if}
				<span class="leg-val">
					{formatValue(s.values[activeIdx], format, decimals)}{#if s.band?.[activeIdx] != null && Number.isFinite(s.band[activeIdx])}<span class="moe"> ± {formatValue(s.band[activeIdx], format, decimals)}</span>{/if}
				</span>
			</li>
		{/each}
	</ul>
	{#if hasBand}
		<p class="moe-note">Shaded band = 90% margin of error. ACS 5-year estimates are rolling; compare only non-overlapping periods.</p>
	{/if}
</figure>

<style>
	.trend {
		margin: 0;
	}
	.chart-box {
		position: relative;
	}
	svg {
		width: 100%;
		height: auto;
		display: block;
		touch-action: none;
	}
	.grid {
		stroke: var(--c-border);
		stroke-width: 1;
	}
	.band {
		opacity: 0.14;
		stroke: none;
	}
	.guide {
		stroke: var(--c-border-strong);
		stroke-width: 1;
		stroke-dasharray: 2 3;
	}
	.axis {
		font-size: 8px;
		fill: var(--c-text-3);
		font-family: var(--font-body);
	}
	.legend {
		list-style: none;
		margin: var(--sp-2) 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: var(--t-xs);
		color: var(--c-text-2);
	}
	.legend li {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}
	.legend-year {
		font-weight: 700;
		color: var(--c-text-3);
		border-bottom: 1px solid var(--c-border);
		padding-bottom: 2px;
		margin-bottom: 1px;
	}
	.leg-val {
		margin-left: auto;
		font-weight: 600;
		color: var(--c-text);
		font-variant-numeric: tabular-nums;
	}
	.moe {
		font-weight: 400;
		color: var(--c-text-3);
	}
	.rel {
		font-size: 0.85em;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		padding: 0 4px;
		border-radius: 3px;
		line-height: 1.4;
	}
	.rel-caution {
		background: #fdecc8;
		color: #8a5a00;
	}
	.rel-unreliable {
		background: #f7d4d4;
		color: #9a1f1f;
	}
	.moe-note {
		margin: var(--sp-2) 0 0;
		font-size: var(--t-2xs, 0.65rem);
		color: var(--c-text-3);
		line-height: 1.35;
	}
	.dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		flex-shrink: 0;
	}
</style>
