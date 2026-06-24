<script>
	const features = [
		{
			title: 'Explore the map',
			body: 'See how dozens of quality-of-life indicators vary across every Census tract in the 14-county region.',
			href: '/explore'
		},
		{
			title: 'Understand the data',
			body: 'Each indicator explains what it measures, how it is calculated, why it matters, and where it comes from.',
			href: '/indicators'
		},
		{
			title: 'Build a profile',
			body: 'Open a ready-made profile for any county or city, or compare neighborhoods side by side.',
			href: '/county/37119'
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
			The Carolinas Regional Explorer brings quality-of-life data to residents, researchers,
			planners, and policymakers across the Charlotte region — one neighborhood at a time.
		</p>
		<div class="hero-cta">
			<a class="btn btn-primary" href="/explore">Open the explorer</a>
			<a class="btn" href="/indicators">Browse indicators</a>
		</div>
	</div>
</section>

<section class="container feature-grid">
	{#each features as f (f.href)}
		<a class="card feature" href={f.href}>
			<h3>{f.title}</h3>
			<p>{f.body}</p>
			<span class="feature-go" aria-hidden="true">→</span>
		</a>
	{/each}
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
		max-width: 44ch;
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
	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--sp-4);
		padding-top: var(--sp-7);
		padding-bottom: var(--sp-8);
	}
	.feature {
		position: relative;
		padding: var(--sp-5);
		color: var(--c-text);
		border-left: 4px solid var(--c-teal);
		transition: box-shadow 0.15s ease, transform 0.15s ease;
	}
	.feature:hover {
		text-decoration: none;
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
	}
	.feature p {
		color: var(--c-text-2);
		margin-bottom: 0;
	}
	.feature-go {
		position: absolute;
		top: var(--sp-5);
		right: var(--sp-5);
		color: var(--c-teal);
		font-size: var(--t-xl);
	}
</style>
