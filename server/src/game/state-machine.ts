import type { GamePhase } from '@shared/types';
import { getNumberColor, TIMING, WHEEL_ORDER, SPIN_CONFIG, getSlotIndex } from './constants';
import {
	createRound,
	getCurrentRound,
	getCurrentRoundNumber,
	updateRoundStatus,
	setWinningNumber,
	completeRound,
	getSession,
	getGameState,
	getCurrentPhase,
	setCurrentPhase,
	getRoundHistory,
} from './session-store';
import { broadcast, broadcastToDealer } from '../websocket/broadcast';

// State machine for managing game flow
let spinTimer: ReturnType<typeof setTimeout> | null = null;
let animationInterval: ReturnType<typeof setInterval> | null = null;

// Animation state
let currentWheelAngle = 0;
let currentBallAngle = 0;
let currentBallRadius = 150;
let targetBallSlot = 0;
let spinStartTime = 0;
let spinDuration = 0;

// Valid state transitions
const validTransitions: Record<GamePhase, GamePhase[]> = {
	idle: ['betting_open'],
	betting_open: ['betting_closed'],
	betting_closed: ['spinning'],
	spinning: ['showing_result'],
	showing_result: ['idle'],
	session_ended: [],
};

/**
 * Check if a transition is valid
 */
