import { describe, it, expect } from 'vitest';
import { shareUrls, iframeSnippet, EMBED_SIZES } from './embed.js';

describe('shareUrls', () => {
	it('builds absolute explore + embed URLs from the same query string', () => {
		const u = shareUrls('https://example.org', '', 'i=employment&y=2021');
		expect(u.explore).toBe('https://example.org/explore/?i=employment&y=2021');
		expect(u.embed).toBe('https://example.org/embed/?i=employment&y=2021');
	});

	it('omits the ? when the query string is empty', () => {
		const u = shareUrls('https://example.org', '', '');
		expect(u.explore).toBe('https://example.org/explore/');
		expect(u.embed).toBe('https://example.org/embed/');
	});

	it('respects a base path', () => {
		const u = shareUrls('https://example.org', '/crxp', 'i=employment');
		expect(u.explore).toBe('https://example.org/crxp/explore/?i=employment');
		expect(u.embed).toBe('https://example.org/crxp/embed/?i=employment');
	});

	it('staticView appends interactive=0 to the embed URL only', () => {
		const u = shareUrls('https://example.org', '', 'i=employment', { staticView: true });
		expect(u.embed).toBe('https://example.org/embed/?i=employment&interactive=0');
		expect(u.explore).toBe('https://example.org/explore/?i=employment');
		const bare = shareUrls('https://example.org', '', '', { staticView: true });
		expect(bare.embed).toBe('https://example.org/embed/?interactive=0');
	});
});

describe('iframeSnippet', () => {
	it('renders the default 800x450 snippet', () => {
		const s = iframeSnippet('https://example.org/embed/?i=employment');
		expect(s).toBe(
			'<iframe src="https://example.org/embed/?i=employment" width="800" height="450"' +
				' style="border:0" loading="lazy" title="Carolinas Regional Explorer"></iframe>'
		);
	});

	it('escapes & and quotes in attribute values', () => {
		const s = iframeSnippet('https://example.org/embed/?i=a&y=2021', { title: 'A "quoted" title' });
		expect(s).toContain('src="https://example.org/embed/?i=a&amp;y=2021"');
		expect(s).toContain('title="A &quot;quoted&quot; title"');
	});

	it('accepts every size preset', () => {
		for (const p of EMBED_SIZES) {
			const s = iframeSnippet('https://x.y/embed/', { width: p.width, height: p.height });
			expect(s).toContain(`width="${p.width}"`);
			expect(s).toContain(`height="${p.height}"`);
		}
	});
});
