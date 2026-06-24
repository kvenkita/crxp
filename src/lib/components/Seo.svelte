<script>
	let { title = '', description = '', image = '', url = '' } = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	{#if url}<meta property="og:url" content={url} />{/if}
	{#if image}<meta property="og:image" content={image} />{/if}
	<meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
</svelte:head>
