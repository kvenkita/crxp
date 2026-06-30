// Server-side proxy to the U.S. Census geocoder (keyless). Avoids the geocoder's
// missing CORS headers and keeps the front end static. Given ?address=, returns
// { ok, matchedAddress, lat, lon, geoid } where geoid is the 2020 census tract.
const BENCHMARK = 'Public_AR_Current';
const VINTAGE = 'Census2020_Current';

export default async (req) => {
	const address = new URL(req.url).searchParams.get('address');
	if (!address || !address.trim()) {
		return Response.json({ ok: false, reason: 'no_address' }, { status: 400 });
	}
	const api =
		'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress' +
		`?address=${encodeURIComponent(address)}` +
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
