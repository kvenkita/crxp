<script>
	/**
	 * Locator/inset map: the 14 counties as their real (simplified) polygon outlines, with the active
	 * county highlighted. Each county is a link to its profile, so the inset doubles as a seamless
	 * county switcher.
	 * @param {{shapes:{fips:string,name:string,rings:number[][][]}[], activeFips:string|null, width?:number, height?:number}} props
	 */
	import { base } from '$app/paths';

	let { shapes = [], activeFips = null, width = 280, height = 200 } = $props();

	const PAD = 6;

	let bbox = $derived.by(() => {
		const b = [Infinity, Infinity, -Infinity, -Infinity];
		for (const s of shapes)
			for (const ring of s.rings)
				for (const [x, y] of ring) {
					if (x < b[0]) b[0] = x;
					if (y < b[1]) b[1] = y;
					if (x > b[2]) b[2] = x;
					if (y > b[3]) b[3] = y;
				}
		return b;
	});

	let proj = $derived.by(() => {
		const [x0, y0, x1, y1] = bbox;
		const w = x1 - x0 || 1;
		const h = y1 - y0 || 1;
		const s = Math.min((width - PAD * 2) / w, (height - PAD * 2) / h);
		const ox = (width - w * s) / 2;
		const oy = (height - h * s) / 2;
		return {
			px: (lng) => ox + (lng - x0) * s,
			py: (lat) => height - oy - (lat - y0) * s // flip y (north up)
		};
	});

	function pathD(rings) {
		let d = '';
		for (const ring of rings) {
			ring.forEach(([lng, lat], i) => {
				d += `${i ? 'L' : 'M'}${proj.px(lng).toFixed(1)},${proj.py(lat).toFixed(1)} `;
			});
			d += 'Z ';
		}
		return d.trim();
	}
</script>

<svg viewBox="0 0 {width} {height}" class="locator" role="img" aria-label="Location within the 14-county region">
	{#each shapes as s (s.fips)}
		<a href="{base}/county/{s.fips}/" aria-label="{s.name} profile">
			<path d={pathD(s.rings)} class:active={s.fips === activeFips}>
				<title>{s.name}</title>
			</path>
		</a>
	{/each}
</svg>

<style>
	.locator {
		width: 100%;
		height: auto;
		background: var(--c-surface-2);
		border-radius: var(--r-md);
	}
	path {
		fill: var(--c-border);
		stroke: var(--c-surface);
		stroke-width: 0.6;
		transition: fill 0.12s ease;
	}
	a:hover path:not(.active) {
		fill: color-mix(in srgb, var(--c-teal) 40%, var(--c-border));
		cursor: pointer;
	}
	path.active {
		fill: var(--c-teal);
		stroke: var(--c-surface);
		stroke-width: 1;
	}
	@media print {
		path {
			fill: #d8d8d8;
		}
		path.active {
			fill: #6b6b6b;
		}
	}
</style>
