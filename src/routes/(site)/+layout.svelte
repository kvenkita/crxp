<script>
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { browser } from '$app/environment';

	let { children } = $props();

	// Brand-less "embed view" of any site page: inside an iframe or with an explicit
	// ?topnav=1 the site drops its brand logo + title — the host page carries the
	// branding, the frame keeps the nav.
	const framed = browser && window.self !== window.top;
	// browser guard: searchParams may not be read while prerendering
	let brandless = $derived(framed || (browser && page.url.searchParams.get('topnav') === '1'));

	const allNav = [
		{ href: '/explore', label: 'Explore' },
		{ href: '/indicators', label: 'Indicators' },
		{ href: '/county/37119', label: 'Reports' },
		{ href: '/methods', label: 'Methods' },
		{ href: '/about', label: 'About' }
	];
	// keep the brand-less view across navigation by carrying the param forward
	/** @param {string} href */
	const navUrl = (href) => (brandless ? `${href}?topnav=1` : href);

	const isActive = (href) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href.split('/')[1] ? `/${href.split('/')[1]}` : href);
</script>

<a class="skip-link" href="#main">Skip to content</a>

<div class="app-shell">
	<header class="site-header no-print" class:no-brand={brandless}>
		<div class="header-inner" class:no-brand={brandless}>
			<a class="brand" href="/">
				<img class="brand-logo" src="{base}/uncc-logo.png" alt="UNC Charlotte" />
				<span class="brand-title">Carolinas Regional Explorer</span>
			</a>
			<p class="brand-description">
				The Carolinas Regional Explorer maps quality-of-life indicators for every Census tract
				in the 14-county Charlotte region, built for residents, researchers, planners, and
				policymakers.
			</p>
			<nav class="site-nav" aria-label="Primary">
				{#each allNav as item (item.href)}
					<a
						href={navUrl(item.href)}
						class="nav-link"
						class:nav-about={item.href === '/about'}
						class:active={isActive(item.href)}>{item.label}</a
					>
				{/each}
			</nav>
		</div>
	</header>

	<main id="main" class="site-main">
		{@render children()}
	</main>

	<footer class="site-footer no-print">
		<div class="container footer-inner">
			<p>
				Carolinas Regional Explorer, a project of the UNC Charlotte Urban Institute and partners.
				Census-tract indicators for the Charlotte region.
			</p>
			<p class="footer-links">
				<a href="/about">About</a> · <a href="/methods">Methods</a> ·
				<a href="/data">Data</a>
			</p>
		</div>
	</footer>
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		height: 100dvh;
	}
	.site-main {
		overflow-y: auto;
	}
	.site-header,
	.site-footer {
		flex-shrink: 0;
	}
	.site-header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: color-mix(in srgb, var(--c-surface) 88%, transparent);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--c-border);
	}
	/* Embed view (?topnav=1): sand-tint background (not the parent reg-explorer
	   nav's paper/white) and un-stuck from the top — this bar is nested inside
	   reg-explorer's own sticky top nav, so it should read as subordinate
	   content, not a second app-level header competing for the fixed slot.
	   Duplicated under :global(html.brandless) so it applies before hydration
	   too (app.html tags <html> with .brandless pre-paint) — otherwise the
	   header would flash the full-site style first. */
	.site-header.no-brand,
	:global(html.brandless) .site-header {
		position: static;
		background: var(--c-sand-faint);
		backdrop-filter: none;
	}
	.header-inner {
		height: var(--header-h);
		max-width: var(--maxw);
		margin: 0 auto;
		padding: 0 var(--sp-5);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-4);
	}
	.header-inner.no-brand,
	:global(html.brandless) .header-inner {
		/* Embed view (?topnav=1): min-height (not just padding) so the bar has
		   room for the 3-line description regardless of the nav pills' own
		   (shorter) height. Kept in sync with the survey's .nav.embedded
		   min-height in SectionNav.svelte so both stay equal height. */
		height: auto;
		min-height: 4rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		justify-content: space-between;
	}
	.brand-description {
		display: none;
		margin: 0;
		min-width: 0;
		max-width: 46ch;
		color: var(--c-text-3);
		font-size: var(--t-xs);
		line-height: 1.3;
		/* Up to 3 lines, then ellipsis. */
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	/* Both .brand and .brand-description are always in the DOM (see markup);
	   only one is shown at a time. Keyed off :global(html.brandless) too —
	   set before first paint by app.html — so there's no flash/reflow while
	   waiting for hydration to compute the equivalent `no-brand` class. */
	.header-inner.no-brand .brand,
	:global(html.brandless) .brand {
		display: none;
	}
	.header-inner.no-brand .brand-description,
	:global(html.brandless) .brand-description {
		display: -webkit-box;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		color: var(--c-text);
	}
	.brand:hover {
		text-decoration: none;
	}
	.brand-logo {
		height: 2.25rem;
		width: auto;
		display: block;
	}
	.brand-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--t-xl);
		letter-spacing: -0.01em;
		border-left: 1px solid var(--c-border-strong);
		padding-left: var(--sp-4);
	}
	.site-nav {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		flex-shrink: 0;
	}
	.nav-link {
		color: var(--c-text-2);
		padding: var(--sp-2) var(--sp-4);
		border-radius: var(--r-pill);
		font-weight: 600;
		font-size: var(--t-lg);
	}
	/* Embed view (?topnav=1): match the wellbeing dashboard's embed nav pill style
	   (quiet borderless pills, sand-tint active state) instead of the full site's
	   larger nav links. */
	.header-inner.no-brand .nav-link,
	:global(html.brandless) .nav-link {
		border: 1px solid transparent;
		background: transparent;
		padding: 0.375rem 0.75rem;
		font-weight: 500;
		font-size: 0.9rem;
	}
	.header-inner.no-brand .nav-link:hover,
	:global(html.brandless) .nav-link:hover {
		background: color-mix(in srgb, var(--c-surface) 60%, transparent);
	}
	/* Sand-tint bg on the bar itself, so the active pill uses a plain
	   surface fill (not another sand tint) to still stand out against it. */
	.header-inner.no-brand .nav-link.active,
	:global(html.brandless) .nav-link.active {
		background: var(--c-surface);
		color: var(--c-teal);
	}
	/* Embed view drops the About link — hidden via CSS (rather than filtered
	   out of the loop) so the link count doesn't change after hydration. */
	.header-inner.no-brand .nav-about,
	:global(html.brandless) .nav-about {
		display: none;
	}
	.nav-link:hover {
		background: var(--c-surface-2);
		text-decoration: none;
	}
	.nav-link.active {
		color: var(--c-teal);
		background: var(--c-sand-faint);
	}
	.site-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.site-footer {
		border-top: 1px solid var(--c-border);
		background: var(--c-surface);
		color: var(--c-text-3);
		font-size: var(--t-xs);
		padding: var(--sp-2) 0;
	}
	.footer-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--sp-4);
		flex-wrap: wrap;
	}
	.footer-inner p {
		margin: 0;
		max-width: 70ch;
	}
	@media (max-width: 760px) {
		.brand-title {
			display: none;
		}
		.brand-logo {
			height: 1.9rem;
		}
		.brand-description {
			display: none;
		}
		/* Same specificity as the embed-view rules that set this to
		   display: -webkit-box (2 classes / :global selector), so this
		   mobile override actually wins here instead of losing to them. */
		.header-inner.no-brand .brand-description,
		:global(html.brandless) .brand-description {
			display: none;
		}
		.header-inner {
			padding: 0 var(--sp-3);
			gap: var(--sp-2);
		}
		/* nav stays on one line but scrolls within the header instead of widening the page.
		   flex-shrink: 1 overrides the desktop flex-shrink: 0 (added so the nav wouldn't get
		   squeezed by the brand description) — here it must be allowed to shrink down to the
		   viewport width for overflow-x: auto to actually engage, instead of pushing the header
		   wider than the screen. */
		.site-nav {
			gap: 2px;
			min-width: 0;
			flex-shrink: 1;
			overflow-x: auto;
			flex-wrap: nowrap;
			scrollbar-width: none;
			-webkit-overflow-scrolling: touch;
		}
		.site-nav::-webkit-scrollbar {
			display: none;
		}
		.nav-link {
			padding: var(--sp-1) var(--sp-2);
			font-size: var(--t-sm);
			flex-shrink: 0;
			white-space: nowrap;
		}
	}
</style>
