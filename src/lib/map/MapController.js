/**
 * MapController — the single owner of all imperative MapLibre code.
 * Components never touch MapLibre directly; they call these methods.
 * No imports from state slices — data flows in via method args, out via callbacks.
 */
import { buildStepExpression, NO_DATA_COLOR } from './colorScale.js';
import { buildBivariatePaint } from './bivariate.js';
import { LISA_COLORS } from './lisaColors.js';

function buildLisaPaint() {
	return [
		'match',
		['coalesce', ['feature-state', 'q'], 0],
		0, LISA_COLORS[0],
		1, LISA_COLORS[1],
		2, LISA_COLORS[2],
		3, LISA_COLORS[3],
		4, LISA_COLORS[4],
		LISA_COLORS[0]
	];
}

const CARTO = (variant) =>
	['a', 'b', 'c'].map((s) => `https://${s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}{r}.png`);

const ATTRIB = '© <a href="https://openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>';
const OSM_ATTRIB = '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const ESRI_ATTRIB = 'Imagery © <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics';

/** base raster layers per basemap; `labels` (carto labels) is shown over light/satellite. */
const BASEMAPS = {
	light: ['basemap-light'],
	streets: ['basemap-osm'],
	satellite: ['basemap-sat']
};

function baseStyle() {
	return {
		version: 8,
		sources: {
			'carto-base': { type: 'raster', tiles: CARTO('light_nolabels'), tileSize: 256, attribution: ATTRIB },
			'carto-labels': { type: 'raster', tiles: CARTO('light_only_labels'), tileSize: 256 },
			osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: OSM_ATTRIB, maxzoom: 19 },
			'esri-sat': {
				type: 'raster',
				tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
				tileSize: 256,
				attribution: ESRI_ATTRIB,
				maxzoom: 19
			}
		},
		layers: [
			{ id: 'basemap-light', type: 'raster', source: 'carto-base' },
			{ id: 'basemap-osm', type: 'raster', source: 'osm', layout: { visibility: 'none' } },
			{ id: 'basemap-sat', type: 'raster', source: 'esri-sat', layout: { visibility: 'none' } }
		]
	};
}

const FILL_OPACITY = 0.82;

