<script>
	let { values = [], color = 'var(--c-teal)', width = 80, height = 24 } = $props();

	let finite = $derived(values.filter((v) => v != null && Number.isFinite(v)));
	let d = $derived.by(() => {
		if (finite.length < 2) return '';
		const min = Math.min(...finite);
		const max = Math.max(...finite);
		const span = max - min || 1;
		let out = '';
		let pen = false;
		values.forEach((v, i) => {
			if (v == null || !Number.isFinite(v)) {
				pen = false;
				return;
			}
			const x = (i * width) / (values.length - 1);
			const y = height - 2 - ((v - min) / span) * (height - 4);
			out += `${pen ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `;
			pen = true;
		});
		return out.trim();
	});
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" aria-hidden="true" class="spark">
	{#if d}<path {d} fill="none" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />{/if}
</svg>

<style>
	.spark {
		display: block;
	}
</style>
