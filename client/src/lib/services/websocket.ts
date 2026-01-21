import type { ClientType, ClientMessage, ServerMessage } from '@shared/types/index';

type MessageHandler = (message: ServerMessage) => void;

class WebSocketService {
	private ws: WebSocket | null = null;
	private url: string = '';
	private clientType: ClientType = 'display';
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 10;
	private reconnectDelay = 5000;
	private handlers: Map<string, Set<MessageHandler>> = new Map();
	private isConnecting = false;
	private pingInterval: ReturnType<typeof setInterval> | null = null;

	/**
	 * Connect to WebSocket server
	 */
	connect(type: ClientType): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.isConnecting) {
				reject(new Error('Already connecting'));
				return;
			}

			this.clientType = type;
			this.isConnecting = true;

			// Build WebSocket URL
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const host = window.location.host;
			const wsUrl = `${protocol}//${host}/ws?type=${type}`;
			this.url = wsUrl;

			try {
				this.ws = new WebSocket(wsUrl);

				this.ws.onopen = () => {
					console.log('WebSocket connected');
					this.isConnecting = false;
					this.reconnectAttempts = 0;
					this.startPingInterval();
					resolve();
				};

				this.ws.onmessage = (event) => {
					try {
						const message = JSON.parse(event.data) as ServerMessage;
						this.handleMessage(message);
					} catch (error) {
						console.error('Failed to parse WebSocket message:', error);
					}
				};

				this.ws.onclose = (event) => {
					console.log('WebSocket disconnected:', event.code, event.reason);
					this.isConnecting = false;
					this.stopPingInterval();
					this.attemptReconnect();
				};

				this.ws.onerror = (error) => {
					console.error('WebSocket error:', error);
					this.isConnecting = false;
					reject(error);
				};
			} catch (error) {
				this.isConnecting = false;
				reject(error);
			}
		});
	}

	/**
	 * Disconnect from WebSocket server
	 */
	disconnect(): void {
		this.stopPingInterval();
		this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}

	/**
	 * Send a message to the server
	 */
	send(message: ClientMessage): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.error('WebSocket not connected');
			return;
		}
		this.ws.send(JSON.stringify(message));
	}

	/**
	 * Subscribe to a message type
	 */
	on(messageType: string, handler: MessageHandler): () => void {
		if (!this.handlers.has(messageType)) {
			this.handlers.set(messageType, new Set());
		}
		this.handlers.get(messageType)!.add(handler);

		// Return unsubscribe function
		return () => {
			this.handlers.get(messageType)?.delete(handler);
		};
	}

	/**
	 * Subscribe to all messages
	 */
	onAny(handler: MessageHandler): () => void {
		return this.on('*', handler);
	}

	/**
	 * Check if connected
	 */
	get isConnected(): boolean {
		return this.ws?.readyState === WebSocket.OPEN;
	}

	private handleMessage(message: ServerMessage): void {
		// Call specific handlers
		const handlers = this.handlers.get(message.type);
		if (handlers) {
			handlers.forEach((handler) => handler(message));
		}

		// Call wildcard handlers
		const anyHandlers = this.handlers.get('*');
		if (anyHandlers) {
			anyHandlers.forEach((handler) => handler(message));
		}
	}

	private attemptReconnect(): void {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.log('Max reconnection attempts reached');
			return;
		}

		this.reconnectAttempts++;
		console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

		setTimeout(() => {
			this.connect(this.clientType).catch((error) => {
				console.error('Reconnection failed:', error);
			});
		}, this.reconnectDelay);
	}

	private startPingInterval(): void {
		this.pingInterval = setInterval(() => {
			if (this.isConnected) {
				this.send({ type: 'ping' });
			}
		}, 30000); // Ping every 30 seconds
	}

	private stopPingInterval(): void {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}
	}
}

// Singleton instance
export const websocket = new WebSocketService();
