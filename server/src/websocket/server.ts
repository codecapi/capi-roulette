import type { ServerWebSocket } from 'bun';
import type { ClientType, ServerMessage, ClientMessage } from '@shared/types';
import { handleDealerMessage, handleDisplayMessage } from './handlers/dealer';
import { getGameState, getRoundHistory } from '../game/session-store';
import { subscribe, unsubscribe, TOPICS } from './topics';

export interface WebSocketData {
	type: ClientType;
	clientId: string;
}

// Store all connected WebSockets
const clients = new Map<string, ServerWebSocket<WebSocketData>>();

export const handleWebSocket = {
	open(ws: ServerWebSocket<WebSocketData>) {
		const clientId = crypto.randomUUID();
		ws.data.clientId = clientId;
		clients.set(clientId, ws);

		// Subscribe to game state topic (all clients)
		subscribe(ws, TOPICS.GAME_STATE);

		// Subscribe to dealer-specific topic
		if (ws.data.type === 'dealer') {
			subscribe(ws, TOPICS.DEALER);
		}

		// Send connection confirmation with current game state
		const gameState = getGameState();
		const response: ServerMessage = {
			type: 'connected',
			clientId,
			gameState,
		};
		ws.send(JSON.stringify(response));

		// Send round history to dealer
		if (ws.data.type === 'dealer') {
			const statsMessage: ServerMessage = {
				type: 'stats_update',
				data: {
					rounds: getRoundHistory(),
				},
			};
			ws.send(JSON.stringify(statsMessage));
		}
	},

	message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
		try {
			const data = JSON.parse(message.toString()) as ClientMessage;

			// Handle ping/pong
			if (data.type === 'ping') {
				ws.send(JSON.stringify({ type: 'pong' }));
				return;
			}

			// Route messages based on client type
			if (ws.data.type === 'dealer') {
				handleDealerMessage(ws, data);
			} else if (ws.data.type === 'display') {
				handleDisplayMessage(ws, data);
			}
		} catch (error) {
			console.error('WebSocket message error:', error);
			ws.send(
				JSON.stringify({
					type: 'error',
					code: 'INVALID_MESSAGE',
					message: 'Invalid message format',
				})
			);
		}
	},

	close(ws: ServerWebSocket<WebSocketData>) {
		const { clientId, type } = ws.data;

		// Unsubscribe from all topics
		unsubscribe(ws, TOPICS.GAME_STATE);

		if (type === 'dealer') {
			unsubscribe(ws, TOPICS.DEALER);
		}

		clients.delete(clientId);
	},

	drain(ws: ServerWebSocket<WebSocketData>) {
		// Handle backpressure - called when the socket is ready to receive more data
	},
};

/**
 * Get all connected clients
 */
export function getClients(): Map<string, ServerWebSocket<WebSocketData>> {
	return clients;
}

/**
 * Get a specific client by ID
 */
export function getClient(clientId: string): ServerWebSocket<WebSocketData> | undefined {
	return clients.get(clientId);
}
