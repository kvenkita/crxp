import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown.js';

describe('renderMarkdown', () => {
	it('renders headings and links', () => {
		const html = renderMarkdown('## Title\n\nA [link](https://example.com).');
		expect(html).toMatch(/<h2[^>]*>Title<\/h2>/);
		expect(html).toMatch(/<a href="https:\/\/example.com"/);
	});

	it('strips script tags', () => {
		const html = renderMarkdown('ok <script>alert(1)</script> done');
		expect(html).not.toMatch(/<script/i);
		expect(html).toMatch(/ok/);
	});

	it('returns empty for empty input', () => {
		expect(renderMarkdown('')).toBe('');
	});
});
