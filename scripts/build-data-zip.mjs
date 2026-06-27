/**
 * Prebuild downloadable data artifacts from the static data contract:
 *   static/downloads/csv/<slug>.csv     long-format values per indicator
 *   static/downloads/data-dictionary.csv
 *   static/downloads/README.txt
 *   static/downloads/crxp-data.zip      the complete bundle (all of the above)
 *
 * Runs as part of `npm run build`, so these refresh every time the data is rebuilt.
 * Output is git-ignored (a build artifact, like static/og and static/sitemap.xml).
 *
 * Run:  node scripts/build-data-zip.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'static', 'data');
const OUT = path.join(ROOT, 'static', 'downloads');
const CSV_DIR = path.join(OUT, 'csv');

const read = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

const csvEsc = (s) => {
	s = String(s ?? '');
	return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const cell = (x) => (x == null || (typeof x === 'number' && Number.isNaN(x)) ? '' : x);

/** Long-format CSV for one indicator's value file. */
function fileToCsv(file) {
	const years = file.years || [];
	const out = ['geoid,year,value,moe,cv,reliability'];
	for (const geoid of Object.keys(file.values || {})) {
		const v = file.values[geoid] || [];
		const m = file.moe?.[geoid] || [];
		const c = file.cv?.[geoid] || [];
		const r = file.reliability?.[geoid] || [];
		years.forEach((y, i) => {
			out.push([geoid, y, cell(v[i]), cell(m[i]), cell(c[i]), cell(r[i])].join(','));
		});
	}
	return out.join('\n') + '\n';
}

function dictionaryCsv(indicators) {
	const out = ['id,slug,label,dimension,format,source,vintage,first_year,last_year'];
	for (const i of indicators) {
		out.push([
			i.id, i.slug, csvEsc(i.label), i.category, i.format,
			csvEsc(i.source), csvEsc(i.vintage), i.years?.[0] ?? '', i.years?.at(-1) ?? ''
		].join(','));
	}
	return out.join('\n') + '\n';
}

function readme(year) {
	return [
		'Carolinas Regional Explorer — data download',
		`Carolinas Regional Explorer · UNC Charlotte Urban Institute · ${year}`,
		'',
		'Contents:',
		'  data-dictionary.csv   catalog of every indicator (id, label, dimension, source, vintage)',
		'  csv/<indicator>.csv   long-format values per indicator:',
		'      geoid, year, value, moe, cv, reliability',
		'      moe = 90% margin of error; cv = coefficient of variation (%);',
		'      reliability = ok / caution / unreliable; blank where not applicable.',
		'',
		'Geography: 2020 U.S. Census tracts, 14-county Charlotte region.',
		'Sources: U.S. Census ACS 5-Year, CDC PLACES, USGS NLCD, EOG VIIRS.',
		'Indicator data is public-domain; neighborhood names © OpenStreetMap contributors (ODbL).',
		'See the Methods page for methodology and limitations.',
		''
	].join('\n');
}

async function main() {
	const manifest = read('manifest.json');
	const indicators = manifest.indicators;
	const year = new Date().getFullYear();

	fs.rmSync(OUT, { recursive: true, force: true });
	fs.mkdirSync(CSV_DIR, { recursive: true });

	const zip = new JSZip();
	const dict = dictionaryCsv(indicators);
	const rdme = readme(year);
	fs.writeFileSync(path.join(OUT, 'data-dictionary.csv'), dict);
	fs.writeFileSync(path.join(OUT, 'README.txt'), rdme);
	zip.file('data-dictionary.csv', dict);
	zip.file('README.txt', rdme);
	const csvFolder = zip.folder('csv');

	for (const ind of indicators) {
		const file = read(`values/${ind.id}.json`);
		const csv = fileToCsv(file);
		fs.writeFileSync(path.join(CSV_DIR, `${ind.slug}.csv`), csv);
		csvFolder.file(`${ind.slug}.csv`, csv);
	}

	const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
	fs.writeFileSync(path.join(OUT, 'crxp-data.zip'), buf);

	const mb = (buf.length / 1024 / 1024).toFixed(1);
	console.log(`build-data-zip: ${indicators.length} indicator CSVs + dictionary -> crxp-data.zip (${mb} MB)`);
}

main();
