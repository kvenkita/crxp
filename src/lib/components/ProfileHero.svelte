<script>
	let { kicker = '', name = '', lead = '', stats = [], snapshot } = $props();
</script>

<header class="hero">
	<div class="hero-text">
		<p class="eyebrow">{kicker}</p>
		<h1>{name}</h1>
		{#if lead}<p class="lead">{lead}</p>{/if}
		{#if stats.length}
			<dl class="stats">
				{#each stats as s (s.label)}
					<div><dt>{s.label}</dt><dd>{s.value}</dd></div>
				{/each}
			</dl>
		{/if}
	</div>
	{#if snapshot}
		<div class="hero-snapshot">{@render snapshot()}</div>
	{/if}
</header>

<style>
	.hero {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--sp-5);
		align-items: center;
		padding: var(--sp-6) 0 var(--sp-5);
		border-bottom: 1px solid var(--c-border);
	}
	h1 {
		font-size: var(--t-3xl);
		margin: var(--sp-1) 0 var(--sp-3);
	}
	.lead {
		color: var(--c-text-2);
		max-width: 46ch;
	}
	.stats {
		display: flex;
		gap: var(--sp-6);
		margin: var(--sp-4) 0 0;
	}
	.stats dt {
		font-size: var(--t-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--c-text-3);
	}
	.stats dd {
		margin: 2px 0 0;
		font-family: var(--font-display);
		font-size: var(--t-xl);
		color: var(--c-plum);
	}
	.hero-snapshot {
		width: 16rem;
		max-width: 40vw;
	}
	@media (max-width: 700px) {
		.hero {
			grid-template-columns: 1fr;
		}
		.hero-snapshot {
			width: 12rem;
		}
	}
</style>
