import { createServer } from './server';

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = createServer();

console.log(`🎰 Capi Roulette server starting on port ${PORT}`);

export default {
	port: PORT,
	fetch: server.fetch,
	websocket: server.websocket,
};
