import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

/**
 * Render a trusted markdown string (our own indicator metadata) to HTML.
 * Sanitizes in DOM environments (browser/jsdom); on the server (prerender)
 * the content is authored by us, so a light <script> strip suffices.
 * @param {string} md
 * @returns {string}
 */
export function renderMarkdown(md) {
	if (!md) return '';
	const html = String(marked.parse(md));
	if (typeof window !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
		return DOMPurify.sanitize(html);
	}
	return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}
