<script>
	import { renderMarkdown } from '$lib/util/markdown.js';
	let { source = '' } = $props();
	let html = $derived(renderMarkdown(source));
</script>

<!-- content is authored by us and sanitized in renderMarkdown -->
<div class="prose">{@html html}</div>

<style>
	.prose :global(h2) {
		font-size: var(--t-xl);
		margin-top: 0;
	}
	.prose :global(h3) {
		font-size: var(--t-base);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--c-teal);
		margin: var(--sp-4) 0 var(--sp-2);
	}
	.prose :global(p) {
		color: var(--c-text-2);
		margin: 0 0 var(--sp-3);
	}
	.prose :global(a) {
		color: var(--c-link);
	}
	.prose :global(ul) {
		margin: 0 0 var(--sp-3);
		padding-left: 1.2em;
		color: var(--c-text-2);
	}
	.prose :global(em) {
		color: var(--c-text-3);
		font-size: var(--t-sm);
	}
</style>
