<script>
	// Bare root layout: global styles only. The site chrome (header/nav/footer) lives in
	// the (site) group layout so chrome-less routes like /embed can exist outside it.
	import '../app.css';

	let { children } = $props();
</script>

{@render children()}
