import { base } from '$app/paths';

const cache = new Map();

/** Fetch + cache an indicator's metadata markdown by its manifest metaPath. */
export async function loadMeta(metaPath, fetchFn = fetch) {
	if (!metaPath) return '';
	if (cache.has(metaPath)) return cache.get(metaPath);
	const rel = metaPath.startsWith('/') ? metaPath : `/${metaPath}`;
	const p = fetchFn(`${base}${rel}`).then((r) => (r.ok ? r.text() : ''));
	cache.set(metaPath, p);
	return p;
}
