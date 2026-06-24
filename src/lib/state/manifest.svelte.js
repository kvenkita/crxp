import { base } from '$app/paths';

/** Indicator manifest — the single source of truth, loaded once. */
export const manifest = $state({
	loaded: false,
	/** @type {string} */ region: '',
	/** @type {number[]} */ years: [],
	/** @type {{key:string,label:string,order?:number}[]} */ categories: [],
	/** @type {import('../data/contract.js').Indicator[]} */ indicators: []
});

let loading = null;

export async function loadManifest(fetchFn = fetch) {
	if (manifest.loaded) return manifest;
	if (loading) return loading;
	loading = (async () => {
		const res = await fetchFn(`${base}/data/manifest.json`);
		const data = await res.json();
		manifest.region = data.region ?? '';
		manifest.years = data.years ?? [];
		manifest.categories = (data.categories ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		manifest.indicators = data.indicators ?? [];
		manifest.loaded = true;
		return manifest;
	})();
	return loading;
}

export function indicatorById(id) {
	return manifest.indicators.find((i) => i.id === id) ?? null;
}
export function indicatorBySlug(slug) {
	return manifest.indicators.find((i) => i.slug === slug) ?? null;
}
export function indicatorsByCategory(key) {
	return manifest.indicators.filter((i) => i.category === key);
}
