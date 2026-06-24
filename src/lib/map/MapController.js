/**
 * MapController — the single owner of all imperative MapLibre code.
 * Components never touch MapLibre directly; they call these methods.
 * No imports from state slices — data flows in via method args, out via callbacks.
 */
import { buildStepExpression, NO_DATA_COLOR } from './colorScale.js';

const CARTO = (variant) =>
	['a', 'b', 'c'].map((s) => `https://${s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}{r}.png`);

const ATTRIB = '© <a href="https://openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>';

function baseStyle() {
	return {
		version: 8,
		sources: {
			'carto-base': { type: 'raster', tiles: CARTO('light_nolabels'), tileSize: 256, attribution: ATTRIB },
			'carto-labels': { type: 'raster', tiles: CARTO('light_only_labels'), tileSize: 256 }
		},
		layers: [{ id: 'basemap', type: 'raster', source: 'carto-base' }]
	};
}

const FILL_OPACITY = 0.82;

export class MapController {
	/**
	 * @param {HTMLElement} container
	 * @param {{center?:[number,number], zoom?:number, callbacks?:object, basePath?:string}} opts
	 */
	constructor(container, opts = {}) {
		this.container = container;
		this.center = opts.center ?? [-80.9, 35.3];
		this.zoom = opts.zoom ?? 7.2;
		this.basePath = opts.basePath ?? '';
		/** updated imperatively by MapView so handlers never go stale */
		this.callbacks = opts.callbacks ?? {};
		this.map = null;
		this.ready = false;
		this.mode = 'explore';
		this.geoLevel = 'tract';
		/** @type {Record<string,string[]>} ids per source */
		this.ids = { tract: [], county: [] };
		this._maplibre = null;
	}

	async init() {
		const maplibre = (await import('maplibre-gl')).default;
		this._maplibre = maplibre;
		this.map = new maplibre.Map({
			container: this.container,
			style: baseStyle(),
			center: this.center,
			zoom: this.zoom,
			minZoom: 5,
			maxZoom: 14,
			attributionControl: { compact: true }
		});
		this.map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');

		await new Promise((resolve) => this.map.on('load', resolve));
		await this._loadData();
		this._addLayers();
		this._wireEvents();
		this.ready = true;
		return this;
	}

	async _loadData() {
		const [tracts, counties] = await Promise.all([
			fetch(`${this.basePath}/data/geo/tracts.geojson`).then((r) => r.json()),
			fetch(`${this.basePath}/data/geo/counties.geojson`).then((r) => r.json())
		]);
		this.ids.tract = tracts.features.map((f) => String(f.id ?? f.properties.geoid));
		this.ids.county = counties.features.map((f) => String(f.id ?? f.properties.geoid));
		this.map.addSource('tract', { type: 'geojson', data: tracts, promoteId: 'geoid' });
		this.map.addSource('county', { type: 'geojson', data: counties, promoteId: 'geoid' });
	}

	_addLayers() {
		const opacityExpr = [
			'case',
			['boolean', ['feature-state', 'dim'], false],
			0.1,
			['boolean', ['feature-state', 'present'], false],
			FILL_OPACITY,
			0
		];
		for (const level of ['tract', 'county']) {
			const visible = level === this.geoLevel ? 'visible' : 'none';
			this.map.addLayer({
				id: `${level}-fill`,
				type: 'fill',
				source: level,
				layout: { visibility: visible },
				paint: {
					'fill-color': NO_DATA_COLOR,
					'fill-opacity': opacityExpr,
					'fill-opacity-transition': { duration: 280 }
				}
			});
			this.map.addLayer({
				id: `${level}-outline`,
				type: 'line',
				source: level,
				layout: { visibility: visible },
				paint: {
					'line-color': '#7b756c',
					'line-width': level === 'county' ? 1.1 : 0.35,
					'line-opacity': 0.5
				}
			});
			this.map.addLayer({
				id: `${level}-highlight`,
				type: 'line',
				source: level,
				layout: { visibility: visible },
				paint: {
					'line-color': '#1f1a17',
					'line-width': [
						'case',
						['boolean', ['feature-state', 'selected'], false], 3,
						['boolean', ['feature-state', 'hover'], false], 1.6,
						0
					],
					'line-opacity': 1
				}
			});
		}
		// labels above everything
		this.map.addLayer({ id: 'labels', type: 'raster', source: 'carto-labels' });
	}