function canTransition(from: GamePhase, to: GamePhase): boolean {
	return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Open betting (called by dealer)
 */
export function openBetting(): void {
	const session = getSession();
	if (!session || session.status !== 'active') {
		throw new Error('No active session');
	}

	const currentPhase = getCurrentPhase();
	if (!canTransition(currentPhase, 'betting_open')) {
		throw new Error(`Cannot open betting from phase: ${currentPhase}`);
	}

	// Create new round if needed
	let round = getCurrentRound();
	if (!round) {
		round = createRound();
	}

	setCurrentPhase('betting_open');
	updateRoundStatus('betting');

	broadcast({
		type: 'phase_change',
		data: {
			phase: 'betting_open',
			roundNumber: round.roundNumber,
		},
	});
}

/**
 * Close betting (called by dealer)
 */
export function closeBetting(): void {
	const session = getSession();
	if (!session || session.status !== 'active') {
		throw new Error('No active session');
	}

	const currentPhase = getCurrentPhase();
	if (!canTransition(currentPhase, 'betting_closed')) {
		throw new Error(`Cannot close betting from phase: ${currentPhase}`);
	}

	setCurrentPhase('betting_closed');
	updateRoundStatus('closed');

	broadcast({
		type: 'phase_change',
		data: {
			phase: 'betting_closed',
			roundNumber: getCurrentRoundNumber(),
		},
	});
}

/**
 * Trigger spin with winning number (called by dealer)
 */
export function triggerSpin(winningNumber: number): void {
	const session = getSession();
	if (!session || session.status !== 'active') {
		throw new Error('No active session');
	}

	const currentPhase = getCurrentPhase();
	if (!canTransition(currentPhase, 'spinning')) {
		throw new Error(`Cannot spin from phase: ${currentPhase}`);
	}

	// Validate winning number
	if (!Number.isInteger(winningNumber) || winningNumber < 0 || winningNumber > 36) {
		throw new Error('Invalid winning number. Must be 0-36.');
	}

	const round = getCurrentRound();
	if (!round) {
		throw new Error('No current round');
	}

	// Set the winning number
	setWinningNumber(winningNumber);
	setCurrentPhase('spinning');
	updateRoundStatus('spinning');

	// Find slot position on wheel for animation
	targetBallSlot = getSlotIndex(winningNumber);

	// Calculate spin duration from SPIN_CONFIG
	spinDuration =
		SPIN_CONFIG.minDuration +
		Math.random() * (SPIN_CONFIG.maxDuration - SPIN_CONFIG.minDuration);
	spinStartTime = Date.now();

	// Reset animation state
	currentWheelAngle = 0;
	currentBallAngle = Math.random() * Math.PI * 2;
	currentBallRadius = 150;

	// Broadcast phase change
	broadcast({
		type: 'phase_change',
		data: {
			phase: 'spinning',
			roundNumber: round.roundNumber,
		},
	});

	// Broadcast initial wheel_update with spinDuration and targetSlot for CSS animation
	broadcast({
		type: 'wheel_update',
		data: {
			wheelAngle: currentWheelAngle,
			ballAngle: currentBallAngle,
			ballRadius: currentBallRadius,
			isSpinning: true,
			spinDuration: Math.round(spinDuration),
			targetSlot: targetBallSlot,
		},
	});

	// Start animation broadcast (30fps) - continues without spinDuration/targetSlot
	animationInterval = setInterval(() => {
		const elapsed = Date.now() - spinStartTime;
		const progress = Math.min(elapsed / spinDuration, 1);

		// Ease out function for deceleration
		const easeOut = 1 - Math.pow(1 - progress, 3);

		// Wheel spins several full rotations plus final position
		const totalWheelRotations = 3 + Math.random() * 2;
		currentWheelAngle = easeOut * totalWheelRotations * Math.PI * 2;

		// Ball starts fast and slows down, eventually settling into a slot
		const ballRotations = 5 + Math.random() * 3;
		const targetBallAngle = (targetBallSlot / 37) * Math.PI * 2 + Math.PI * 2 * ballRotations;
		currentBallAngle = easeOut * targetBallAngle;

		// Ball radius decreases as it settles into the wheel
		const startRadius = 150;
		const endRadius = 100;
		currentBallRadius = startRadius - easeOut * (startRadius - endRadius);

		// Add some bouncing near the end
		if (progress > 0.8) {
			const bounceProgress = (progress - 0.8) / 0.2;
			const bounce = Math.sin(bounceProgress * Math.PI * 4) * (1 - bounceProgress) * 5;
			currentBallRadius += bounce;
		}

		broadcast({
			type: 'wheel_update',
			data: {
				wheelAngle: currentWheelAngle,
				ballAngle: currentBallAngle,
				ballRadius: currentBallRadius,
				isSpinning: progress < 1,
			},
		});

		if (progress >= 1) {
			clearInterval(animationInterval!);
			animationInterval = null;
			showResults();
		}
	}, 1000 / 30); // 30fps

	// Safety timeout
	spinTimer = setTimeout(() => {
		if (animationInterval) {
			clearInterval(animationInterval);
			animationInterval = null;
		}
		showResults();
	}, spinDuration + 1000);
}

/**
 * Show results after spin completes
 */
function showResults(): void {
	if (spinTimer) {
		clearTimeout(spinTimer);
		spinTimer = null;
	}

	const round = getCurrentRound();
	if (!round || round.winningNumber === null) return;

	setCurrentPhase('showing_result');
	updateRoundStatus('showing_result');

	// Broadcast round result (simplified - no topWinners)
	broadcast({
		type: 'round_result',
		data: {
			roundNumber: round.roundNumber,
			winningNumber: round.winningNumber,
			winningColor: round.winningColor!,
		},
	});

	// Broadcast phase change
	broadcast({
		type: 'phase_change',
		data: {
			phase: 'showing_result',
			roundNumber: round.roundNumber,
		},
	});
}

/**
 * Start a new round (called by dealer)
 */
export function startNewRound(): void {
	const session = getSession();
	if (!session || session.status !== 'active') {
		throw new Error('No active session');
	}

	const currentPhase = getCurrentPhase();
	if (!canTransition(currentPhase, 'idle')) {
		throw new Error(`Cannot start new round from phase: ${currentPhase}`);
	}

	// Complete current round
	completeRound();

	// Reset to idle
	setCurrentPhase('idle');

	// Broadcast game state update
	broadcast({
		type: 'game_state',
		data: getGameState(),
	});

	// Send updated stats to dealer
	broadcastToDealer({
		type: 'stats_update',
		data: {
			rounds: getRoundHistory(),
		},
	});

	// Broadcast phase change
	broadcast({
		type: 'phase_change',
		data: {
			phase: 'idle',
		},
	});
}

/**
 * Clean up all timers (for session end)
 */
export function cleanupTimers(): void {
	if (spinTimer) {
		clearTimeout(spinTimer);
		spinTimer = null;
	}
	if (animationInterval) {
		clearInterval(animationInterval);
		animationInterval = null;
	}
}
