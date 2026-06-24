/**
 * Build-time Open Graph cards (1200×630) for each county profile.
 * Uses @napi-rs/canvas. OG cards are non-critical: failures are logged, not fatal.
 *
 * Run:  node scripts/build-og.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'static', 'data');
const OUT = path.join(ROOT, 'static', 'og', 'county');

const read = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

async function main() {
	let createCanvas;
	try {
		({ createCanvas } = await import('@napi-rs/canvas'));
	} catch (e) {
		console.warn('build-og: @napi-rs/canvas unavailable, skipping OG cards:', e.message);
		return;
	}

	fs.mkdirSync(OUT, { recursive: true });
	const counties = read('areas/counties.json');
	const manifest = read('manifest.json');
	const aggregates = read('aggregates.json');

	// region bbox for the locator
	let R = [Infinity, Infinity, -Infinity, -Infinity];
	for (const c of counties)
		if (c.bbox) R = [Math.min(R[0], c.bbox[0]), Math.min(R[1], c.bbox[1]), Math.max(R[2], c.bbox[2]), Math.max(R[3], c.bbox[3])];

	const W = 1200, H = 630;
	const PLUM = '#5b2a4e', TEAL = '#1f6f63', SAND = '#f3ead9', BG = '#faf8f5', INK = '#1f1a17', GREY = '#d8d2c7';

	for (const county of counties) {
		const canvas = createCanvas(W, H);
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = BG;
		ctx.fillRect(0, 0, W, H);
		ctx.fillStyle = SAND;
		ctx.fillRect(0, 0, W, 12);
		ctx.fillStyle = TEAL;
		ctx.fillRect(0, 0, 12, H);

		ctx.fillStyle = TEAL;
		ctx.font = '600 26px Georgia, serif';
		ctx.fillText('CAROLINAS REGIONAL EXPLORER', 70, 90);

		ctx.fillStyle = INK;
		ctx.font = '700 84px Georgia, serif';
		ctx.fillText(county.name, 66, 200);

		ctx.fillStyle = '#4d463f';
		ctx.font = '400 34px Georgia, serif';
		ctx.fillText(`${county.tractCount} Census tracts · ${county.state}`, 70, 260);

		// a few headline indicators
		const picks = manifest.indicators.slice(0, 3);
		let y = 360;
		for (const ind of picks) {
			const agg = aggregates[ind.id];
			const li = (agg?.years?.length ?? 1) - 1;
			const v = agg?.countyAvg?.[county.fips]?.[li];
			const val = v == null ? '—' : `${v.toFixed(1)}%`;
			ctx.fillStyle = PLUM;
			ctx.font = '700 48px Georgia, serif';
			ctx.fillText(val, 70, y);
			ctx.fillStyle = '#756c61';
			ctx.font = '400 26px Georgia, serif';
			ctx.fillText(ind.label, 250, y - 6);
			y += 70;
		}

		// locator (right side)
		const bx = 760, by = 320, bw = 380, bh = 260;
		const rw = R[2] - R[0] || 1, rh = R[3] - R[1] || 1;
		const s = Math.min(bw / rw, bh / rh);
		const ox = bx + (bw - rw * s) / 2, oy = by + (bh - rh * s) / 2;
		for (const c of counties) {
			if (!c.bbox) continue;
			const x = ox + (c.bbox[0] - R[0]) * s;
			const yy = oy + (R[3] - c.bbox[3]) * s;
			const w = (c.bbox[2] - c.bbox[0]) * s;
			const h = (c.bbox[3] - c.bbox[1]) * s;
			ctx.fillStyle = c.fips === county.fips ? TEAL : GREY;
			ctx.fillRect(x, yy, Math.max(1, w - 2), Math.max(1, h - 2));
		}

		const png = canvas.encodeSync ? canvas.encodeSync('png') : await canvas.encode('png');
		fs.writeFileSync(path.join(OUT, `${county.fips}.png`), png);
	}
	console.log(`build-og: wrote ${counties.length} county OG cards`);
}

main();
