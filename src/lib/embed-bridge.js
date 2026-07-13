// Cross-origin state bridge for when this app runs inside the container site's
// iframe (https://carolinasregionalexplorer.com/map embeds /explore/?topnav=1).
// The container and this app are on different origins, so the container can't
// read this iframe's URL. We postMessage the user-facing query string to the
// parent on every change so it can mirror our state into its own address bar,
// making /map?... URLs shareable and deep-linkable. Emitter only — the parent
// deep-links back in by appending the query string to the iframe src, which the
// app already restores from its URL on load, so no inbound listener is needed.

// Query params that are embed plumbing, not user-facing map state. Dropped from
// the broadcast search string so only the shareable indicator + map-position
// state reaches the container's address bar.
const EMBED_PARAMS = ['topnav'];

// Origins allowed to receive state messages. postMessage's targetOrigin is a
// security boundary, so we only ever hand it an exact origin from this list
// (or the '*' fallback below) — never an unverified parent origin.
const ALLOWED_STATIC = new Set([
	'https://carolinasregionalexplorer.com', // production container
	'http://localhost:1111', // container dev server
	'http://127.0.0.1:1111'
]);

// Netlify deploy previews: https://<deploy-context>--<site>.netlify.app
const NETLIFY_PREVIEW = /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/;

/** @param {string} origin */
function isAllowedOrigin(origin) {
	return ALLOWED_STATIC.has(origin) || NETLIFY_PREVIEW.test(origin);
}

/**
 * Filtered copy of `params` with embed-only flags removed, serialized with the
 * leading `?` (empty string when nothing remains).
 * @param {URLSearchParams} params
 * @returns {string}
 */
export function stripEmbedParams(params) {
	const clean = new URLSearchParams(params);
	for (const p of EMBED_PARAMS) clean.delete(p);
	const qs = clean.toString();
	return qs ? `?${qs}` : '';
}

/**
 * The exact origin to post to: the parent origin when it's on the allowlist,
 * otherwise `'*'`. We resolve the parent from `ancestorOrigins` (or the
 * referrer) and fall back to `'*'` when it can't be verified — the payload is
 * non-sensitive, so a broadcast is acceptable, but we never target an
 * unverified origin string directly.
 * @returns {string}
 */
export function resolveTarget() {
	let origin;
	try {
		const ancestors = window.location.ancestorOrigins;
		if (ancestors && ancestors.length) {
			origin = ancestors[0];
		} else if (document.referrer) {
			origin = new URL(document.referrer).origin;
		}
	} catch {
		origin = undefined;
	}
	return origin && isAllowedOrigin(origin) ? origin : '*';
}

/**
 * Post the given search string to the parent window as a `crxp:state` message.
 * Caller must ensure the app is embedded and dedupe repeated values.
 * @param {string} search
 */
export function postState(search) {
	window.parent.postMessage({ type: 'crxp:state', search }, resolveTarget());
}
