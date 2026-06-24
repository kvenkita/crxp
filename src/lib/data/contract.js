/**
 * CRXP static data contract — pure validators (no fs).
 * The Phase 2 pipeline must produce data that passes these checks.
 *
 * @typedef {'percent'|'dollar'|'number'|'years'|'rate'} ValueFormat
 *
 * @typedef {Object} Indicator
 * @property {number} id
 * @property {string} slug
 * @property {string} label
 * @property {string} category
 * @property {ValueFormat} format
 * @property {number} [decimals]
 * @property {boolean} [higherIsBetter]
 * @property {string} [colorScheme]
 * @property {string} [classMethod]
 * @property {number[]} years
 * @property {string[]} [geoLevels]
 * @property {string} [source]
 * @property {string} [vintage]
 * @property {string} [metaPath]
 * @property {number[]} [related]
 * @property {boolean} [hasZ]
 * @property {boolean} [hasLisa]
 *
 * @typedef {Object} Manifest
 * @property {{key:string,label:string,order?:number}[]} categories
 * @property {Indicator[]} indicators
 */

export const VALUE_FORMATS = ['percent', 'dollar', 'number', 'years', 'rate'];

/** @returns {{ok:boolean, errors:string[]}} */
export function validateManifest(manifest) {
	const errors = [];
	if (!manifest || typeof manifest !== 'object') {
		return { ok: false, errors: ['manifest must be an object'] };
	}
	if (!Array.isArray(manifest.categories) || manifest.categories.length === 0) {
		errors.push('manifest.categories must be a non-empty array');
	} else {
		manifest.categories.forEach((c, i) => {
			if (!c || typeof c.key !== 'string') errors.push(`categories[${i}].key must be a string`);
			if (!c || typeof c.label !== 'string') errors.push(`categories[${i}].label must be a string`);
		});
	}
	if (!Array.isArray(manifest.indicators) || manifest.indicators.length === 0) {
		errors.push('manifest.indicators must be a non-empty array');
		return { ok: errors.length === 0, errors };
	}

	const catKeys = new Set((manifest.categories || []).map((c) => c.key));
	const seenIds = new Set();
	const seenSlugs = new Set();

	manifest.indicators.forEach((ind, i) => {
		const where = `indicators[${i}]`;
		if (typeof ind.id !== 'number') errors.push(`${where}.id must be a number`);
		else if (seenIds.has(ind.id)) errors.push(`${where}.id duplicate: ${ind.id}`);
		else seenIds.add(ind.id);

		if (typeof ind.slug !== 'string' || !ind.slug) errors.push(`${where}.slug must be a non-empty string`);
		else if (seenSlugs.has(ind.slug)) errors.push(`${where}.slug duplicate: ${ind.slug}`);
		else seenSlugs.add(ind.slug);

		if (typeof ind.label !== 'string' || !ind.label) errors.push(`${where}.label must be a non-empty string`);
		if (typeof ind.category !== 'string') errors.push(`${where}.category must be a string`);
		else if (catKeys.size && !catKeys.has(ind.category))
			errors.push(`${where}.category "${ind.category}" not in categories`);
		if (!VALUE_FORMATS.includes(ind.format)) errors.push(`${where}.format invalid: ${ind.format}`);
		if (!Array.isArray(ind.years) || ind.years.length === 0)
			errors.push(`${where}.years must be a non-empty array`);
	});

	return { ok: errors.length === 0, errors };
}

/**
 * @param {Object} file value file
 * @param {Indicator} indicator manifest entry
 * @param {Set<string>} [validGeoids] geoids allowed (from area manifest)
 * @returns {{ok:boolean, errors:string[]}}
 */
export function validateValueFile(file, indicator, validGeoids) {
	const errors = [];
	if (!file || typeof file !== 'object') return { ok: false, errors: ['value file must be an object'] };

	if (!Array.isArray(file.years) || file.years.length === 0) {
		errors.push('value file years must be a non-empty array');
	}
	if (!file.values || typeof file.values !== 'object') {
		errors.push('value file values must be an object');
	}
	if (!file.stats || typeof file.stats !== 'object') {
		errors.push('value file stats must be an object');
	}

	const years = Array.isArray(file.years) ? file.years : [];

	// every year needs stats with breaks + p1/p99
	for (const y of years) {
		const s = file.stats?.[y];
		if (!s) {
			errors.push(`stats missing for year ${y}`);
			continue;
		}
		if (!Array.isArray(s.breaks) || s.breaks.length === 0)
			errors.push(`stats[${y}].breaks must be a non-empty array`);
		for (const k of ['min', 'max', 'p1', 'p99']) {
			if (typeof s[k] !== 'number') errors.push(`stats[${y}].${k} must be a number`);
		}
	}

	// value rows: array length must match years; geoids must be known
	for (const [geoid, arr] of Object.entries(file.values || {})) {
		if (validGeoids && validGeoids.size && !validGeoids.has(geoid)) {
			errors.push(`value geoid not in area manifest: ${geoid}`);
		}
		if (!Array.isArray(arr) || arr.length !== years.length) {
			errors.push(`values[${geoid}] length ${Array.isArray(arr) ? arr.length : 'n/a'} != years length ${years.length}`);
		}
	}

	return { ok: errors.length === 0, errors };
}