	_wireEvents() {
		let hoveredId = null;
		for (const level of ['tract', 'county']) {
			this.map.on('mousemove', `${level}-fill`, (e) => {
				if (level !== this.geoLevel || !e.features?.length) return;
				const id = String(e.features[0].id);
				if (hoveredId && hoveredId !== id) this._setState(level, hoveredId, { hover: false });
				hoveredId = id;
				this._setState(level, id, { hover: true });
				this.map.getCanvas().style.cursor = 'pointer';
				this.callbacks.onHover?.(id, e.lngLat);
			});
			this.map.on('mouseleave', `${level}-fill`, () => {
				if (hoveredId) this._setState(level, hoveredId, { hover: false });
				hoveredId = null;
				this.map.getCanvas().style.cursor = '';
				this.callbacks.onHover?.(null);
			});
			this.map.on('click', `${level}-fill`, (e) => {
				if (level !== this.geoLevel || !e.features?.length) return;
				this.callbacks.onSelect?.(String(e.features[0].id));
			});
		}
	}

	_setState(level, id, state) {
		if (!this.map.getSource(level)) return;
		this.map.setFeatureState({ source: level, id }, state);
	}

	// ---------- public API ----------

	setGeoLevel(level) {
		if (!this.ready || level === this.geoLevel) return;
		this.geoLevel = level;
		for (const l of ['tract', 'county']) {
			const vis = l === level ? 'visible' : 'none';
			for (const suffix of ['fill', 'outline', 'highlight']) {
				this.map.setLayoutProperty(`${l}-${suffix}`, 'visibility', vis);
			}
		}
	}

	/**
	 * Join values to features for the active level and repaint.
	 * @param {Record<string, number|null>} valuesByGeoid
	 * @param {number[]} breaks
	 * @param {string[]} colors
	 */
	applyChoropleth(valuesByGeoid, breaks, colors) {
		if (!this.ready) return;
		const level = this.geoLevel;
		for (const id of this.ids[level]) {
			const v = valuesByGeoid[id];
			if (v == null || Number.isNaN(v)) this._setState(level, id, { v: 0, present: false, dim: false });
			else this._setState(level, id, { v, present: true, dim: false });
		}
		this.map.setPaintProperty(`${level}-fill`, 'fill-color', buildStepExpression(breaks, colors));
		this.mode = 'explore';
	}

	/** Dim features whose value falls outside [min,max]; null clears. */
	setLegendFilter(range, valuesByGeoid) {
		if (!this.ready) return;
		const level = this.geoLevel;
		for (const id of this.ids[level]) {
			const v = valuesByGeoid[id];
			const dim = range && v != null && !(v >= range.min && v <= range.max);
			this._setState(level, id, { dim: !!dim });
		}
	}

	setSelected(geoid) {
		if (!this.ready) return;
		const level = this.geoLevel;
		if (this._selected) this._setState(level, this._selected, { selected: false });
		this._selected = geoid;
		if (geoid) this._setState(level, geoid, { selected: true });
	}

	flyToBbox(bbox, opts = {}) {
		if (!this.ready || !bbox) return;
		this.map.fitBounds(
			[
				[bbox[0], bbox[1]],
				[bbox[2], bbox[3]]
			],
			{ padding: 60, duration: 700, maxZoom: 12, ...opts }
		);
	}

	resize() {
		this.map?.resize();
	}

	destroy() {
		this.map?.remove();
		this.map = null;
		this.ready = false;
	}
}
