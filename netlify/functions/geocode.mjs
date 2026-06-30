// Server-side geocoding proxy. Two modes:
//   ?suggest=<text>  -> Geoapify autocomplete, constrained to the 14-county region.
//                       Returns { ok, suggestions:[{label,lat,lon}] }. Needs GEOAPIFY_API_KEY.
//   ?address=<text>  -> U.S. Census geocoder (keyless), returns the 2020 tract directly:
//                       { ok, matchedAddress, lat, lon, geoid }. Used as the Enter fallback.
// The Geoapify key is read from the environment and never sent to the browser.
const GEOAPIFY = 'https://api.geoapify.com/v1/geocode/autocomplete';
const REGION_RECT = '-81.8181,34.4078,-79.7987,36.1088'; // 14-county bbox: lon1,lat1,lon2,lat2

const CENSUS = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress';
const BENCHMARK = 'Public_AR_Current';
const VINTAGE = 'Census2020_Current';

export default async (req) => {
	const params = new URL(req.url).searchParams;
	const suggest = params.get('suggest');
	const address = params.get('address');

	// ---- autocomplete suggestions (Geoapify) ----
	if (suggest != null) {
		const text = suggest.trim();
		if (text.length < 3) return Response.json({ ok: true, suggestions: [] });
		const key = process.env.GEOAPIFY_API_KEY;
		if (!key) return Response.json({ ok: false, reason: 'no_key' });
		const url =
			`${GEOAPIFY}?text=${encodeURIComponent(text)}` +
			`&filter=rect:${REGION_RECT}&format=json&limit=6&apiKey=${key}`;
		try {
			const r = await fetch(url);
			if (!r.ok) return Response.json({ ok: false, reason: 'geocoder_error' });
			const d = await r.json();
			const suggestions = (d.results ?? [])
				.filter((x) => x.lat != null && x.lon != null)
				.map((x) => ({ label: x.formatted, lat: x.lat, lon: x.lon }));
			return Response.json({ ok: true, suggestions });
		} catch {
			return Response.json({ ok: false, reason: 'error' });
		}
	}

	// ---- full-address resolve (Census, returns the tract) ----
	if (!address || !address.trim()) {
		return Response.json({ ok: false, reason: 'no_address' }, { status: 400 });
	}
	const api =
		`${CENSUS}?address=${encodeURIComponent(address)}` +
		`&benchmark=${BENCHMARK}&vintage=${VINTAGE}&layers=Census Tracts&format=json`;
	try {
		const r = await fetch(api, { headers: { 'User-Agent': 'CarolinasRegionalExplorer/1.0' } });
		if (!r.ok) return Response.json({ ok: false, reason: 'geocoder_error' });
		const d = await r.json();
		const matches = d?.result?.addressMatches ?? [];
		if (!matches.length) return Response.json({ ok: false, reason: 'no_match' });
		const m = matches[0];
		const tract = m.geographies?.['Census Tracts']?.[0];
		return Response.json(
			{
				ok: true,
				matchedAddress: m.matchedAddress,
				lat: m.coordinates?.y ?? null,
				lon: m.coordinates?.x ?? null,
				geoid: tract?.GEOID ?? null
			},
			{ headers: { 'Cache-Control': 'public, max-age=86400' } }
		);
	} catch {
		return Response.json({ ok: false, reason: 'error' });
	}
};
