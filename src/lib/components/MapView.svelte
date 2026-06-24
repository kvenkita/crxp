<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let {
		geoLevel = 'tract',
		choropleth = null, // { valuesByGeoid, breaks, colors }
		legendFilter = null,
		selected = null,
		flyBbox = null,
		onHover = () => {},
		onSelect = () => {},
		onReady = () => {}
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
				callbacks: { onHover: (...a) => onHover(...a), onSelect: (...a) => onSelect(...a) }
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
		if (controller) controller.callbacks = { onHover: (...a) => onHover(...a), onSelect: (...a) => onSelect(...a) };
	});

	// geo level + choropleth together (ensures correct ordering)
	$effect(() => {
		if (!ready || !controller) return;
		controller.setGeoLevel(geoLevel);
		if (choropleth) {
			controller.applyChoropleth(choropleth.valuesByGeoid, choropleth.breaks, choropleth.colors);
			controller.setLegendFilter(legendFilter, choropleth.valuesByGeoid);
		}
	});

	$effect(() => {
		if (ready && controller && choropleth) controller.setLegendFilter(legendFilter, choropleth.valuesByGeoid);
	});

	$effect(() => {
		if (ready && controller) controller.setSelected(selected);
	});

	$effect(() => {
		if (ready && controller && flyBbox) controller.flyToBbox(flyBbox);
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
