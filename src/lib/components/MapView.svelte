<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import 'maplibre-gl/dist/maplibre-gl.css';

	/**
	 * `center` ([lng,lat]) + `zoom` set the initial camera (e.g. restored from a shared URL);
	 * when absent the map fits the region. `interactive={false}` locks the view (embeds);
	 * `cooperativeGestures` requires ctrl/⌘+scroll to zoom so embeds don't hijack page scroll.
	 */
	let {
		onReady = () => {},
		onHover = () => {},
		onSelect = () => {},
		onMoveEnd = () => {},
		center = null,
		zoom = null,
		interactive = true,
		cooperativeGestures = false
	} = $props();

	let container;
	let controller = null;
	let ready = $state(false);

	onMount(() => {
		if (!browser) return;
		let destroyed = false;
		(async () => {
			const { MapController } = await import('$lib/map/MapController.js');
			if (destroyed) return;
			controller = new MapController(container, {
				basePath: base,
				center: center ?? undefined,
				zoom: zoom ?? undefined,
				interactive,
				cooperativeGestures,
				callbacks: { onHover: (...a) => onHover(...a), onSelect: (...a) => onSelect(...a), onMoveEnd: (...a) => onMoveEnd(...a) }
			});
			await controller.init();
			if (destroyed) {
				controller.destroy();
				return;
			}
			ready = true;
			onReady(controller);
		})();
		return () => {
			destroyed = true;
			controller?.destroy();
			controller = null;
			ready = false;
		};
	});

	// keep callbacks fresh (avoid stale closures in map handlers)
	$effect(() => {
		if (controller)
			controller.callbacks = { onHover: (...a) => onHover(...a), onSelect: (...a) => onSelect(...a), onMoveEnd: (...a) => onMoveEnd(...a) };
	});
</script>

<div class="map-root" bind:this={container} role="application" aria-label="Interactive choropleth map">
	{#if !ready}
		<div class="map-loading">Loading map…</div>
	{/if}
</div>

<style>
	.map-root {
		position: absolute;
		inset: 0;
		background: var(--c-surface-2);
	}
	.map-loading {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: var(--c-text-3);
		font-size: var(--t-sm);
	}
	:global(.maplibregl-ctrl-attrib) {
		font-size: 10px;
	}
</style>
