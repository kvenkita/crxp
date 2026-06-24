/** Viewing-lens state: which indicator/year/geo level/basemap is shown. */
export const explorer = $state({
	/** @type {number|null} */ indicatorId: null,
	/** @type {number|null} */ year: null,
	/** @type {'tract'|'county'} */ geoLevel: 'tract',
	/** @type {'light'|'satellite'} */ basemap: 'light'
});

export function setIndicator(id) {
	explorer.indicatorId = id;
}
export function setYear(y) {
	explorer.year = y;
}
export function setGeoLevel(level) {
	explorer.geoLevel = level;
}
export function setBasemap(b) {
	explorer.basemap = b;
}
