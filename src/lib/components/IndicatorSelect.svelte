<script>
	/**
	 * A <select> of indicators grouped into theme <optgroup>s — alphabetical within each theme and
	 * color-coded by theme, so a long indicator list is easy to scan. Theme order + colors come from
	 * the manifest categories.
	 */
	import { manifest } from '$lib/state/manifest.svelte.js';

	let { indicators = [], value = null, onChange = () => {}, ariaLabel = 'Indicator' } = $props();

	// group by theme (manifest category order), indicators sorted alphabetically within each theme
	let groups = $derived(
		manifest.categories
			.map((c) => ({
				key: c.key,
				label: c.label,
				color: c.color ?? '#666',
				items: indicators
					.filter((i) => i.category === c.key)
					.sort((a, b) => a.label.localeCompare(b.label))
			}))
			.filter((g) => g.items.length)
	);
</script>

<select {value} onchange={(e) => onChange(Number(e.target.value))} aria-label={ariaLabel}>
	{#each groups as g (g.key)}
		<optgroup label={g.label} style="color:{g.color}">
			{#each g.items as i (i.id)}
				<option value={i.id} style="color:{g.color}">{i.label}</option>
			{/each}
		</optgroup>
	{/each}
</select>

<style>
	select {
		padding: var(--sp-2) var(--sp-3);
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		font: inherit;
		background: var(--c-surface);
		color: var(--c-text);
		width: 100%;
	}
	optgroup {
		font-weight: 700;
	}
	option {
		color: var(--c-text);
	}
</style>
