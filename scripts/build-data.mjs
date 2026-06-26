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

const SUPPORTED_SCHEMA = new Set([1]); // contract schema versions this app understands

/** @returns {{ok:boolean, errors:string[]}} */
export function crossCheck(dataDir) {
	const errors = [];
	const exists = (rel) => fs.existsSync(path.join(dataDir, rel));
	/** Safe JSON read: records a clear error and returns null on a malformed/missing file. */
	const read = (rel) => {
		try {
			return JSON.parse(fs.readFileSync(path.join(dataDir, rel), 'utf8'));
		} catch (e) {
			errors.push(`${rel}: unreadable/invalid JSON (${e.message})`);
			return null;
		}
	};

	if (!exists('manifest.json')) return { ok: false, errors: ['manifest.json missing'] };
	const manifest = read('manifest.json');
	if (!manifest) return { ok: false, errors };
	errors.push(...validateManifest(manifest).errors);

	// schema version gate
	if (manifest.schemaVersion === undefined) {
		errors.push('manifest.schemaVersion missing (expected one of ' + [...SUPPORTED_SCHEMA].join(',') + ')');
	} else if (!SUPPORTED_SCHEMA.has(manifest.schemaVersion)) {
		errors.push(`manifest.schemaVersion ${manifest.schemaVersion} unsupported (app supports ${[...SUPPORTED_SCHEMA].join(',')})`);
	}

	if (!exists('areas/tracts.json')) errors.push('areas/tracts.json missing');
	const tractsJson = exists('areas/tracts.json') ? read('areas/tracts.json') : [];
	const tractGeoids = new Set((tractsJson || []).map((t) => t.geoid));

	const aggregates = exists('aggregates.json') ? read('aggregates.json') : null;
	if (!exists('aggregates.json')) errors.push('aggregates.json missing');

	for (const ind of manifest.indicators || []) {
		const tag = `indicator ${ind.id}`;
		// metadata
		if (ind.metaPath) {
			const rel = ind.metaPath.replace(/^\/data\//, '');
			if (!exists(rel)) errors.push(`${tag}: meta file missing (${ind.metaPath})`);
		}
		// value file
		const valRel = `values/${ind.id}.json`;
		if (!exists(valRel)) {
			errors.push(`${tag}: value file missing (${valRel})`);
		} else {
			const vf = read(valRel);
			if (vf) {
				if (vf.schemaVersion !== undefined && !SUPPORTED_SCHEMA.has(vf.schemaVersion))
					errors.push(`${tag}: value schemaVersion ${vf.schemaVersion} unsupported`);
				errors.push(...validateValueFile(vf, ind, tractGeoids).errors.map((e) => `${tag}: ${e}`));
			}
		}
		// analytics content (z + lisa): present, year-aligned, quadrants in 0..4, geoids known
		if (ind.hasZ) {
			const rel = `analytics/z/${ind.id}.json`;
			if (!exists(rel)) errors.push(`${tag}: z analytics file missing`);
			else {
				const z = read(rel);
				if (z && JSON.stringify(z.years) !== JSON.stringify(ind.years))
					errors.push(`${tag}: z years ${JSON.stringify(z.years)} != manifest years`);
			}
		}
		if (ind.hasLisa) {
			const rel = `analytics/lisa/${ind.id}.json`;
			if (!exists(rel)) errors.push(`${tag}: lisa analytics file missing`);
			else {
				const l = read(rel);
				if (l) {
					if (JSON.stringify(l.years) !== JSON.stringify(ind.years))
						errors.push(`${tag}: lisa years ${JSON.stringify(l.years)} != manifest years`);
					let badQuad = false;
					for (const arr of Object.values(l.quadrants || {})) {
						if (!Array.isArray(arr)) { badQuad = true; break; }
						for (const q of arr) {
							if (!Number.isInteger(q) || q < 0 || q > 4) { badQuad = true; break; }
						}
						if (badQuad) break;
					}
					if (badQuad) errors.push(`${tag}: lisa quadrant values must be integers 0..4`);
				}
			}
		}
		// aggregates: an entry per indicator, year-aligned, region array matches years length
		if (aggregates) {
			const a = aggregates[String(ind.id)];
			if (!a) errors.push(`${tag}: aggregates entry missing`);
			else {
				if (JSON.stringify(a.years) !== JSON.stringify(ind.years))
					errors.push(`${tag}: aggregates years != manifest years`);
				if (!Array.isArray(a.regionAvg) || a.regionAvg.length !== (ind.years || []).length)
					errors.push(`${tag}: aggregates.regionAvg length != years`);
			}
		}
	}

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
