/**
 * True when the element takes up space on screen (hidden panels measure 0 × 0).
 * @param {Element} el
 */
export function isVisible(el) {
	const r = el.getBoundingClientRect();
	return r.width > 0 && r.height > 0;
}

/**
 * Resolve with the first visible element matching `selector`, or null after `timeout` ms.
 * Watches DOM changes and also polls, because some panels appear through a CSS class change.
 * @param {string} selector
 * @param {{ timeout?: number, visible?: (el: Element) => boolean, root?: Document }} [opts]
 * @returns {Promise<Element | null>}
 */
export function waitFor(selector, { timeout = 6000, visible = isVisible, root = document } = {}) {
	return new Promise((resolve) => {
		const find = () => {
			const el = root.querySelector(selector);
			return el && visible(el) ? el : null;
		};
		const first = find();
		if (first) return resolve(first);
		/** @type {MutationObserver} */
		let obs;
		/** @param {Element | null} el */
		const done = (el) => {
			obs.disconnect();
			clearTimeout(timer);
			clearInterval(poll);
			resolve(el);
		};
		obs = new MutationObserver(() => {
			const el = find();
			if (el) done(el);
		});
		obs.observe(root.body ?? root, { childList: true, subtree: true, attributes: true });
		const poll = setInterval(() => {
			const el = find();
			if (el) done(el);
		}, 150);
		const timer = setTimeout(() => done(null), timeout);
	});
}
