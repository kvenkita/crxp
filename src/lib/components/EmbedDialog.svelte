<script>
	import { base } from '$app/paths';
	import { shareUrls, iframeSnippet, EMBED_SIZES } from '$lib/util/embed.js';

	/**
	 * Share/Embed dialog (embed roadmap Phase 3). `qs` is the explorer's current
	 * query string (the same one the URL bar carries), so both URLs stay exact.
	 */
	let { open = $bindable(false), qs = '', title = '' } = $props();

	/** @type {HTMLDialogElement | null} */
	let dlg = $state(null);
	let size = $state(EMBED_SIZES[1]); // Medium
	let staticView = $state(false);
	let withNav = $state(false);
	let withTopnav = $state(false);
	let copiedCode = $state(false);
	let copiedLink = $state(false);

	const origin = typeof window !== 'undefined' ? window.location.origin : '';
	let urls = $derived(shareUrls(origin, base, qs, { staticView, nav: withNav, topnav: withTopnav }));
	let snippet = $derived(
		iframeSnippet(urls.embed, { width: size.width, height: size.height, title: title || undefined })
	);

	$effect(() => {
		if (!dlg) return;
		if (open && !dlg.open) dlg.showModal();
		else if (!open && dlg.open) dlg.close();
	});

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(snippet);
			copiedCode = true;
			setTimeout(() => (copiedCode = false), 1500);
		} catch {
			/* ignore */
		}
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(urls.explore);
			copiedLink = true;
			setTimeout(() => (copiedLink = false), 1500);
		} catch {
			/* ignore */
		}
	}

	// close when the backdrop itself is clicked
	/** @param {MouseEvent} e */
	function onBackdrop(e) {
		if (e.target === dlg) open = false;
	}
</script>

<dialog
	bind:this={dlg}
	class="embed-dialog"
	aria-label="Share or embed this map"
	onclose={() => (open = false)}
	onclick={onBackdrop}
>
	<div class="body">
		<div class="head">
			<h3>Share / embed</h3>
			<button class="close" aria-label="Close" onclick={() => (open = false)}>✕</button>
		</div>

		<section>
			<span class="field-label">Link to this view</span>
			<input class="url" type="text" readonly value={urls.explore} onfocus={(e) => e.currentTarget.select()} />
			<div class="row">
				<button class="btn copy" onclick={copyLink}>{copiedLink ? 'Copied!' : 'Copy link'}</button>
			</div>
		</section>

		<section>
			<span class="field-label">Embed on your site</span>
			<div class="row">
				{#each EMBED_SIZES as p (p.id)}
					<button class="opt" class:active={size.id === p.id} aria-pressed={size.id === p.id}
						onclick={() => (size = p)}>{p.label}</button>
				{/each}
				<label class="static">
					<input type="checkbox" bind:checked={staticView} />
					static (no pan/zoom)
				</label>
				<label class="static">
					<input type="checkbox" bind:checked={withNav} />
					indicator navigation
				</label>
				<label class="static">
					<input type="checkbox" bind:checked={withTopnav} />
					site navigation
				</label>
			</div>
			<textarea class="code" readonly rows="4" value={snippet} onfocus={(e) => e.currentTarget.select()}
			></textarea>
			<div class="row">
				<button class="btn copy" onclick={copyCode}>{copiedCode ? 'Copied!' : 'Copy embed code'}</button>
				<a class="preview" href={urls.embed} target="_blank" rel="noopener noreferrer">Preview ↗</a>
			</div>
		</section>
	</div>
</dialog>

<style>
	.embed-dialog {
		border: 1px solid var(--c-border);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-lg);
		padding: 0;
		width: min(34rem, calc(100vw - 2rem));
		color: var(--c-text);
		background: var(--c-surface);
	}
	.embed-dialog::backdrop {
		background: rgba(31, 26, 23, 0.45);
	}
	.body {
		padding: var(--sp-5);
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.head h3 {
		margin: 0;
	}
	.close {
		border: none;
		background: none;
		color: var(--c-text-3);
		font-size: var(--t-base);
		padding: var(--sp-1) var(--sp-2);
		border-radius: var(--r-sm);
	}
	.close:hover {
		background: var(--c-surface-2);
		color: var(--c-text);
	}
	section {
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
	}
	.field-label {
		font-size: var(--t-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--c-teal);
	}
	.url,
	.code {
		width: 100%;
		font-family: var(--font-mono);
		font-size: var(--t-xs);
		color: var(--c-text-2);
		background: var(--c-surface-2);
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
		padding: var(--sp-2) var(--sp-3);
	}
	.code {
		resize: none;
		line-height: 1.5;
	}
	.row {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		flex-wrap: wrap;
	}
	.opt {
		font-size: var(--t-xs);
		border: 1px solid var(--c-border-strong);
		background: var(--c-surface);
		color: var(--c-text-2);
		border-radius: var(--r-pill);
		padding: 2px var(--sp-3);
	}
	.opt:hover {
		border-color: var(--c-teal);
	}
	.opt.active {
		background: var(--c-teal);
		border-color: var(--c-teal);
		color: var(--c-text-inv);
	}
	.static {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-1);
		font-size: var(--t-xs);
		color: var(--c-text-2);
	}
	.static:first-of-type {
		margin-left: auto;
	}
	.copy {
		font-size: var(--t-sm);
		border: 1px solid var(--c-teal);
		background: var(--c-teal);
		color: var(--c-text-inv);
		border-radius: var(--r-pill);
		padding: var(--sp-1) var(--sp-4);
	}
	.copy:hover {
		background: var(--c-accent-strong);
		border-color: var(--c-accent-strong);
	}
	.preview {
		font-size: var(--t-sm);
	}
</style>
