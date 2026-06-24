<script>
	import { base } from '$app/paths';
	import Sparkline from './Sparkline.svelte';
	import { formatValue } from '$lib/map/colorScale.js';

	let { items = [], categories = [] } = $props();

	function delta(values) {
		const f = values.find((v) => v != null);
		const l = [...values].reverse().find((v) => v != null);
		if (f == null || l == null) return null;
		return l - f;
	}

	let groups = $derived(
		categories
			.map((c) => ({ ...c, items: items.filter((i) => i.category === c.key) }))
			.filter((c) => c.items.length)
	);
</script>

{#each groups as cat (cat.key)}
	<section class="cat">
		<h2>{cat.label}</h2>
		<div class="grid">
			{#each cat.items as m (m.id)}
				<a class="card metric" href="{base}/indicators/{m.slug}/">
					<div class="m-top">
						<span class="m-label">{m.label}</span>
						<Sparkline values={m.values} />
					</div>
					<div class="m-val">
						<strong>{formatValue(m.value, m.format, m.decimals)}</strong>
						{#if delta(m.values) != null}
							{@const d = delta(m.values)}
							<span class="m-delta" class:up={d > 0} class:down={d < 0}>
								{d > 0 ? '▲' : d < 0 ? '▼' : '—'} {formatValue(Math.abs(d), m.format, m.decimals)}
								<span class="since">since {m.firstYear}</span>
							</span>
						{/if}
					</div>
					<div class="m-region">Region: {formatValue(m.regionValue, m.format, m.decimals)}</div>
				</a>
			{/each}
		</div>
	</section>
{/each}

<style>
	.cat {
		margin-top: var(--sp-5);
	}
	.cat h2 {
		font-size: var(--t-xl);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: var(--sp-3);
		margin-top: var(--sp-3);
	}
	.metric {
		padding: var(--sp-4);
		color: var(--c-text);
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
	}
	.metric:hover {
		text-decoration: none;
		box-shadow: var(--shadow-md);
	}
	.m-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--sp-2);
	}
	.m-label {
		font-size: var(--t-sm);
		color: var(--c-text-2);
	}
	.m-val {
		display: flex;
		align-items: baseline;
		gap: var(--sp-2);
	}
	.m-val strong {
		font-family: var(--font-display);
		font-size: var(--t-2xl);
		color: var(--c-plum);
	}
	.m-delta {
		font-size: var(--t-xs);
		color: var(--c-text-3);
	}
	.m-delta.up {
		color: var(--c-accent-strong);
	}
	.m-delta.down {
		color: var(--c-danger);
	}
	.since {
		color: var(--c-text-3);
	}
	.m-region {
		font-size: var(--t-xs);
		color: var(--c-text-3);
		border-top: 1px solid var(--c-border);
		padding-top: var(--sp-2);
	}
</style>
