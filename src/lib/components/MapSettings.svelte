<script>
	let {
		basemap = 'light',
		opacity = 0.82,
		overlayVisible = true,
		reliabilityVisible = true,
		onBasemap = () => {},
		onOpacity = () => {},
		onToggleOverlay = () => {},
		onToggleReliability = () => {}
	} = $props();

	let open = $state(false);
	const maps = [
		{ key: 'light', label: 'Light' },
		{ key: 'streets', label: 'Streets' },
		{ key: 'satellite', label: 'Satellite' }
	];
</script>

<div class="map-settings card" class:open>
	<button class="gear" aria-expanded={open} title="Map settings" onclick={() => (open = !open)}>
		<span aria-hidden="true">⚙</span><span class="g-label">Map</span>
	</button>
	{#if open}
		<div class="body">
			<div class="row">
				<span class="lbl">Basemap</span>
				<div class="seg">
					{#each maps as m (m.key)}
						<button class="seg-btn" class:active={basemap === m.key} onclick={() => onBasemap(m.key)}>{m.label}</button>
					{/each}
				</div>
			</div>
			<div class="row">
				<label class="lbl" for="ov-op">Overlay opacity</label>
				<input id="ov-op" type="range" min="0" max="1" step="0.05" value={opacity} oninput={(e) => onOpacity(Number(e.target.value))} />
			</div>
			<div class="row">
				<span class="lbl">Data overlay</span>
				<button class="toggle" class:on={overlayVisible} onclick={() => onToggleOverlay(!overlayVisible)}>
					{overlayVisible ? 'On' : 'Off'}
				</button>
			</div>
			<div class="row">
				<span class="lbl">Flag unreliable areas</span>
				<button class="toggle" class:on={reliabilityVisible} onclick={() => onToggleReliability(!reliabilityVisible)}>
					{reliabilityVisible ? 'On' : 'Off'}
				</button>
				<span class="hint">▨ Hatched tracts have high uncertainty (CV &gt; 30%)</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.map-settings {
		padding: 0;
		overflow: hidden;
	}
	.gear {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		width: 100%;
		border: 0;
		background: var(--c-surface);
		padding: var(--sp-2) var(--sp-3);
		font-size: var(--t-sm);
		font-weight: 600;
		color: var(--c-text);
	}
	.g-label {
		font-size: var(--t-xs);
	}
	.body {
		padding: var(--sp-3);
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
		border-top: 1px solid var(--c-border);
		min-width: 12rem;
	}
	.row {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.lbl {
		font-size: var(--t-xs);
		color: var(--c-text-3);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.seg {
		display: flex;
		background: var(--c-surface-2);
		border-radius: var(--r-pill);
		padding: 2px;
	}
	.seg-btn {
		flex: 1;
		border: 0;
		background: transparent;
		border-radius: var(--r-pill);
		padding: 3px var(--sp-2);
		font-size: var(--t-xs);
		color: var(--c-text-2);
	}
	.seg-btn.active {
		background: var(--c-surface);
		color: var(--c-teal);
		box-shadow: var(--shadow-sm);
	}
	input[type='range'] {
		width: 100%;
		accent-color: var(--c-teal);
	}
	.toggle {
		align-self: flex-start;
		border: 1px solid var(--c-border-strong);
		background: var(--c-surface);
		border-radius: var(--r-pill);
		padding: 2px var(--sp-4);
		font-size: var(--t-xs);
	}
	.toggle.on {
		background: var(--c-teal);
		border-color: var(--c-teal);
		color: var(--c-text-inv);
	}
	.hint {
		font-size: var(--t-2xs, 0.65rem);
		color: var(--c-text-3);
		line-height: 1.3;
	}
</style>
