import fs from 'node:fs';
import path from 'node:path';
import { error } from '@sveltejs/kit';

const DATA = path.resolve('static', 'data');

function readManifest() {
	return JSON.parse(fs.readFileSync(path.join(DATA, 'manifest.json'), 'utf8'));
}

/** Prerender one page per indicator slug. */
export function entries() {
	return readManifest().indicators.map((i) => ({ slug: i.slug }));
}

export function load({ params }) {
	const manifest = readManifest();
	const indicator = manifest.indicators.find((i) => i.slug === params.slug);
	if (!indicator) throw error(404, 'Indicator not found');

	let meta = '';
	if (indicator.metaPath) {
		const rel = indicator.metaPath.replace(/^\/data\//, '');
		const file = path.join(DATA, rel);
		if (fs.existsSync(file)) meta = fs.readFileSync(file, 'utf8');
	}

	const related = (indicator.related ?? [])
		.map((id) => manifest.indicators.find((i) => i.id === id))
		.filter(Boolean)
		.map((i) => ({ slug: i.slug, label: i.label }));

	return { indicator, meta, related };
}
