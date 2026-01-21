<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Capi Roulette</title>
</svelte:head>

{@render children()}
