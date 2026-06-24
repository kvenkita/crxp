<script>
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();

	const nav = [
		{ href: '/explore', label: 'Explore' },
		{ href: '/indicators', label: 'Indicators' },
		{ href: '/county/37119', label: 'Reports' },
		{ href: '/methods', label: 'Methods' },
		{ href: '/about', label: 'About' }
	];

	const isActive = (href) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href.split('/')[1] ? `/${href.split('/')[1]}` : href);
</script>

<a class="skip-link" href="#main">Skip to content</a>

<div class="app-shell">
	<header class="site-header no-print">
		<div class="header-inner">
			<a class="brand" href="/">
				<span class="brand-mark" aria-hidden="true">CR</span>
				<span class="brand-text">
					<strong>Carolinas Regional Explorer</strong>
					<small>Charlotte 14-county region</small>
				</span>
			</a>
			<nav class="site-nav" aria-label="Primary">
				{#each nav as item (item.href)}
					<a href={item.href} class="nav-link" class:active={isActive(item.href)}>{item.label}</a>
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
				Carolinas Regional Explorer — a project of the UNC Charlotte Urban Institute and partners.
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
		min-height: 100vh;
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
	.brand {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
		color: var(--c-text);
	}
	.brand:hover {
		text-decoration: none;
	}
	.brand-mark {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: var(--r-md);
		background: var(--c-teal);
		color: var(--c-text-inv);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--t-sm);
	}
	.brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.05;
	}
	.brand-text strong {
		font-family: var(--font-display);
		font-size: var(--t-base);
	}
	.brand-text small {
		color: var(--c-text-3);
		font-size: var(--t-xs);
	}
	.site-nav {
		display: flex;
		align-items: center;
		gap: var(--sp-1);
	}
	.nav-link {
		color: var(--c-text-2);
		padding: var(--sp-2) var(--sp-3);
		border-radius: var(--r-pill);
		font-weight: 500;
		font-size: var(--t-sm);
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
		font-size: var(--t-sm);
		padding: var(--sp-5) 0;
	}
	.footer-inner {
		display: flex;
		justify-content: space-between;
		gap: var(--sp-4);
		flex-wrap: wrap;
	}
	.footer-inner p {
		margin: 0;
		max-width: 48ch;
	}
	@media (max-width: 640px) {
		.brand-text small {
			display: none;
		}
		.site-nav {
			gap: 0;
		}
		.nav-link {
			padding: var(--sp-2);
		}
	}
</style>
