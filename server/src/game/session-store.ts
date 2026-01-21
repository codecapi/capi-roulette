import type {
	Session,
	Round,
	SessionStatus,
	RoundStatus,
	GamePhase,
	GameState,
	RoundHistory,
} from '@shared/types';
import { getNumberColor } from './constants';

// In-memory session store
let currentSession: Session | null = null;
let currentRound: Round | null = null;
let roundCounter = 0;
let currentPhase: GamePhase = 'idle';

// Dealer password (hashed)
let dealerPasswordHash: string | null = null;

/**
 * Create a new game session
 */
export function createSession(password: string): Session {
	if (currentSession && currentSession.status === 'active') {
		throw new Error('A session is already active');
	}

	dealerPasswordHash = hashPassword(password);
	roundCounter = 0;
	currentPhase = 'idle';

	currentSession = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		endedAt: null,
		status: 'active',
		rounds: [],
	};

	return currentSession;
}

/**
 * Get current session
 */
export function getSession(): Session | null {
	return currentSession;
}

/**
 * End current session
 */
export function endSession(): Session | null {
	if (!currentSession) return null;

	currentSession.status = 'ended';
	currentSession.endedAt = new Date();
	currentRound = null;
	currentPhase = 'session_ended';

	return currentSession;
}

/**
 * Verify dealer password
 */
export function verifyDealerPassword(password: string): boolean {
	if (!dealerPasswordHash) return false;
	return hashPassword(password) === dealerPasswordHash;
}

/**
 * Simple password hashing (for demo purposes)
 */
function hashPassword(password: string): string {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	return Bun.hash(data).toString(16);
}

// Phase management

/**
 * Get current game phase
 */
export function getCurrentPhase(): GamePhase {
	return currentPhase;
}

/**
 * Set current game phase
 */
export function setCurrentPhase(phase: GamePhase): void {
	currentPhase = phase;
}

// Round management

/**
 * Create a new round
 */
export function createRound(): Round {
	if (!currentSession || currentSession.status !== 'active') {
		throw new Error('No active session');
	}

	roundCounter++;

	currentRound = {
		id: crypto.randomUUID(),
		sessionId: currentSession.id,
		roundNumber: roundCounter,
		status: 'betting',
		winningNumber: null,
		winningColor: null,
		startedAt: new Date(),
		completedAt: null,
	};

	currentSession.rounds.push(currentRound);
	return currentRound;
}

/**
 * Get current round
 */
export function getCurrentRound(): Round | null {
	return currentRound;
}

/**
 * Get current round number
 */
export function getCurrentRoundNumber(): number {
	return roundCounter;
}

/**
 * Update round status
 */
export function updateRoundStatus(status: RoundStatus): void {
	if (currentRound) {
		currentRound.status = status;
	}
}

/**
 * Set winning number for current round
 */
export function setWinningNumber(number: number): void {
	if (currentRound) {
		currentRound.winningNumber = number;
		currentRound.winningColor = getNumberColor(number);
	}
}

/**
 * Complete the current round
 */
export function completeRound(): void {
	if (currentRound) {
		currentRound.status = 'completed';
		currentRound.completedAt = new Date();
		currentRound = null;
	}
}

/**
 * Get current game state for broadcasting
 */
export function getGameState(): GameState {
	const session = currentSession;
	const round = currentRound;

	// Get last completed round result
	const completedRounds = session?.rounds.filter(
		(r) => r.status === 'completed' && r.winningNumber !== null
	) ?? [];
	const lastRound = completedRounds[completedRounds.length - 1];
	const lastResult =
		lastRound && lastRound.winningNumber !== null
			? {
					number: lastRound.winningNumber,
					color: lastRound.winningColor!,
				}
			: null;

	return {
		sessionId: session?.id ?? '',
		roundId: round?.id ?? null,
		phase: currentPhase,
		currentRound: roundCounter || null,
		lastResult,
		hotNumbers: getHotNumbers(),
		coldNumbers: getColdNumbers(),
	};
}

/**
 * Get hot numbers (most frequent in session)
 */
export function getHotNumbers(limit: number = 5): number[] {
	if (!currentSession) return [];

	const completedRounds = currentSession.rounds.filter(
		(r) => r.status === 'completed' && r.winningNumber !== null
	);

	if (completedRounds.length === 0) return [];

	const counts = new Map<number, number>();
	for (const round of completedRounds) {
		const num = round.winningNumber!;
		counts.set(num, (counts.get(num) ?? 0) + 1);
	}

	return Array.from(counts.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([num]) => num);
}

/**
 * Get cold numbers (least frequent or never hit)
 */
export function getColdNumbers(limit: number = 5): number[] {
	if (!currentSession) return [];

	const completedRounds = currentSession.rounds.filter(
		(r) => r.status === 'completed' && r.winningNumber !== null
	);

	const counts = new Map<number, number>();

	// Initialize all numbers with 0
	for (let i = 0; i <= 36; i++) {
		counts.set(i, 0);
	}

	// Count occurrences
	for (const round of completedRounds) {
		const num = round.winningNumber!;
		counts.set(num, (counts.get(num) ?? 0) + 1);
	}

	return Array.from(counts.entries())
		.sort((a, b) => a[1] - b[1])
		.slice(0, limit)
		.map(([num]) => num);
}

/**
 * Add a completed round result (for simplified flow)
 * Creates a round, sets result, and completes it in one step
 */
export function addRoundResult(
	winningNumber: number
): { roundNumber: number; winningNumber: number; winningColor: 'red' | 'black' | 'green' } | null {
	if (!currentSession || currentSession.status !== 'active') {
		return null;
	}

	// Create a new round
	roundCounter++;

	const round: Round = {
		id: crypto.randomUUID(),
		sessionId: currentSession.id,
		roundNumber: roundCounter,
		status: 'completed',
		winningNumber,
		winningColor: getNumberColor(winningNumber),
		startedAt: new Date(),
		completedAt: new Date(),
	};

	currentSession.rounds.push(round);

	return {
		roundNumber: round.roundNumber,
		winningNumber: round.winningNumber!,
		winningColor: round.winningColor!,
	};
}

/**
 * Get round history for dealer statistics
 */
export function getRoundHistory(): RoundHistory[] {
	if (!currentSession) return [];

	return currentSession.rounds
		.filter((r) => r.status === 'completed' && r.winningNumber !== null)
		.map((r) => ({
			roundNumber: r.roundNumber,
			winningNumber: r.winningNumber!,
			winningColor: r.winningColor!,
			timestamp: r.completedAt!,
		}));
}

/**
 * Get session data for backup
 */
export function getBackupData() {
	if (!currentSession) return null;

	return {
		session: {
			id: currentSession.id,
			createdAt: currentSession.createdAt.toISOString(),
			endedAt: currentSession.endedAt?.toISOString() ?? null,
			status: currentSession.status,
		},
		rounds: currentSession.rounds
			.filter((r) => r.status === 'completed')
			.map((r) => ({
				roundNumber: r.roundNumber,
				winningNumber: r.winningNumber!,
				winningColor: r.winningColor!,
				timestamp: r.completedAt!.toISOString(),
			})),
	};
}
