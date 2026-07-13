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
	let nav = $derived(brandless ? allNav.filter((item) => item.href !== '/about') : allNav);

	// keep the brand-less view across navigation by carrying the param forward
	/** @param {string} href */
	const navUrl = (href) => (brandless ? `${href}?topnav=1` : href);

	const isActive = (href) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href.split('/')[1] ? `/${href.split('/')[1]}` : href);
</script>

<a class="skip-link" href="#main">Skip to content</a>

<div class="app-shell">
	<header class="site-header no-print">
		<div class="header-inner" class:no-brand={brandless}>
			{#if !brandless}
				<a class="brand" href="/">
					<img class="brand-logo" src="{base}/uncc-logo.png" alt="UNC Charlotte" />
					<span class="brand-title">Carolinas Regional Explorer</span>
				</a>
			{:else}
				<p class="brand-description">
					The Carolinas Regional Explorer maps quality-of-life indicators for every Census tract
					in the 14-county Charlotte region, built for residents, researchers, planners, and
					policymakers.
				</p>
			{/if}
			<nav class="site-nav" aria-label="Primary">
				{#each nav as item (item.href)}
					<a href={navUrl(item.href)} class="nav-link" class:active={isActive(item.href)}>{item.label}</a>
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
	.header-inner.no-brand {
		justify-content: space-between;
	}
	.brand-description {
		margin: 0;
		max-width: 46ch;
		color: var(--c-text-3);
		font-size: var(--t-xs);
		line-height: 1.3;
	}
	/* pre-hydration cover for the brand flash: app.html tags <html> with .brandless
	   before first paint; once hydrated, the {#if !brandless} above takes over */
	:global(html.brandless) .brand {
		display: none;
	}
	:global(html.brandless) .header-inner {
		justify-content: space-between;
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
	}
	.nav-link {
		color: var(--c-text-2);
		padding: var(--sp-2) var(--sp-4);
		border-radius: var(--r-pill);
		font-weight: 600;
		font-size: var(--t-lg);
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
		.header-inner {
			padding: 0 var(--sp-3);
			gap: var(--sp-2);
		}
		/* nav stays on one line but scrolls within the header instead of widening the page */
		.site-nav {
			gap: 2px;
			min-width: 0;
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
