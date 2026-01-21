<script lang="ts">
	import { onDestroy } from 'svelte';
	import { websocket } from '$lib/services/websocket';
	import {
		gameState,
		roundHistory,
		roundResult,
		sessionEnded,
		lastError,
		initializeGameStore,
		resetStores,
	} from '$lib/stores/game';

	let cleanup: (() => void) | null = null;
	let authenticated = $state(false);
	let password = $state('');
	let authError = $state('');

	// Spin configuration
	let isSpinning = $state(false);
	let useOverride = $state(false);
	let overrideNumber = $state<number | null>(null);
	let spinDuration = $state(9000); // Default 9 seconds (configurable)

	// Simple phase tracking
	let canSpin = $derived(!isSpinning && $gameState.phase !== 'session_ended');

	async function authenticate() {
		authError = '';

		try {
			// First, check if there's an active session
			const sessionRes = await fetch('/api/session');

			if (sessionRes.status === 404) {
				// No active session, create one
				const createRes = await fetch('/api/session', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ dealerPassword: password }),
				});

				if (!createRes.ok) {
					const data = await createRes.json();
					authError = data.error || 'Failed to create session';
					return;
				}
			} else if (sessionRes.ok) {
				// Session exists, verify password
				const authRes = await fetch('/api/dealer/auth', {
					method: 'POST',
					headers: {
						Authorization: 'Basic ' + btoa('dealer:' + password),
					},
				});

				if (!authRes.ok) {
					authError = 'Invalid password';
					return;
				}
			}

			// Connect to WebSocket
			cleanup = initializeGameStore();

			// Listen for spin result from display
			websocket.on('spin_complete', (msg: any) => {
				isSpinning = false;
			});

			await websocket.connect('dealer');
			authenticated = true;
		} catch (error) {
			authError = 'Connection failed';
			console.error(error);
		}
	}

	function placeBets() {
		// Tell display to show "Place Your Bets"
		websocket.send({ type: 'reset_wheel' });
	}

	function triggerSpin() {
		if (!canSpin) return;

		isSpinning = true;

		// Send spin command to display
		const spinData: { spinDuration: number; overrideNumber?: number } = {
			spinDuration,
		};

		if (useOverride && overrideNumber !== null) {
			spinData.overrideNumber = overrideNumber;
		}

		websocket.send({ type: 'trigger_spin', data: spinData });
	}

	function selectOverrideNumber(num: number) {
		overrideNumber = num;
	}

	function clearOverride() {
		useOverride = false;
		overrideNumber = null;
	}

	function endSession() {
		if (confirm('Are you sure you want to end the session?')) {
			websocket.send({ type: 'end_session' });
		}
	}

	function getNumberColor(num: number): 'red' | 'black' | 'green' {
		if (num === 0) return 'green';
		const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
		return redNumbers.includes(num) ? 'red' : 'black';
	}

	onDestroy(() => {
		cleanup?.();
		if (authenticated) {
			websocket.disconnect();
		}
		resetStores();
	});
</script>

