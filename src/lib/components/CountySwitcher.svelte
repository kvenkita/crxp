<script>
	/**
	 * Seamless switcher across the 14 county profiles: previous / next arrows + a jump-to dropdown.
	 * Uses client-side navigation between prerendered profile pages.
	 */
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	let { counties = [], activeFips = null } = $props();

	let sorted = $derived([...counties].sort((a, b) => a.name.localeCompare(b.name)));
	let idx = $derived(sorted.findIndex((c) => c.fips === activeFips));
	let prev = $derived(idx > 0 ? sorted[idx - 1] : sorted[sorted.length - 1]);
	let next = $derived(idx < sorted.length - 1 ? sorted[idx + 1] : sorted[0]);

	function jump(e) {
		goto(`${base}/county/${e.target.value}/`);
	}
</script>

<nav class="switcher no-print" aria-label="Switch county profile">
	<a class="arrow" href="{base}/county/{prev?.fips}/" aria-label="Previous county ({prev?.name})" title={prev?.name}>‹</a>
	<label class="pick">
		<span class="vh">Jump to a county</span>
		<select value={activeFips} onchange={jump} aria-label="Jump to a county">
			{#each sorted as c (c.fips)}
				<option value={c.fips}>{c.name}</option>
			{/each}
		</select>
	</label>
	<a class="arrow" href="{base}/county/{next?.fips}/" aria-label="Next county ({next?.name})" title={next?.name}>›</a>
	<span class="count">{idx + 1} of {sorted.length}</span>
</nav>

<style>
	.switcher {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		margin: var(--sp-3) 0 0;
	}
	.arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		font-size: var(--t-lg);
		line-height: 1;
		color: var(--c-text-2);
		text-decoration: none;
	}
	.arrow:hover {
		border-color: var(--c-teal);
		color: var(--c-teal);
		text-decoration: none;
	}
	.pick select {
		padding: var(--sp-2) var(--sp-3);
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		font: inherit;
		background: var(--c-surface);
		color: var(--c-text);
		min-width: 12rem;
	}
	.count {
		font-size: var(--t-xs);
		color: var(--c-text-3);
		margin-left: var(--sp-1);
	}
	.vh {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
</style>
