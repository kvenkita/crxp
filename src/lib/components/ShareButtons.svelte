<script>
	let { url = '', title = '' } = $props();
	let copied = $state(false);

	let shareUrl = $derived(url || (typeof window !== 'undefined' ? window.location.href : ''));

	const enc = (s) => encodeURIComponent(s);
	let links = $derived([
		{ label: 'X', href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(shareUrl)}` },
		{ label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}` },
		{ label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}` }
	]);

	async function copy() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			/* ignore */
		}
	}
</script>

<div class="share no-print">
	<span class="lbl">Share</span>
	{#each links as l (l.label)}
		<a class="sb" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
	{/each}
	<button class="sb" onclick={copy}>{copied ? 'Copied!' : 'Copy link'}</button>
</div>

<style>
	.share {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		flex-wrap: wrap;
	}
	.lbl {
		font-size: var(--t-xs);
		color: var(--c-text-3);
	}
	.sb {
		font-size: var(--t-xs);
		border: 1px solid var(--c-border-strong);
		background: var(--c-surface);
		color: var(--c-text-2);
		border-radius: var(--r-pill);
		padding: 2px var(--sp-3);
	}
	.sb:hover {
		border-color: var(--c-teal);
		text-decoration: none;
	}
</style>
