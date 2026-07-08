/**
 * Pure builders for the Share/Embed dialog: absolute share + embed URLs from
 * the explorer's current query string, and the copy-able <iframe> snippet.
 */

/** Size presets offered by the dialog. 'Responsive' fills the host's width. */
export const EMBED_SIZES = [
	{ id: 'small', label: 'Small', width: '600', height: '400' },
	{ id: 'medium', label: 'Medium', width: '800', height: '450' },
	{ id: 'large', label: 'Large', width: '1000', height: '560' },
	{ id: 'responsive', label: 'Responsive', width: '100%', height: '500' }
];

/**
 * Absolute /explore and /embed URLs for the current view.
 * @param {string} origin e.g. location.origin
 * @param {string} basePath SvelteKit base ('' or '/subpath')
 * @param {string} qs current explorer query string, without '?'
 * @param {{staticView?: boolean, nav?: boolean}} [opts] embed-URL-only flags:
 *   staticView appends interactive=0; nav appends nav=1 (indicator side navigation)
 */
export function shareUrls(origin, basePath, qs, opts = {}) {
	const extras = [];
	if (opts.staticView) extras.push('interactive=0');
	if (opts.nav) extras.push('nav=1');
	const embedQs = [qs, ...extras].filter(Boolean).join('&');
	return {
		explore: `${origin}${basePath}/explore/${qs ? `?${qs}` : ''}`,
		embed: `${origin}${basePath}/embed/${embedQs ? `?${embedQs}` : ''}`
	};
}

/**
 * The <iframe> snippet users paste into their page.
 * @param {string} embedUrl absolute /embed URL
 * @param {{width?: string, height?: string, title?: string}} [opts]
 */
export function iframeSnippet(embedUrl, opts = {}) {
	const { width = '800', height = '450', title = 'Carolinas Regional Explorer' } = opts;
	/** @param {string} s */
	const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
	return (
		`<iframe src="${esc(embedUrl)}" width="${esc(width)}" height="${esc(height)}"` +
		` style="border:0" loading="lazy" title="${esc(title)}"></iframe>`
	);
}
