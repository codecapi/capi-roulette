// Shared types for Capi Roulette - Simplified Display Version
// Based on data-model.md for 002-display-dealer-only

// Enums and type aliases
export type SessionStatus = 'active' | 'ended';
export type RoundStatus = 'betting' | 'closed' | 'spinning' | 'showing_result' | 'completed';
export type GamePhase = 'idle' | 'betting_open' | 'betting_closed' | 'spinning' | 'showing_result' | 'session_ended';
export type Color = 'red' | 'black' | 'green';

// Session entity
export interface Session {
	id: string;
	createdAt: Date;
	endedAt: Date | null;
	status: SessionStatus;
	rounds: Round[];
}

// Round entity (simplified - no bets)
export interface Round {
	id: string;
	sessionId: string;
	roundNumber: number;
	status: RoundStatus;
	winningNumber: number | null;
	winningColor: Color | null;
	startedAt: Date;
	completedAt: Date | null;
}

// Round history for dealer statistics
export interface RoundHistory {
	roundNumber: number;
	winningNumber: number;
	winningColor: Color;
	timestamp: Date;
}

// Game state shared across all pages
export interface GameState {
	sessionId: string;
	roundId: string | null;
	phase: GamePhase;
	currentRound: number | null;
	lastResult: { number: number; color: Color } | null;
	hotNumbers: number[];
	coldNumbers: number[];
}

// WebSocket message types
export type ClientType = 'display' | 'dealer';

// Server -> Client messages
export interface WSConnectedMessage {
	type: 'connected';
	clientId: string;
	gameState: GameState;
}

export interface WSGameStateMessage {
	type: 'game_state';
	data: GameState;
}

export interface WSPhaseChangeMessage {
	type: 'phase_change';
	data: {
		phase: GamePhase;
		roundNumber?: number;
	};
}

export interface WSWheelUpdateMessage {
	type: 'wheel_update';
	data: {
		wheelAngle: number;
		ballAngle: number;
		ballRadius: number;
		isSpinning: boolean;
		// CSS animation fields (only sent at spin start)
		spinDuration?: number; // Duration in ms
		targetSlot?: number; // Target slot index 0-36
	};
}

export interface WSRoundResultMessage {
	type: 'round_result';
	data: {
		roundNumber: number;
		winningNumber: number;
		winningColor: Color;
	};
}

export interface WSStatsUpdateMessage {
	type: 'stats_update';
	data: {
		rounds: RoundHistory[];
	};
}

export interface WSSessionEndedMessage {
	type: 'session_ended';
	data: {
		message: string;
		totalRounds: number;
	};
}

export interface WSErrorMessage {
	type: 'error';
	code: string;
	message: string;
}

export interface WSPongMessage {
	type: 'pong';
}

// Server -> Display messages (forwarded from dealer)
export interface WSTriggerSpinMessage {
	type: 'trigger_spin';
	data: {
		spinDuration: number;
		overrideNumber?: number;
	};
}

export interface WSResetWheelMessage {
	type: 'reset_wheel';
	data: Record<string, never>;
}

export interface WSSpinCompleteMessage {
	type: 'spin_complete';
	data: {
		winningNumber: number;
		winningColor: Color;
	};
}

export type ServerMessage =
	| WSConnectedMessage
	| WSGameStateMessage
	| WSPhaseChangeMessage
	| WSWheelUpdateMessage
	| WSRoundResultMessage
	| WSStatsUpdateMessage
	| WSSessionEndedMessage
	| WSErrorMessage
	| WSPongMessage
	| WSTriggerSpinMessage
	| WSResetWheelMessage
	| WSSpinCompleteMessage;

// Client -> Server messages (Dealer only)
export interface WSBetsOpenMessage {
	type: 'bets_open';
}

export interface WSBetsCloseMessage {
	type: 'bets_close';
}

export interface WSSpinMessage {
	type: 'spin';
	data: {
		winningNumber: number;
	};
}

export interface WSNewRoundMessage {
	type: 'new_round';
}

export interface WSEndSessionMessage {
	type: 'end_session';
}

export interface WSPingMessage {
	type: 'ping';
}

// Client -> Server messages (Dealer -> Server -> Display)
export interface WSClientTriggerSpinMessage {
	type: 'trigger_spin';
	data: {
		spinDuration: number;
		overrideNumber?: number;
	};
}

export interface WSClientResetWheelMessage {
	type: 'reset_wheel';
}

// Client -> Server messages (Display -> Server)
export interface WSSpinResultMessage {
	type: 'spin_result';
	data: {
		winningNumber: number;
	};
}

export type ClientMessage =
	| WSBetsOpenMessage
	| WSBetsCloseMessage
	| WSSpinMessage
	| WSNewRoundMessage
	| WSEndSessionMessage
	| WSPingMessage
	| WSClientTriggerSpinMessage
	| WSClientResetWheelMessage
	| WSSpinResultMessage;

// API request/response types
export interface CreateSessionRequest {
	dealerPassword: string;
}

export interface CreateSessionResponse {
	id: string;
	createdAt: string;
	endedAt: string | null;
	status: SessionStatus;
	roundCount: number;
}

export interface DealerAuthResponse {
	authenticated: boolean;
	sessionId: string;
}

// Backup file format (simplified)
export interface BackupFile {
	session: {
		id: string;
		createdAt: string;
		endedAt: string | null;
		status: SessionStatus;
	};
	rounds: {
		roundNumber: number;
		winningNumber: number;
		winningColor: Color;
		timestamp: string;
	}[];
}