/** Bounding box [[minLng,minLat],[maxLng,maxLat]] of a GeoJSON FeatureCollection. */
function fcBounds(fc) {
	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	const scan = (ring) => {
		for (const [x, y] of ring) {
			if (x < minX) minX = x;
			if (y < minY) minY = y;
			if (x > maxX) maxX = x;
			if (y > maxY) maxY = y;
		}
	};
	for (const f of fc.features) {
		const g = f.geometry;
		if (!g) continue;
		if (g.type === 'Polygon') g.coordinates.forEach(scan);
		else if (g.type === 'MultiPolygon') g.coordinates.forEach((p) => p.forEach(scan));
	}
	return [
		[minX, minY],
		[maxX, maxY]
	];
}

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
		this.fillOpacity = FILL_OPACITY;
		this.overlayVisible = true;
		this.showReliability = true; // hatch tracts flagged 'unreliable' (high CV)
		this.basemap = 'light';
		/** @type {[[number,number],[number,number]]|null} */ this.regionBounds = null;
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
		this.map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'bottom-right');

		await new Promise((resolve) => this.map.on('load', resolve));
		await this._loadData();
		this._addLayers();
		this._addRecenterControl(maplibre);
		this._wireEvents();
		this.recenter(0); // default view: region fits the viewport
		this.ready = true;
		return this;
	}

	async _loadData() {
		const [tracts, counties, places] = await Promise.all([
			fetch(`${this.basePath}/data/geo/tracts.geojson`).then((r) => r.json()),
			fetch(`${this.basePath}/data/geo/counties.geojson`).then((r) => r.json()),
			fetch(`${this.basePath}/data/geo/places.geojson`).then((r) => (r.ok ? r.json() : { type: 'FeatureCollection', features: [] }))
		]);
		this.ids.tract = tracts.features.map((f) => String(f.id ?? f.properties.geoid));
		this.ids.county = counties.features.map((f) => String(f.id ?? f.properties.geoid));
		this.regionBounds = fcBounds(tracts);
		/** geometry lookups for boundary outlines */
		this.geo = { county: counties, place: places };
		this.map.addSource('tract', { type: 'geojson', data: tracts, promoteId: 'geoid' });
		this.map.addSource('county', { type: 'geojson', data: counties, promoteId: 'geoid' });
		this.map.addSource('sel-boundary', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
	}

	_addRecenterControl(maplibre) {
		const ctrl = {
			onAdd: () => {
				const div = document.createElement('div');
				div.className = 'maplibregl-ctrl maplibregl-ctrl-group';
				const btn = document.createElement('button');
				btn.type = 'button';
				btn.title = 'Reset to region view';
				btn.setAttribute('aria-label', 'Reset to region view');
				btn.innerHTML = '⤢';
				btn.style.fontSize = '16px';
				btn.onclick = () => this.recenter();
				div.appendChild(btn);
				return div;
			},
			onRemove: () => {}
		};
		this.map.addControl(ctrl, 'bottom-right');
	}

	/** Fit the map to the region's bounds (the default view). */
	recenter(duration = 600) {
		if (!this.map || !this.regionBounds) return;
		this.map.fitBounds(this.regionBounds, { padding: { top: 16, bottom: 16, left: 24, right: 24 }, duration });
	}

	_opacityExpr() {
		return [
			'case',
			['boolean', ['feature-state', 'dim'], false],
			Math.min(0.1, this.fillOpacity),
			['boolean', ['feature-state', 'present'], false],
			this.fillOpacity,
			0
		];
	}

	/** Generate a small diagonal-hatch pattern image for flagging unreliable tracts. */
	_addHatchImage() {
		if (this.map.hasImage?.('hatch')) return;
		const s = 8;
		const c = document.createElement('canvas');
		c.width = c.height = s;
		const ctx = c.getContext('2d');
		ctx.clearRect(0, 0, s, s);
		ctx.strokeStyle = 'rgba(35,25,25,0.6)';
		ctx.lineWidth = 1.1;
		for (let off = -s; off <= s; off += 4) {
			ctx.beginPath();
			ctx.moveTo(off, s);
			ctx.lineTo(off + s, 0);
			ctx.stroke();
		}
		const img = ctx.getImageData(0, 0, s, s);
		this.map.addImage('hatch', { width: s, height: s, data: img.data }, { pixelRatio: 2 });
	}

	_addLayers() {
		const opacityExpr = this._opacityExpr();
		this._addHatchImage();
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
			// uncertainty hatch: shown only on tracts flagged 'unreliable' (driven by feature-state)
			this.map.addLayer({
				id: `${level}-hatch`,
				type: 'fill',
				source: level,
				layout: { visibility: 'none' },
				paint: {
					'fill-pattern': 'hatch',
					'fill-opacity': ['case', ['boolean', ['feature-state', 'unreliable'], false], 0.85, 0],
					'fill-opacity-transition': { duration: 200 }
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
		// selected county/city boundary outline (top-most)
		this.map.addLayer({
			id: 'sel-boundary-line',
			type: 'line',
			source: 'sel-boundary',
			paint: { 'line-color': '#5b2a4e', 'line-width': 3, 'line-opacity': 0.95 }
		});
	}

	/** Outline a county/city by geoid and zoom to it (keeps the tract overlay beneath). */
	showBoundary(level, geoid) {
		if (!this.ready) return;
		const fc = this.geo?.[level];
		const feature = fc?.features.find((f) => String(f.id ?? f.properties.geoid) === String(geoid));
		if (!feature) return;
		this.map.getSource('sel-boundary').setData({ type: 'FeatureCollection', features: [feature] });
		this.flyToBbox(fcBounds({ features: [feature] }).flat());
	}

	clearBoundary() {
		if (!this.ready) return;
		this.map.getSource('sel-boundary')?.setData({ type: 'FeatureCollection', features: [] });
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
		this._applyVisibility();
	}

	_applyVisibility() {
		for (const l of ['tract', 'county']) {
			const active = l === this.geoLevel;
			const overlay = active && this.overlayVisible ? 'visible' : 'none';
			this.map.setLayoutProperty(`${l}-fill`, 'visibility', overlay);
			this.map.setLayoutProperty(`${l}-outline`, 'visibility', overlay);
			this.map.setLayoutProperty(`${l}-highlight`, 'visibility', active ? 'visible' : 'none');
		}
		this._updateHatch();
	}

	/** Hatch is shown only in explore mode, on the active level, when the overlay + flag are on. */
	_updateHatch() {
		for (const l of ['tract', 'county']) {
			if (!this.map.getLayer?.(`${l}-hatch`)) continue;
			const vis =
				l === this.geoLevel && this.overlayVisible && this.showReliability && this.mode === 'explore'
					? 'visible'
					: 'none';
			this.map.setLayoutProperty(`${l}-hatch`, 'visibility', vis);
		}
	}

	/** Toggle the unreliable-tract hatch overlay. */
	setReliabilityVisible(v) {
		this.showReliability = !!v;
		this._updateHatch();
	}

	/** Switch basemap: 'light' | 'streets' | 'satellite'. */
	setBasemap(name) {
		if (!this.ready || !BASEMAPS[name]) return;
		this.basemap = name;
		for (const [key, layers] of Object.entries(BASEMAPS)) {
			const vis = key === name ? 'visible' : 'none';
			for (const id of layers) this.map.setLayoutProperty(id, 'visibility', vis);
		}
		// carto labels read well over light & satellite, but OSM has its own labels
		this.map.setLayoutProperty('labels', 'visibility', name === 'streets' ? 'none' : 'visible');
	}

	/** Overlay (choropleth) fill opacity, 0..1. */
	setOverlayOpacity(o) {
		if (!this.ready) return;
		this.fillOpacity = Math.max(0, Math.min(1, o));
		for (const l of ['tract', 'county']) this.map.setPaintProperty(`${l}-fill`, 'fill-opacity', this._opacityExpr());
	}

	/** Show/hide the data overlay (reveals the basemap underneath). */
	setOverlayVisible(v) {
		this.overlayVisible = !!v;
		this._applyVisibility();
	}

	/**
	 * Join values to features for the active level and repaint.
	 * @param {Record<string, number|null>} valuesByGeoid
	 * @param {number[]} breaks
	 * @param {string[]} colors
	 */
	applyChoropleth(valuesByGeoid, breaks, colors, reliabilityByGeoid = null) {
		if (!this.ready) return;
		const level = this.geoLevel;
		for (const id of this.ids[level]) {
			const v = valuesByGeoid[id];
			const unreliable = reliabilityByGeoid?.[id] === 'unreliable';
			if (v == null || Number.isNaN(v)) this._setState(level, id, { v: 0, present: false, dim: false, unreliable });
			else this._setState(level, id, { v, present: true, dim: false, unreliable });
		}
		this.map.setPaintProperty(`${level}-fill`, 'fill-color', buildStepExpression(breaks, colors));
		this.mode = 'explore';
		this._updateHatch();
	}

	/**
	 * Bivariate mode: paint the 3×3 matrix from two tercile-class maps.
	 * @param {Record<string,number|null>} classesA
	 * @param {Record<string,number|null>} classesB
	 * @param {string[][]} matrix
	 */
	setBivariateMode(classesA, classesB, matrix) {
		if (!this.ready) return;
		const level = this.geoLevel;
		this._bivar = { classesA, classesB, level };
		for (const id of this.ids[level]) {
			const ca = classesA[id];
			const cb = classesB[id];
			const present = ca != null && cb != null;
			this._setState(level, id, { za: ca ?? 0, zb: cb ?? 0, present, dim: false });
		}
		this.map.setPaintProperty(`${level}-fill`, 'fill-color', buildBivariatePaint(matrix));
		this.mode = 'bivariate';
		this._updateHatch();
	}

	/**
	 * Dim all tracts except those matching a 3×3 cell (class a of var A, class b of var B).
	 * Pass (null) to clear.
	 */
	setBivariateFilter(a, b) {
		if (!this.ready || !this._bivar) return;
		const { classesA, classesB, level } = this._bivar;
		const filtering = a != null && b != null;
		for (const id of this.ids[level]) {
			const dim = filtering && !(classesA[id] === a && classesB[id] === b);
			this._setState(level, id, { dim });
		}
	}

	/**
	 * Spatial-cluster (LISA) mode: color by quadrant, dim deselected quadrants.
	 * @param {Record<string,number>} quadByGeoid quadrant 0..4
	 * @param {number[]} activeQuadrants which quadrants to highlight (1..4)
	 */
	setLisaMode(quadByGeoid, activeQuadrants) {
		if (!this.ready) return;
		const level = this.geoLevel;
		const active = new Set(activeQuadrants);
		for (const id of this.ids[level]) {
			const q = quadByGeoid[id] ?? 0;
			this._setState(level, id, { q, present: true, dim: !active.has(q) });
		}
		this.map.setPaintProperty(`${level}-fill`, 'fill-color', buildLisaPaint());
		this.mode = 'lisa';
		this._updateHatch();
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

	/** Highlight a set of selected geoids (clears any previously selected). */
	setSelectedIds(ids = []) {
		if (!this.ready) return;
		const level = this.geoLevel;
		const prev = this._selectedIds || [];
		for (const id of prev) this._setState(level, id, { selected: false });
		this._selectedIds = [...ids];
		for (const id of ids) this._setState(level, id, { selected: true });
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
