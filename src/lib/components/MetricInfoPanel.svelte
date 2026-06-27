<script>
	import { base } from '$app/paths';
	import MarkdownBlock from './MarkdownBlock.svelte';
	let { indicator = null, meta = '', brief = null, compact = false } = $props();

	const host = (url) => {
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return '';
		}
	};

	// In compact mode (explore sidebar) show only the lead paragraph — keep it brief; the full brief
	// and cited resources live on the indicator page.
	let whyShown = $derived(
		brief?.why ? (compact ? brief.why.split(/\n\s*\n/)[0] : brief.why) : ''
	);
</script>

{#if indicator}
	<div class="info" class:compact>
		<div class="chips">
			<span class="chip">{indicator.source}</span>
			{#if indicator.vintage}<span class="chip">{indicator.vintage}</span>{/if}
			{#if indicator.higherIsBetter === true}<span class="chip good">Higher is better</span>{/if}
			{#if indicator.higherIsBetter === false}<span class="chip need">Higher = more need</span>{/if}
		</div>

		{#if brief?.why}
			<MarkdownBlock source={whyShown} />
			{#if !compact && brief.resources?.length}
				<div class="learn">
					<p class="learn-h">Learn more</p>
					<ul>
						{#each brief.resources as r (r.url)}
							<li>
								<a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
								{#if host(r.url)}<span class="host">{host(r.url)}</span>{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if indicator.slug}
				<a class="full-link" href="{base}/indicators/{indicator.slug}/">Full details &amp; sources →</a>
			{/if}
		{:else if meta}
			<MarkdownBlock source={meta} />
		{:else}
			<p class="loading">Loading details…</p>
		{/if}
	</div>
{/if}

<style>
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-2);
		margin-bottom: var(--sp-3);
	}
	.chip {
		font-size: 0.68rem;
		background: var(--c-surface-2);
		color: var(--c-text-2);
		border: 1px solid var(--c-border);
		border-radius: var(--r-pill);
		padding: 2px var(--sp-2);
	}
	.chip.good {
		background: #e8f3ef;
		color: var(--c-accent-strong);
		border-color: #cfe7df;
	}
	.chip.need {
		background: #f7eede;
		color: var(--c-warn);
		border-color: #ecdcc0;
	}
	.loading {
		color: var(--c-text-3);
		font-size: var(--t-sm);
	}
	.learn {
		margin-top: var(--sp-3);
	}
	.learn-h {
		font-size: var(--t-xs);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--c-text-3);
		margin: 0 0 var(--sp-1);
	}
	.learn ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.learn li {
		font-size: var(--t-sm);
		line-height: 1.3;
	}
	.learn .host {
		font-size: var(--t-xs);
		color: var(--c-text-3);
		margin-left: 4px;
	}
	.full-link {
		display: inline-block;
		margin-top: var(--sp-3);
		font-size: var(--t-sm);
		font-weight: 600;
	}
	.compact :global(.prose p) {
		font-size: var(--t-sm);
	}
	.compact .learn li {
		font-size: var(--t-xs);
	}
</style>
