import type { ServerMessage } from '@shared/types';
import { getClients } from './server';
import { TOPICS } from './topics';

/**
 * Broadcast a message to all connected clients (game-state topic)
 */
export function broadcast(message: ServerMessage): void {
	const clients = getClients();
	const messageStr = JSON.stringify(message);

	for (const [_, ws] of clients) {
		ws.publish(TOPICS.GAME_STATE, messageStr);
		break; // Only need to publish once, pub/sub handles distribution
	}

	// Fallback: direct send to all if pub/sub doesn't work
	if (clients.size > 0) {
		for (const [_, ws] of clients) {
			try {
				ws.send(messageStr);
			} catch (error) {
				console.error('Broadcast error:', error);
			}
		}
	}
}

/**
 * Broadcast a message to the dealer
 */
export function broadcastToDealer(message: ServerMessage): void {
	const clients = getClients();
	const messageStr = JSON.stringify(message);

	// Find the dealer's WebSocket and send directly
	for (const [_, ws] of clients) {
		if (ws.data.type === 'dealer') {
			try {
				ws.send(messageStr);
			} catch (error) {
				console.error('Dealer broadcast error:', error);
			}
		}
	}
}

/**
 * Broadcast a message to all display clients
 */
export function broadcastToDisplays(message: ServerMessage): void {
	const clients = getClients();
	const messageStr = JSON.stringify(message);

	for (const [_, ws] of clients) {
		if (ws.data.type === 'display') {
			try {
				ws.send(messageStr);
			} catch (error) {
				console.error('Display broadcast error:', error);
			}
		}
	}
}
