import {
	createSession,
	getSession,
	endSession,
	verifyDealerPassword,
} from '../game/session-store';
import { requireDealerAuth } from './auth';

export async function handleSessionRoutes(req: Request): Promise<Response> {
	const url = new URL(req.url);
	const path = url.pathname;
	const method = req.method;

	// POST /api/session - Create new session
	if (path === '/api/session' && method === 'POST') {
		return handleCreateSession(req);
	}

	// GET /api/session - Get current session
	if (path === '/api/session' && method === 'GET') {
		return handleGetSession();
	}

	// POST /api/session/end - End current session
	if (path === '/api/session/end' && method === 'POST') {
		return requireDealerAuth(req, handleEndSession);
	}

	return new Response('Not found', { status: 404 });
}

async function handleCreateSession(req: Request): Promise<Response> {
	try {
		const body = await req.json();
		const { dealerPassword } = body;

		if (!dealerPassword || typeof dealerPassword !== 'string' || dealerPassword.length < 4) {
			return new Response(
				JSON.stringify({ error: 'Invalid password. Must be at least 4 characters.' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		const session = createSession(dealerPassword);

		return new Response(
			JSON.stringify({
				id: session.id,
				createdAt: session.createdAt.toISOString(),
				endedAt: null,
				status: session.status,
				roundCount: 0,
			}),
			{ status: 201, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to create session';
		return new Response(JSON.stringify({ error: message }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

function handleGetSession(): Response {
	const session = getSession();

	if (!session) {
		return new Response(JSON.stringify({ error: 'No active session' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response(
		JSON.stringify({
			id: session.id,
			createdAt: session.createdAt.toISOString(),
			endedAt: session.endedAt?.toISOString() ?? null,
			status: session.status,
			roundCount: session.rounds.length,
		}),
		{ status: 200, headers: { 'Content-Type': 'application/json' } }
	);
}

function handleEndSession(): Response {
	const session = endSession();

	if (!session) {
		return new Response(JSON.stringify({ error: 'No active session' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response(
		JSON.stringify({
			id: session.id,
			createdAt: session.createdAt.toISOString(),
			endedAt: session.endedAt?.toISOString() ?? null,
			status: session.status,
			roundCount: session.rounds.length,
		}),
		{ status: 200, headers: { 'Content-Type': 'application/json' } }
	);
}
