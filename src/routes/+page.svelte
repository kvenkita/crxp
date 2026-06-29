<script>
	const start = [
		{
			title: 'Explore the map',
			body: 'See how dozens of quality-of-life indicators vary across every Census tract in the 14-county region.',
			href: '/explore'
		},
		{
			title: 'Browse the indicators',
			body: "What each measure means, how it's calculated, why it matters, and where it comes from.",
			href: '/indicators'
		},
		{
			title: 'County and city profiles',
			body: 'Open a ready-made profile for any county or city, or compare neighborhoods side by side.',
			href: '/county/37119'
		},
		{
			title: 'How the data is made',
			body: 'The sources behind each number, the uncertainty in every estimate, and the methods that produce them.',
			href: '/methods'
		}
	];
</script>

<svelte:head>
	<title>Carolinas Regional Explorer</title>
	<meta
		name="description"
		content="Explore quality-of-life indicators across Census tracts in the 14-county Charlotte region."
	/>
</svelte:head>

<section class="hero">
	<div class="container hero-inner">
		<p class="eyebrow">Charlotte 14-county region</p>
		<h1>Explore your community, tract by tract.</h1>
		<p class="lede">
			The Carolinas Regional Explorer maps quality-of-life indicators for every Census tract in the
			14-county Charlotte region, built for residents, researchers, planners, and policymakers.
		</p>
		<div class="hero-cta">
			<a class="btn btn-primary" href="/explore">Open the explorer</a>
			<a class="btn" href="/indicators">Browse indicators</a>
		</div>
	</div>
</section>

<section class="container start">
	<h2 class="start-title">Where to start</h2>
	<div class="start-list">
		{#each start as s (s.href)}
			<a class="start-item" href={s.href}>
				<h3>{s.title}</h3>
				<p>{s.body}</p>
			</a>
		{/each}
	</div>
</section>

<style>
	.hero {
		background: linear-gradient(160deg, var(--c-sand-faint), var(--c-bg) 70%);
		border-bottom: 1px solid var(--c-border);
		padding: var(--sp-8) 0 var(--sp-7);
	}
	.hero-inner {
		max-width: 52rem;
	}
	.lede {
		font-size: var(--t-lg);
		color: var(--c-text-2);
		max-width: 48ch;
	}
	h1 {
		font-size: var(--t-4xl);
		margin-top: var(--sp-2);
	}
	.hero-cta {
		display: flex;
		gap: var(--sp-3);
		margin-top: var(--sp-5);
		flex-wrap: wrap;
	}

	.start {
		padding-top: var(--sp-7);
		padding-bottom: var(--sp-8);
	}
	.start-title {
		font-size: var(--t-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--c-text-3);
		margin-bottom: var(--sp-4);
	}
	.start-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--sp-3);
	}
	@media (min-width: 720px) {
		.start-list {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--sp-4);
		}
	}
	.start-item {
		display: block;
		padding: var(--sp-4) var(--sp-5);
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-left: 4px solid var(--c-teal);
		border-radius: var(--r-md);
		color: var(--c-text);
		transition: background 0.15s ease, border-color 0.15s ease;
	}
	.start-item:hover {
		text-decoration: none;
		background: var(--c-surface-2);
		border-color: var(--c-border-strong);
		border-left-color: var(--c-accent-strong);
	}
	.start-item h3 {
		font-size: var(--t-lg);
		margin: 0 0 var(--sp-1);
	}
	.start-item:hover h3 {
		color: var(--c-teal);
	}
	.start-item p {
		color: var(--c-text-2);
		font-size: var(--t-sm);
		margin: 0;
	}
</style>
