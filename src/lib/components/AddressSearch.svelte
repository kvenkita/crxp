<script>
	import { geocodeAddress } from '$lib/geo/geocode.js';
	import { loadTractIndex, inRegion, tractAtPoint } from '$lib/geo/locate.js';

	let { onLocate = () => {}, basePath = '' } = $props();

	let query = $state('');
	let status = $state('idle'); // idle | loading | no_match | out_region | geo_denied | error
	let geoSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

	const MESSAGES = {
		no_match: "We couldn't find that address. Try adding the city and ZIP code.",
		out_region: 'That address is outside the Charlotte 14-county region.',
		geo_denied: "Couldn't read your location. Check your browser's location permission.",
		error: 'Address lookup is unavailable right now. Please try again.'
	};

	async function submitAddress() {
		const q = query.trim();
		if (!q || status === 'loading') return;
		status = 'loading';
		try {
			const idx = await loadTractIndex(basePath);
			const d = await geocodeAddress(q);
			if (!d?.ok) {
				status = d?.reason === 'no_match' ? 'no_match' : 'error';
				return;
			}
			if (!inRegion(idx, d.geoid)) {
				status = 'out_region';
				return;
			}
			status = 'idle';
			onLocate({ geoid: d.geoid, lat: d.lat, lon: d.lon, label: d.matchedAddress });
		} catch {
			status = 'error';
		}
	}

	async function useMyLocation() {
		if (!geoSupported || status === 'loading') return;
		status = 'loading';
		let idx;
		try {
			idx = await loadTractIndex(basePath);
		} catch {
			status = 'error';
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const { latitude: lat, longitude: lon } = pos.coords;
				const geoid = tractAtPoint(idx, lon, lat);
				if (!geoid) {
					status = 'out_region';
					return;
				}
				status = 'idle';
				onLocate({ geoid, lat, lon, label: 'Your location' });
			},
			() => (status = 'geo_denied'),
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}
</script>

<div class="addr">
	<form class="addr-row" onsubmit={(e) => (e.preventDefault(), submitAddress())}>
		<input
			type="search"
			bind:value={query}
			oninput={() => status !== 'loading' && (status = 'idle')}
			placeholder="Find your address (street, city, ZIP)"
			aria-label="Find your address"
		/>
		<button type="submit" class="btn btn-primary go" disabled={status === 'loading' || !query.trim()}>
			{status === 'loading' ? 'Locating' : 'Find'}
		</button>
	</form>
	{#if geoSupported}
		<button type="button" class="loc-link" onclick={useMyLocation} disabled={status === 'loading'}>
			Use my location
		</button>
	{/if}
	{#if status !== 'idle' && status !== 'loading'}
		<p class="addr-msg" role="status">{MESSAGES[status]}</p>
	{/if}
</div>

<style>
	.addr {
		display: flex;
		flex-direction: column;
		gap: var(--sp-1);
	}
	.addr-row {
		display: flex;
		gap: var(--sp-2);
	}
	input {
		flex: 1;
		min-width: 0;
		padding: var(--sp-2) var(--sp-3);
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-pill);
		font: inherit;
		background: var(--c-surface);
	}
	.go {
		flex-shrink: 0;
		padding-block: var(--sp-2);
	}
	.go:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.loc-link {
		align-self: flex-start;
		border: 0;
		background: transparent;
		padding: 0 var(--sp-1);
		color: var(--c-link);
		font-size: var(--t-xs);
		font-weight: 600;
	}
	.loc-link:hover:not(:disabled) {
		text-decoration: underline;
	}
	.loc-link:disabled {
		color: var(--c-text-3);
		cursor: default;
	}
	.addr-msg {
		margin: 0;
		font-size: var(--t-xs);
		color: var(--c-text-2);
	}
</style>
