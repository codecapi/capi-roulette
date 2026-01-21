import type { ServerWebSocket } from 'bun';
import type { ClientMessage, ServerMessage } from '@shared/types';
import type { WebSocketData } from '../server';
import { cleanupTimers } from '../../game/state-machine';
import {
	endSession,
	getSession,
	getRoundHistory,
	addRoundResult,
	getGameState,
} from '../../game/session-store';
import { broadcast, broadcastToDealer, broadcastToDisplays } from '../broadcast';

/**
 * Handle messages from dealer clients
 */
export function handleDealerMessage(
	ws: ServerWebSocket<WebSocketData>,
	message: any
): void {
	try {
		switch (message.type) {
			case 'trigger_spin':
				handleTriggerSpin(ws, message.data);
				break;

			case 'reset_wheel':
				handleResetWheel(ws);
				break;

			case 'end_session':
				handleEndSession(ws);
				break;

			default:
				sendError(ws, 'INVALID_MESSAGE', `Unknown message type: ${message.type}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		sendError(ws, 'DEALER_ERROR', errorMessage);
	}
}

/**
 * Handle spin_result from display clients
 */
export function handleDisplayMessage(
	ws: ServerWebSocket<WebSocketData>,
	message: any
): void {
	try {
		switch (message.type) {
			case 'spin_result':
				handleSpinResult(ws, message.data);
				break;

			default:
				// Ignore other messages from display
				break;
		}
	} catch (error) {
		console.error('Display message error:', error);
	}
}

function handleTriggerSpin(
	ws: ServerWebSocket<WebSocketData>,
	data: { spinDuration?: number; overrideNumber?: number }
): void {
	// Forward spin command to all display clients
	broadcastToDisplays({
		type: 'trigger_spin' as any,
		data: {
			spinDuration: data?.spinDuration || 9000,
			overrideNumber: data?.overrideNumber,
		},
	});
}

function handleResetWheel(ws: ServerWebSocket<WebSocketData>): void {
	// Tell displays to reset to "Place Your Bets" state
	broadcastToDisplays({
		type: 'reset_wheel' as any,
		data: {},
	});
}

function handleSpinResult(
	ws: ServerWebSocket<WebSocketData>,
	data: { winningNumber: number }
): void {
	const winningNumber = data.winningNumber;

	// Validate
	if (winningNumber === undefined || winningNumber < 0 || winningNumber > 36) {
		return;
	}

	// Record the result
	const result = addRoundResult(winningNumber);

	if (result) {
		// Send round result to all clients
		broadcast({
			type: 'round_result',
			data: {
				roundNumber: result.roundNumber,
				winningNumber: result.winningNumber,
				winningColor: result.winningColor,
			},
		});

		// Broadcast updated game state (includes hot/cold numbers) to all clients
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

		// Notify dealer that spin is complete
		broadcastToDealer({
			type: 'spin_complete' as any,
			data: {
				winningNumber: result.winningNumber,
				winningColor: result.winningColor,
			},
		});
	}
}

function handleEndSession(ws: ServerWebSocket<WebSocketData>): void {
	try {
		// Clean up any running timers
		cleanupTimers();

		// End the session
		const session = endSession();

		if (!session) {
			sendError(ws, 'SESSION_ERROR', 'No active session to end');
			return;
		}

		// Get final round count
		const roundHistory = getRoundHistory();
		const totalRounds = roundHistory.length;

		// Broadcast session ended to all clients
		broadcast({
			type: 'session_ended',
			data: {
				message: 'Game session has ended. Thank you for playing!',
				totalRounds,
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to end session';
		sendError(ws, 'SESSION_ERROR', errorMessage);
	}
}

function sendError(ws: ServerWebSocket<WebSocketData>, code: string, message: string): void {
	const response: ServerMessage = {
		type: 'error',
		code,
		message,
	};
	ws.send(JSON.stringify(response));
}
