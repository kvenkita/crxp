/**
 * Analysis-mode state: explore (default) | bivariate | lisa.
 * The PRIMARY indicator is shared with the explorer slice (explorer.indicatorId):
 * it is variable A in bivariate and the indicator in the cluster map. Only the
 * second bivariate variable (biB) is held here.
 */
export const analysis = $state({
	/** @type {'explore'|'bivariate'|'lisa'} */ mode: 'explore',
	/** second bivariate variable @type {number|null} */ biB: null,
	/** active LISA quadrant codes (1=HH,2=LH,3=LL,4=HL) @type {number[]} */
	lisaQuadrants: [1, 2, 3, 4]
});

export function setMode(mode) {
	analysis.mode = mode;
}
export function setBivariateB(b) {
	analysis.biB = b;
}
export function toggleQuadrant(code) {
	analysis.lisaQuadrants = analysis.lisaQuadrants.includes(code)
		? analysis.lisaQuadrants.filter((c) => c !== code)
		: [...analysis.lisaQuadrants, code];
}
