// Client wrappers around the /.netlify/functions/geocode proxy.
// NOTE: the function only runs on the deployed site (or via `netlify dev`); under a
// plain vite dev server the path 404s to HTML and we surface 'geocoder_unavailable'.

/** Autocomplete suggestions for a partial address (region-constrained, via Geoapify). */
export async function suggestAddresses(text) {
	const r = await fetch(`/.netlify/functions/geocode?suggest=${encodeURIComponent(text)}`);
	try {
		return await r.json(); // { ok, suggestions:[{label,lat,lon}] } | { ok:false, reason }
	} catch {
		return { ok: false, reason: 'geocoder_unavailable' };
	}
}

/** Resolve a full address to its 2020 tract (via the Census geocoder). */
export async function geocodeAddress(address) {
	const r = await fetch(`/.netlify/functions/geocode?address=${encodeURIComponent(address)}`);
	try {
		return await r.json(); // { ok, matchedAddress, lat, lon, geoid } | { ok:false, reason }
	} catch {
		return { ok: false, reason: 'geocoder_unavailable' };
	}
}
