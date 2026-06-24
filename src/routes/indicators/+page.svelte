<script>
	import { base } from '$app/paths';
	let { data } = $props();
	let groups = $derived(
		data.categories
			.map((c) => ({ ...c, items: data.indicators.filter((i) => i.category === c.key) }))
			.filter((c) => c.items.length)
	);
</script>

<svelte:head>
	<title>Indicators — Carolinas Regional Explorer</title>
	<meta name="description" content="Browse all quality-of-life indicators in the Carolinas Regional Explorer." />
</svelte:head>

<div class="container catalog">
	<header>
		<p class="eyebrow">Catalog</p>
		<h1>Indicators</h1>
		<p class="lede">Browse every indicator. Each page explains what it measures, how it is calculated, and why it matters.</p>
	</header>

	{#each groups as cat (cat.key)}
		<section class="cat">
			<h2>{cat.label}</h2>
			<div class="cards">
				{#each cat.items as ind (ind.id)}
					<a class="card ind-card" href="{base}/indicators/{ind.slug}/">
						<h3>{ind.label}</h3>
						<p>{ind.source} · {ind.vintage}</p>
					</a>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	.catalog {
		padding: var(--sp-6) var(--sp-5) var(--sp-8);
	}
	.lede {
		color: var(--c-text-2);
		max-width: 48ch;
	}
	.cat {
		margin-top: var(--sp-6);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: var(--sp-3);
		margin-top: var(--sp-3);
	}
	.ind-card {
		padding: var(--sp-4);
		color: var(--c-text);
		border-left: 3px solid var(--c-teal);
		transition: box-shadow 0.15s ease, transform 0.15s ease;
	}
	.ind-card:hover {
		text-decoration: none;
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
	}
	.ind-card h3 {
		font-size: var(--t-base);
		margin: 0 0 var(--sp-1);
	}
	.ind-card p {
		font-size: var(--t-xs);
		color: var(--c-text-3);
		margin: 0;
	}
</style>
