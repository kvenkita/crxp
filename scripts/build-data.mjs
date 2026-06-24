/**
 * Data-contract gate. Validates everything under static/data/ before a build.
 * Exits non-zero (failing the build) on any contract violation.
 *
 * Run:  node scripts/build-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateManifest, validateValueFile } from '../src/lib/data/contract.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '..', 'static', 'data');

/** @returns {{ok:boolean, errors:string[]}} */
export function crossCheck(dataDir) {
	const errors = [];
	const read = (rel) => JSON.parse(fs.readFileSync(path.join(dataDir, rel), 'utf8'));
	const exists = (rel) => fs.existsSync(path.join(dataDir, rel));

	if (!exists('manifest.json')) return { ok: false, errors: ['manifest.json missing'] };
	const manifest = read('manifest.json');
	const mres = validateManifest(manifest);
	errors.push(...mres.errors);

	if (!exists('areas/tracts.json')) errors.push('areas/tracts.json missing');
	const tractGeoids = exists('areas/tracts.json')
		? new Set(read('areas/tracts.json').map((t) => t.geoid))
		: new Set();

	for (const ind of manifest.indicators || []) {
		// metadata
		if (ind.metaPath) {
			const rel = ind.metaPath.replace(/^\/data\//, '');
			if (!exists(rel)) errors.push(`indicator ${ind.id}: meta file missing (${ind.metaPath})`);
		}
		// value file
		const valRel = `values/${ind.id}.json`;
		if (!exists(valRel)) {
			errors.push(`indicator ${ind.id}: value file missing (${valRel})`);
		} else {
			const vres = validateValueFile(read(valRel), ind, tractGeoids);
			errors.push(...vres.errors.map((e) => `indicator ${ind.id}: ${e}`));
		}
		// analytics
		if (ind.hasZ && !exists(`analytics/z/${ind.id}.json`))
			errors.push(`indicator ${ind.id}: z analytics file missing`);
		if (ind.hasLisa && !exists(`analytics/lisa/${ind.id}.json`))
			errors.push(`indicator ${ind.id}: lisa analytics file missing`);
	}

	// aggregates
	if (!exists('aggregates.json')) errors.push('aggregates.json missing');

	// geometry
	if (!exists('geo/tracts.geojson')) errors.push('geo/tracts.geojson missing');

	return { ok: errors.length === 0, errors };
}

// Run as CLI
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const { ok, errors } = crossCheck(DATA);
	if (!ok) {
		console.error('✗ Data contract validation failed:');
		for (const e of errors) console.error('  - ' + e);
		process.exit(1);
	}
	console.log('✓ Data contract OK');
}
