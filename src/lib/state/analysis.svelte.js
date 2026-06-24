/** Analysis-mode state: explore (default) | bivariate | lisa. */
export const analysis = $state({
	/** @type {'explore'|'bivariate'|'lisa'} */ mode: 'explore',
	/** @type {number|null} */ biA: null,
	/** @type {number|null} */ biB: null,
	/** @type {number|null} */ lisaId: null,
	/** active LISA quadrant codes (1=HH,2=LH,3=LL,4=HL) @type {number[]} */
	lisaQuadrants: [1, 2, 3, 4]
});

export function setMode(mode) {
	analysis.mode = mode;
}
export function setBivariate(a, b) {
	analysis.biA = a;
	analysis.biB = b;
}
export function setLisaIndicator(id) {
	analysis.lisaId = id;
}
export function toggleQuadrant(code) {
	analysis.lisaQuadrants = analysis.lisaQuadrants.includes(code)
		? analysis.lisaQuadrants.filter((c) => c !== code)
		: [...analysis.lisaQuadrants, code];
}
