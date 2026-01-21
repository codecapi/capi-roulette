<script lang="ts">
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-gray-900 via-green-950 to-gray-900 text-white flex items-center justify-center" style="font-family: 'Oswald', sans-serif;">
	<div class="text-center max-w-2xl mx-auto px-4">
		<h1 class="text-6xl font-bold mb-4 text-yellow-400">CAPI ROULETTE</h1>
		<p class="text-xl text-gray-400 mb-12">Casino Night Display System</p>

		<div class="grid gap-6 md:grid-cols-2 max-w-lg mx-auto">
			<a
				href="/display"
				class="block p-8 bg-gray-800/80 rounded-xl hover:bg-gray-700/80 transition-all border border-gray-700 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20"
			>
				<div class="text-5xl mb-4">📺</div>
				<h2 class="text-2xl font-semibold mb-2">Display</h2>
				<p class="text-gray-400 text-sm">TV/Projector view with wheel animation and statistics</p>
			</a>

			<a
				href="/dealer"
				class="block p-8 bg-gray-800/80 rounded-xl hover:bg-gray-700/80 transition-all border border-gray-700 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20"
			>
				<div class="text-5xl mb-4">🎩</div>
				<h2 class="text-2xl font-semibold mb-2">Dealer</h2>
				<p class="text-gray-400 text-sm">Control panel for the croupier</p>
			</a>
		</div>
	</div>
</div>
