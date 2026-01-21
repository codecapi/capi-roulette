import type { ServerWebSocket } from 'bun';
import type { WebSocketData } from './server';

// Pub/Sub topic names
export const TOPICS = {
	GAME_STATE: 'game-state',
	DEALER: 'dealer',
};

/**
 * Subscribe a WebSocket to a topic
 */
export function subscribe(ws: ServerWebSocket<WebSocketData>, topic: string): void {
	ws.subscribe(topic);
}

/**
 * Unsubscribe a WebSocket from a topic
 */
export function unsubscribe(ws: ServerWebSocket<WebSocketData>, topic: string): void {
	ws.unsubscribe(topic);
}
