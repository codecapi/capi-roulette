import { writable, derived, type Readable } from 'svelte/store';
import type {
	GameState,
	GamePhase,
	Color,
	RoundHistory,
	ServerMessage,
	WSGameStateMessage,
	WSPhaseChangeMessage,
	WSWheelUpdateMessage,
	WSRoundResultMessage,
	WSStatsUpdateMessage,
	WSSessionEndedMessage,
} from '@shared/types/index';
import { websocket } from '../services/websocket';

// Default game state
const defaultGameState: GameState = {
	sessionId: '',
	roundId: null,
	phase: 'idle',
	currentRound: null,
	lastResult: null,
	hotNumbers: [],
	coldNumbers: [],
};

// Core game state store
export const gameState = writable<GameState>(defaultGameState);

// Wheel animation state
export const wheelState = writable<{
	wheelAngle: number;
	ballAngle: number;
	ballRadius: number;
	isSpinning: boolean;
	// CSS animation fields (only present at spin start)
	spinDuration?: number;
	targetSlot?: number;
}>({
	wheelAngle: 0,
	ballAngle: 0,
	ballRadius: 150,
	isSpinning: false,
});

// Round result store
export const roundResult = writable<{
	roundNumber: number;
	winningNumber: number;
	winningColor: Color;
} | null>(null);

// Round history (for dealer statistics)
export const roundHistory = writable<RoundHistory[]>([]);

// Session ended state
export const sessionEnded = writable<{
	ended: boolean;
	message: string;
	totalRounds: number;
}>({
	ended: false,
	message: '',
	totalRounds: 0,
});

// Error store
export const lastError = writable<{ code: string; message: string } | null>(null);

// Derived stores for phase checks
export const isIdle: Readable<boolean> = derived(gameState, ($state) => $state.phase === 'idle');
export const isBettingOpen: Readable<boolean> = derived(gameState, ($state) => $state.phase === 'betting_open');
export const isBettingClosed: Readable<boolean> = derived(gameState, ($state) => $state.phase === 'betting_closed');
export const isSpinning: Readable<boolean> = derived(gameState, ($state) => $state.phase === 'spinning');
export const isShowingResult: Readable<boolean> = derived(gameState, ($state) => $state.phase === 'showing_result');
export const isSessionEnded: Readable<boolean> = derived(gameState, ($state) => $state.phase === 'session_ended');

/**
 * Initialize WebSocket message handlers for game state updates
 */
export function initializeGameStore(): () => void {
	const unsubscribers: (() => void)[] = [];

	// Game state update
	unsubscribers.push(
		websocket.on('game_state', (msg) => {
			const message = msg as WSGameStateMessage;
			gameState.set(message.data);
		})
	);

	// Connected - receive initial game state
	unsubscribers.push(
		websocket.on('connected', (msg) => {
			const message = msg as { type: 'connected'; clientId: string; gameState: GameState };
			gameState.set(message.gameState);
		})
	);

	// Phase change
	unsubscribers.push(
		websocket.on('phase_change', (msg) => {
			const message = msg as WSPhaseChangeMessage;
			gameState.update((state) => ({
				...state,
				phase: message.data.phase,
				currentRound: message.data.roundNumber ?? state.currentRound,
			}));

			// Clear round result when going back to idle
			if (message.data.phase === 'idle') {
				roundResult.set(null);
			}
		})
	);

	// Wheel update (animation)
	unsubscribers.push(
		websocket.on('wheel_update', (msg) => {
			const message = msg as WSWheelUpdateMessage;
			wheelState.set(message.data);
		})
	);

	// Round result
	unsubscribers.push(
		websocket.on('round_result', (msg) => {
			const message = msg as WSRoundResultMessage;
			roundResult.set(message.data);

			// Update game state with last result
			gameState.update((state) => ({
				...state,
				lastResult: {
					number: message.data.winningNumber,
					color: message.data.winningColor,
				},
			}));
		})
	);

	// Stats update (dealer only)
	unsubscribers.push(
		websocket.on('stats_update', (msg) => {
			const message = msg as WSStatsUpdateMessage;
			roundHistory.set(message.data.rounds);
		})
	);

	// Session ended
	unsubscribers.push(
		websocket.on('session_ended', (msg) => {
			const message = msg as WSSessionEndedMessage;
			sessionEnded.set({
				ended: true,
				message: message.data.message,
				totalRounds: message.data.totalRounds,
			});

			gameState.update((state) => ({
				...state,
				phase: 'session_ended',
			}));
		})
	);

	// Error handling
	unsubscribers.push(
		websocket.on('error', (msg) => {
			const message = msg as { type: 'error'; code: string; message: string };
			lastError.set({ code: message.code, message: message.message });

			// Auto-clear error after 5 seconds
			setTimeout(() => {
				lastError.set(null);
			}, 5000);
		})
	);

	// Return cleanup function
	return () => {
		unsubscribers.forEach((unsub) => unsub());
	};
}

/**
 * Reset all stores to default values
 */
export function resetStores(): void {
	gameState.set(defaultGameState);
	wheelState.set({
		wheelAngle: 0,
		ballAngle: 0,
		ballRadius: 150,
		isSpinning: false,
		spinDuration: undefined,
		targetSlot: undefined,
	});
	roundResult.set(null);
	roundHistory.set([]);
	sessionEnded.set({
		ended: false,
		message: '',
		totalRounds: 0,
	});
	lastError.set(null);
}
