import type { ServerWebSocket } from 'bun';
import { handleApiRequest } from './routes';
import { handleWebSocket, type WebSocketData } from './websocket/server';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get directory of this file
const __dirname = dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = resolve(__dirname, '../../client/build');

export function createServer() {
	return {
		fetch(req: Request, server: ReturnType<typeof Bun.serve>): Response | Promise<Response> {
			const url = new URL(req.url);
			const path = url.pathname;

			// WebSocket upgrade
			if (path === '/ws') {
				const type = url.searchParams.get('type') as 'display' | 'dealer' | null;

				if (!type || !['display', 'dealer'].includes(type)) {
					return new Response('Invalid client type', { status: 400 });
				}

				const success = server.upgrade(req, {
					data: { type, clientId: '' } as WebSocketData,
				});

				if (success) {
					return undefined as unknown as Response;
				}
				return new Response('WebSocket upgrade failed', { status: 500 });
			}

			// API routes
			if (path.startsWith('/api/')) {
				return handleApiRequest(req);
			}

			// Serve static files from client build
			return serveStatic(req, path);
		},

		websocket: handleWebSocket,
	};
}

async function serveStatic(req: Request, path: string): Promise<Response> {
	// Default to index.html for SPA routing
	let filePath = path === '/' ? '/index.html' : path;

	// Try to serve the file
	const file = Bun.file(`${STATIC_DIR}${filePath}`);

	if (await file.exists()) {
		return new Response(file, {
			headers: {
				'Content-Type': getContentType(filePath),
			},
		});
	}

	// Fallback to index.html for SPA routes
	const indexFile = Bun.file(`${STATIC_DIR}/index.html`);
	if (await indexFile.exists()) {
		return new Response(indexFile, {
			headers: {
				'Content-Type': 'text/html',
			},
		});
	}

	return new Response('Not found', { status: 404 });
}

function getContentType(path: string): string {
	const ext = path.split('.').pop()?.toLowerCase();
	const contentTypes: Record<string, string> = {
		html: 'text/html',
		css: 'text/css',
		js: 'application/javascript',
		json: 'application/json',
		png: 'image/png',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		gif: 'image/gif',
		svg: 'image/svg+xml',
		ico: 'image/x-icon',
		woff: 'font/woff',
		woff2: 'font/woff2',
	};
	return contentTypes[ext || ''] || 'application/octet-stream';
}
