import fs from 'node:fs';
import path from 'node:path';

export function load() {
	const manifest = JSON.parse(fs.readFileSync(path.resolve('static', 'data', 'manifest.json'), 'utf8'));
	return { indicators: manifest.indicators, region: manifest.region, years: manifest.years };
}
