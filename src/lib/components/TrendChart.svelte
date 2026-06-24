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
	const H = 130;
	const PAD = { t: 12, r: 12, b: 22, l: 38 };

	let pathEls = $state([]);

	let domain = $derived.by(() => {
		const all = series.flatMap((s) => s.values).filter((v) => v != null && Number.isFinite(v));
		if (!all.length) return [0, 1];
		let min = Math.min(...all);
		let max = Math.max(...all);
		if (min === max) {
			min -= 1;
			max += 1;
		}
		const pad = (max - min) * 0.1;
		return [min - pad, max + pad];
	});

	const xAt = (i) =>
		PAD.l + (years.length <= 1 ? 0 : (i * (W - PAD.l - PAD.r)) / (years.length - 1));
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

	const dashArray = (style) => (style === 'dash' ? '5 4' : style === 'dot' ? '1.5 3' : '');

	// staggered draw-in animation, replayed when animKey changes
	$effect(() => {
		animKey; // dependency
		const reduce =
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		pathEls.forEach((el, i) => {
			if (!el) return;
			const len = el.getTotalLength?.() ?? 0;
			if (reduce || !len) {
				el.style.transition = 'none';
				el.style.strokeDasharray = dashArray(series[i]?.dash) || 'none';
				el.style.strokeDashoffset = '0';
				return;
			}
			el.style.transition = 'none';
			el.style.strokeDasharray = `${len}`;
			el.style.strokeDashoffset = `${len}`;
			// force reflow then animate
			void el.getBoundingClientRect();
			requestAnimationFrame(() => {
				el.style.transition = `stroke-dashoffset 700ms ${series[i]?.delay ?? 0}ms ease-out`;
				el.style.strokeDashoffset = '0';
			});
		});
	});
</script>

<figure class="trend">
	<svg viewBox="0 0 {W} {H}" role="img" aria-label="Trend over time">
		<!-- y gridlines -->
		{#each [domain[0], (domain[0] + domain[1]) / 2, domain[1]] as g (g)}
			<line class="grid" x1={PAD.l} x2={W - PAD.r} y1={yAt(g)} y2={yAt(g)} />
			<text class="axis" x={PAD.l - 5} y={yAt(g) + 3} text-anchor="end">{formatValue(g, format, 0)}</text>
		{/each}
		<!-- current-year guide -->
		{#if currentYearIndex >= 0}
			<line class="guide" x1={xAt(currentYearIndex)} x2={xAt(currentYearIndex)} y1={PAD.t} y2={H - PAD.b} />
		{/if}
		<!-- series -->
		{#each series as s, i (s.label)}
			<path
				bind:this={pathEls[i]}
				d={pathD(s.values)}
				fill="none"
				stroke={s.color}
				stroke-width={s.dash === 'solid' ? 2.4 : 1.6}
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			{#if currentYearIndex >= 0 && s.values[currentYearIndex] != null}
				<circle cx={xAt(currentYearIndex)} cy={yAt(s.values[currentYearIndex])} r="3" fill={s.color} />
			{/if}
		{/each}
		<!-- x labels (first/last) -->
		<text class="axis" x={xAt(0)} y={H - 6} text-anchor="start">{years[0]}</text>
		<text class="axis" x={xAt(years.length - 1)} y={H - 6} text-anchor="end">{years.at(-1)}</text>
	</svg>
	<ul class="legend">
		{#each series as s (s.label)}
			<li>
				<span class="dot" style="background:{s.color}; {s.dash !== 'solid' ? 'opacity:.7' : ''}"></span>
				{s.label}
				{#if currentYearIndex >= 0 && s.values[currentYearIndex] != null}
					<strong>{formatValue(s.values[currentYearIndex], format, decimals)}</strong>
				{/if}
			</li>
		{/each}
	</ul>
</figure>

<style>
	.trend {
		margin: 0;
	}
	svg {
		width: 100%;
		height: auto;
		display: block;
	}
	.grid {
		stroke: var(--c-border);
		stroke-width: 1;
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
	.legend strong {
		margin-left: auto;
		color: var(--c-text);
	}
	.dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		flex-shrink: 0;
	}
</style>
