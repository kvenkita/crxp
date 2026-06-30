// Client wrapper around the /.netlify/functions/geocode proxy.
// Returns the proxy's JSON: { ok, matchedAddress, lat, lon, geoid } or { ok:false, reason }.
// NOTE: the function only runs on the deployed site (or via `netlify dev`); under a
// plain vite dev server the path 404s to HTML and we surface 'geocoder_unavailable'.
export async function geocodeAddress(address) {
	const r = await fetch(`/.netlify/functions/geocode?address=${encodeURIComponent(address)}`);
	try {
		return await r.json();
	} catch {
		return { ok: false, reason: 'geocoder_unavailable' };
	}
}
