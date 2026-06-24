/**
 * Build sitemap.xml + robots.txt from the route set and data manifests.
 * Run:  node scripts/build-sitemap.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'static', 'data');
const STATIC = path.join(ROOT, 'static');

const SITE = process.env.PUBLIC_SITE_URL || 'https://carolinasregionalexplorer.org';
const read = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

const urls = ['/', '/explore/', '/indicators/', '/methods/', '/about/', '/data/'];

for (const i of read('manifest.json').indicators) urls.push(`/indicators/${i.slug}/`);
for (const c of read('areas/counties.json')) urls.push(`/county/${c.fips}/`);
try {
	for (const p of read('areas/places.json')) urls.push(`/place/${p.fips ?? p.geoid}/`);
} catch {
	/* no places */
}

const body = urls
	.map((u) => `  <url><loc>${SITE}${u}</loc></url>`)
	.join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

fs.writeFileSync(path.join(STATIC, 'sitemap.xml'), xml);
fs.writeFileSync(
	path.join(STATIC, 'robots.txt'),
	`User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`
);
console.log(`build-sitemap: ${urls.length} URLs`);
