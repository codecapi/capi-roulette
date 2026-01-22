<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { websocket } from '$lib/services/websocket';
	import { AudioService } from '$lib/services/audio';
	import {
		gameState,
		roundResult,
		sessionEnded,
		initializeGameStore,
		resetStores,
	} from '$lib/stores/game';
	import CSSRouletteWheel from '$lib/components/wheel/CSSRouletteWheel.svelte';

	const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

	let cleanup: (() => void) | null = null;
	let unsubSpin: (() => void) | null = null;
	let unsubReset: (() => void) | null = null;
	let connected = $state(false);
	let wheelRef: CSSRouletteWheel | null = $state(null);
	let overrideNumber = $state<number | null>(null);
	let spinDuration = $state(9000); // Default 9 seconds

	// Audio state
	let audioService: AudioService | null = null;
	let audioUnlocked = $state(false);
	let audioLoading = $state(false);

	function getNumberColor(num: number): 'red' | 'black' | 'green' {
		if (num === 0) return 'green';
		return RED_NUMBERS.includes(num) ? 'red' : 'black';
	}

	async function unlockAudio() {
		if (audioUnlocked || audioLoading) return;

		audioLoading = true;
		try {
			audioService = new AudioService('/audio/roulette', true);
			await audioService.unlock();
			await audioService.preload();
			audioUnlocked = true;
		} catch (error) {
			console.error('Failed to initialize audio:', error);
		} finally {
			audioLoading = false;
		}
	}

	// Audio callbacks for wheel component
	function handleSpinStart(duration: number) {
		audioService?.playBallAudio(duration);
	}

	function handleNoMoreBets() {
		audioService?.playNoMoreBets();
	}

	function handleResultRevealed(winningNumber: number) {
		audioService?.announceResult(winningNumber);
	}

	function handleSpinComplete(result: number) {
		// Send result back to server
		websocket.send({
			type: 'spin_result',
			data: { winningNumber: result },
		});
	}

	onMount(() => {
		cleanup = initializeGameStore();

		// Listen for spin command from server
		unsubSpin = websocket.on('trigger_spin', (msg: any) => {
			if (msg.data?.overrideNumber !== undefined) {
				overrideNumber = msg.data.overrideNumber;
			} else {
				overrideNumber = null;
			}
			if (msg.data?.spinDuration) {
				spinDuration = msg.data.spinDuration;
			}
			wheelRef?.spin();
		});

		// Listen for reset command
		unsubReset = websocket.on('reset_wheel', () => {
			wheelRef?.reset();
		});

		// Connect to WebSocket (async, but don't block mount)
		websocket.connect('display').then(() => {
			connected = true;
		}).catch((error) => {
			console.error('Failed to connect:', error);
		});
	});

	onDestroy(() => {
		unsubSpin?.();
		unsubReset?.();
		cleanup?.();
		audioService?.dispose();
		websocket.disconnect();
		resetStores();
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="display-page min-h-screen bg-gradient-to-b from-gray-900 via-green-950 to-gray-900 text-white flex flex-col items-center justify-center p-8">
	<!-- Audio Unlock Overlay -->
	{#if connected && !audioUnlocked && !$sessionEnded.ended}
		<div class="audio-unlock-overlay">
			<button
				class="audio-unlock-btn"
				onclick={unlockAudio}
				disabled={audioLoading}
			>
				{#if audioLoading}
					<span class="loading-spinner"></span>
					Loading Audio...
				{:else}
					<span class="sound-icon">🔊</span>
					Click to Enable Audio
				{/if}
			</button>
		</div>
	{/if}

	{#if !connected}
		<div class="flex items-center justify-center h-screen">
			<div class="text-center">
				<div class="animate-spin rounded-full h-16 w-16 border-t-2 border-yellow-400 mx-auto mb-4"></div>
				<p class="text-xl text-gray-400 font-oswald">Connecting to game...</p>
			</div>
		</div>
	{:else if $sessionEnded.ended}
		<!-- Session Ended Overlay -->
		<div class="text-center max-w-md">
			<h1 class="text-5xl font-bold text-red-400 mb-6 font-oswald">Session Ended</h1>
			<p class="text-xl text-gray-300 mb-8">{$sessionEnded.message}</p>
			<p class="text-lg text-gray-400">Total Rounds: <strong class="text-yellow-400">{$sessionEnded.totalRounds}</strong></p>
		</div>
	{:else}
		<div class="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-7xl">
			<!-- Wheel Section -->
			<div class="flex flex-col items-center">
				<CSSRouletteWheel
					bind:this={wheelRef}
					onSpinComplete={handleSpinComplete}
					onSpinStart={handleSpinStart}
					onNoMoreBets={handleNoMoreBets}
					onResultRevealed={handleResultRevealed}
					{spinDuration}
					overrideResult={overrideNumber}
				/>
			</div>

			<!-- Stats Panel -->
			<div class="stats-panel w-80">
				<!-- Last Result -->
				<div class="last-result-box mb-8 p-6 rounded-xl text-center">
					<h2 class="text-2xl font-oswald font-bold mb-4 tracking-wide">LAST RESULT:</h2>
					{#if $gameState.lastResult}
						<div class="flex items-center justify-center gap-4">
							<div
								class="result-number w-20 h-20 rounded-lg flex items-center justify-center text-4xl font-oswald font-bold shadow-lg
									{$gameState.lastResult.color === 'red' ? 'bg-red-600' :
									 $gameState.lastResult.color === 'green' ? 'bg-green-600' :
									 'bg-gray-800 border-2 border-gray-500'}"
							>
								{$gameState.lastResult.number}
							</div>
							<span class="text-3xl font-oswald font-bold uppercase">{$gameState.lastResult.color}</span>
						</div>
					{:else}
						<p class="text-gray-500 font-oswald">No results yet</p>
					{/if}
				</div>

				<!-- Hot and Cold Numbers -->
				<div class="numbers-grid grid grid-cols-2 gap-4">
					<!-- Hot Numbers -->
					<div class="hot-numbers-box p-4 rounded-xl">
						<h3 class="text-lg font-oswald font-bold text-center mb-4 text-red-300 tracking-wide">HOT NUMBERS</h3>
						<div class="flex flex-col items-center gap-3">
							{#each $gameState.hotNumbers as num}
								{@const color = getNumberColor(num)}
								<div class="chip chip-{color}">
									<span class="chip-number">{num}</span>
								</div>
							{:else}
								<p class="text-gray-500 text-sm font-oswald">No data</p>
							{/each}
						</div>
					</div>

					<!-- Cold Numbers -->
					<div class="cold-numbers-box p-4 rounded-xl">
						<h3 class="text-lg font-oswald font-bold text-center mb-4 text-blue-300 tracking-wide">COLD NUMBERS</h3>
						<div class="flex flex-col items-center gap-3">
							{#each $gameState.coldNumbers as num}
								{@const color = getNumberColor(num)}
								<div class="chip chip-{color} chip-silver">
									<span class="chip-number">{num}</span>
								</div>
							{:else}
								<p class="text-gray-500 text-sm font-oswald">No data</p>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.display-page {
		font-family: 'Oswald', sans-serif;
	}

	.font-oswald {
		font-family: 'Oswald', sans-serif;
	}

	/* Last Result Box - Gold Glow */
	.last-result-box {
		background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.95));
		border: 2px solid #d4af37;
		box-shadow:
			0 0 15px rgba(212, 175, 55, 0.3),
			0 0 30px rgba(212, 175, 55, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Hot Numbers Box - Red Glow */
	.hot-numbers-box {
		background: linear-gradient(135deg, rgba(50, 20, 20, 0.9), rgba(30, 10, 10, 0.95));
		border: 2px solid rgba(255, 100, 100, 0.5);
		box-shadow:
			0 0 15px rgba(255, 50, 50, 0.3),
			0 0 30px rgba(255, 50, 50, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Cold Numbers Box - Blue Glow */
	.cold-numbers-box {
		background: linear-gradient(135deg, rgba(20, 20, 50, 0.9), rgba(10, 10, 30, 0.95));
		border: 2px solid rgba(100, 150, 255, 0.5);
		box-shadow:
			0 0 15px rgba(50, 100, 255, 0.3),
			0 0 30px rgba(50, 100, 255, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* 3D Chip Styling */
	.chip {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		font-family: 'Oswald', sans-serif;
		font-weight: 700;
		font-size: 18px;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 -3px 6px rgba(0, 0, 0, 0.3),
			inset 0 3px 6px rgba(255, 255, 255, 0.2);
	}

	/* Gold rim for red/green numbers */
	.chip-red,
	.chip-green {
		border: 3px solid #d4af37;
	}

	.chip-red {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
	}

	.chip-green {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
	}

	/* Silver rim for black numbers */
	.chip-black {
		background: linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%);
		border: 3px solid #9ca3af;
	}

	/* Silver-tinted chips for cold numbers */
	.chip-silver.chip-red {
		border-color: #9ca3af;
	}

	.chip-silver.chip-green {
		border-color: #9ca3af;
	}

	.chip-number {
		position: relative;
		z-index: 1;
	}

	/* Result number styling */
	.result-number {
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.4),
			inset 0 -3px 6px rgba(0, 0, 0, 0.3),
			inset 0 3px 6px rgba(255, 255, 255, 0.1);
	}

	/* Audio Unlock Overlay */
	.audio-unlock-overlay {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1000;
	}

	.audio-unlock-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 24px;
		font-family: 'Oswald', sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: #fff;
		background: linear-gradient(135deg, #d4af37 0%, #b8962e 50%, #a68528 100%);
		border: 2px solid #e5c158;
		border-radius: 8px;
		cursor: pointer;
		box-shadow:
			0 4px 12px rgba(212, 175, 55, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		transition: all 0.2s ease;
	}

	.audio-unlock-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow:
			0 6px 16px rgba(212, 175, 55, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.audio-unlock-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.audio-unlock-btn:disabled {
		opacity: 0.8;
		cursor: wait;
	}

	.sound-icon {
		font-size: 20px;
	}

	.loading-spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
