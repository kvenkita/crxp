import { describe, it, expect } from 'vitest';
import { baseStyle } from './MapController.js';

/** @returns {{ sources: Record<string, any>, layers: any[] }} */
const style = () => baseStyle();

/** Every raster tile URL template declared by the base style. */
const tileUrls = () => Object.values(style().sources).flatMap((s) => s.tiles ?? []);

describe('baseStyle basemap tiles', () => {
	it('requests no CARTO basemap tiles', () => {
		// CARTO retired keyless access to basemaps.cartocdn.com: those requests
		// still return HTTP 200, but the PNG has an "API KEY REQUIRED /
		// carto.com/basemaps/apikey" watermark burned into it, so there is no
		// error to detect at runtime — it just silently defaces the map.
		expect(tileUrls().filter((u) => u.includes('cartocdn.com'))).toEqual([]);
	});

	it('requests no tiles that need a key, token, or credential', () => {
		// This is a static site with no server to proxy a secret through, so a keyed
		// provider would ship its credential readable in the client bundle. Keep every
		// tile source keyless rather than publish a key that can be lifted and spent.
		for (const url of tileUrls()) {
			expect(url).not.toMatch(/api[-_]?key|access[-_]?token|\bkey=/i);
		}
	});

	it('serves every tile source over https', () => {
		for (const url of tileUrls()) expect(url).toMatch(/^https:\/\//);
	});

	it('declares a labels source and a base source for the light basemap', () => {
		const { sources, layers } = style();
		const lightLayer = layers.find((l) => l.id === 'basemap-light');
		expect(lightLayer).toBeDefined();
		expect(sources[lightLayer?.source]).toBeDefined();
		// The `labels` overlay layer is added separately in MapController.addLayers();
		// its source must exist in the base style for that to work.
		expect(sources['label-overlay']).toBeDefined();
	});

	it('attributes every basemap source it renders', () => {
		const { sources, layers } = style();
		for (const layer of layers) {
			expect(sources[layer.source].attribution).toBeTruthy();
		}
	});
});