<div class="min-h-screen bg-gray-900 text-white p-8">
	{#if !authenticated}
		<!-- Login Form -->
		<div class="max-w-md mx-auto mt-20">
			<div class="bg-gray-800 rounded-lg p-8">
				<h1 class="text-3xl font-bold mb-6 text-center text-yellow-400">Dealer Login</h1>

				<form onsubmit={(e) => { e.preventDefault(); authenticate(); }}>
					<div class="mb-6">
						<label for="password" class="block text-sm font-medium mb-2">Dealer Password</label>
						<input
							type="password"
							id="password"
							bind:value={password}
							class="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
							placeholder="Enter password"
							required
						/>
					</div>

					{#if authError}
						<div class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300">
							{authError}
						</div>
					{/if}

					<button
						type="submit"
						class="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors"
					>
						Enter
					</button>
				</form>
			</div>
		</div>
	{:else if $sessionEnded.ended}
		<!-- Session Ended -->
		<div class="max-w-md mx-auto mt-20 text-center">
			<div class="bg-gray-800 rounded-lg p-8">
				<h1 class="text-3xl font-bold mb-6 text-red-400">Session Ended</h1>
				<p class="text-gray-300 mb-6">{$sessionEnded.message}</p>
				<p class="text-gray-400 mb-6">Total Rounds: <strong class="text-white">{$sessionEnded.totalRounds}</strong></p>
				<a href="/" class="text-yellow-400 hover:underline">Return to Home</a>
			</div>
		</div>
	{:else}
		<!-- Dealer Control Panel -->
		<div class="max-w-4xl mx-auto">
			<div class="flex justify-between items-center mb-8">
				<h1 class="text-3xl font-bold text-yellow-400">Dealer Control Panel</h1>
				<div class="text-gray-400">
					Rounds Played: <span class="text-white font-semibold">{$roundHistory.length}</span>
				</div>
			</div>

			{#if $lastError}
				<div class="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
					{$lastError.message}
				</div>
			{/if}

			<!-- Main Control Buttons -->
			<div class="grid grid-cols-2 gap-6 mb-8">
				<!-- Place Your Bets Button -->
				<button
					onclick={placeBets}
					disabled={isSpinning}
					class="h-32 rounded-xl text-2xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed
						bg-green-600 hover:bg-green-500 disabled:bg-gray-700"
				>
					PLACE YOUR BETS
				</button>

				<!-- Spin Button -->
				<button
					onclick={triggerSpin}
					disabled={!canSpin}
					class="h-32 rounded-xl text-2xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed
						{isSpinning ? 'bg-yellow-700 animate-pulse' : 'bg-yellow-600 hover:bg-yellow-500'} disabled:bg-gray-700"
				>
					{isSpinning ? 'SPINNING...' : 'SPIN'}
				</button>
			</div>

			<!-- Spin Duration Configuration -->
			<div class="bg-gray-800 rounded-xl p-6 mb-6">
				<h2 class="text-lg font-semibold mb-4">Spin Duration</h2>
				<div class="flex items-center gap-4">
					<input
						type="range"
						min="5000"
						max="15000"
						step="1000"
						bind:value={spinDuration}
						class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
					/>
					<span class="text-xl font-mono w-20 text-right">{(spinDuration / 1000).toFixed(0)}s</span>
				</div>
				<p class="text-gray-500 text-sm mt-2">Adjust how long the ball spins before landing (5-15 seconds)</p>
			</div>

			<!-- Override Number (Collapsible) -->
			<div class="bg-gray-800 rounded-xl p-6 mb-8">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Override Result (Optional)</h2>
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={useOverride}
							class="w-5 h-5 rounded bg-gray-700 border-gray-600"
						/>
						<span class="text-sm text-gray-400">Enable</span>
					</label>
				</div>

				{#if useOverride}
					<div class="transition-all">
						<!-- Selected Number Display -->
						<div class="text-center mb-4">
							<div class="inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold
								{overrideNumber !== null && getNumberColor(overrideNumber) === 'red' ? 'bg-red-600' :
								 overrideNumber !== null && getNumberColor(overrideNumber) === 'green' ? 'bg-green-600' :
								 'bg-gray-700 border-2 border-gray-500'}">
								{overrideNumber ?? '?'}
							</div>
							{#if overrideNumber !== null}
								<button onclick={clearOverride} class="ml-4 text-sm text-gray-400 hover:text-white">Clear</button>
							{/if}
						</div>

						<!-- Number Grid -->
						<div class="grid grid-cols-10 gap-1">
							<!-- Zero -->
							<button
								onclick={() => selectOverrideNumber(0)}
								class="col-span-10 h-10 rounded text-lg font-bold bg-green-600 hover:bg-green-500 transition-colors"
							>
								0
							</button>

							<!-- Numbers 1-36 -->
							{#each Array.from({ length: 36 }, (_, i) => i + 1) as num}
								<button
									onclick={() => selectOverrideNumber(num)}
									class="h-10 rounded text-sm font-bold transition-colors
										{overrideNumber === num ? 'ring-2 ring-yellow-400' : ''}
										{getNumberColor(num) === 'red' ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}"
								>
									{num}
								</button>
							{/each}
						</div>

						<p class="text-gray-500 text-sm mt-3 text-center">
							{#if overrideNumber !== null}
								Result will be <strong class="text-white">{overrideNumber}</strong> instead of random
							{:else}
								Select a number to override the random result
							{/if}
						</p>
					</div>
				{:else}
					<p class="text-gray-500 text-sm">Results are random by default. Enable override to select a specific winning number.</p>
				{/if}
			</div>

			<!-- Last Result Display -->
			{#if $roundResult}
				<div class="mb-8 p-6 bg-gray-800 rounded-xl text-center">
					<h2 class="text-xl text-gray-400 mb-2">Last Result</h2>
					<div class="inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold
						{$roundResult.winningColor === 'red' ? 'bg-red-600' : $roundResult.winningColor === 'green' ? 'bg-green-600' : 'bg-gray-800 border-4 border-gray-600'}">
						{$roundResult.winningNumber}
					</div>
				</div>
			{/if}

			<!-- Round History -->
			<div class="bg-gray-800 rounded-xl p-6 mb-8">
				<h2 class="text-xl font-semibold mb-4">Round History</h2>
				<div class="flex flex-wrap gap-2">
					{#each $roundHistory.slice().reverse().slice(0, 30) as round}
						<div
							class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
								{round.winningColor === 'red' ? 'bg-red-600' : round.winningColor === 'green' ? 'bg-green-600' : 'bg-gray-700 border-2 border-gray-500'}"
						>
							{round.winningNumber}
						</div>
					{:else}
						<p class="text-gray-500">No rounds played yet</p>
					{/each}
				</div>
			</div>

			<!-- End Session Button -->
			<div class="flex justify-end">
				<button
					onclick={endSession}
					class="px-6 py-3 bg-red-800 hover:bg-red-700 rounded-lg font-semibold transition-colors"
				>
					End Session
				</button>
			</div>
		</div>
	{/if}
</div>
