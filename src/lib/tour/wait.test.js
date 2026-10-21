import { describe, it, expect, afterEach } from 'vitest';
import { waitFor } from './wait.js';

const visible = () => true;
afterEach(() => (document.body.innerHTML = ''));

describe('waitFor', () => {
	it('resolves at once when the element is there', async () => {
		document.body.innerHTML = '<div data-tour="x"></div>';
		expect(await waitFor('[data-tour="x"]', { visible })).toBe(document.querySelector('[data-tour="x"]'));
	});
	it('resolves when the element appears later', async () => {
		setTimeout(() => (document.body.innerHTML = '<div data-tour="late"></div>'), 30);
		const el = await waitFor('[data-tour="late"]', { visible, timeout: 1000 });
		expect(el?.getAttribute('data-tour')).toBe('late');
	});
	it('resolves null after the timeout', async () => {
		expect(await waitFor('[data-tour="never"]', { visible, timeout: 60 })).toBe(null);
	});
	it('ignores elements that are not visible', async () => {
		document.body.innerHTML = '<div data-tour="hidden"></div>';
		expect(await waitFor('[data-tour="hidden"]', { visible: () => false, timeout: 60 })).toBe(null);
	});
});
