import { verifyDealerPassword, getSession } from '../game/session-store';
import { parseBasicAuth } from './auth';

export async function handleDealerRoutes(req: Request): Promise<Response> {
	const url = new URL(req.url);
	const path = url.pathname;
	const method = req.method;

	// POST /api/dealer/auth - Authenticate as dealer
	if (path === '/api/dealer/auth' && method === 'POST') {
		return handleDealerAuth(req);
	}

	return new Response('Not found', { status: 404 });
}

function handleDealerAuth(req: Request): Response {
	const authHeader = req.headers.get('Authorization');
	const credentials = parseBasicAuth(authHeader);

	if (!credentials) {
		return new Response(
			JSON.stringify({ error: 'Invalid authorization header' }),
			{
				status: 401,
				headers: {
					'Content-Type': 'application/json',
					'WWW-Authenticate': 'Basic realm="Dealer Access"',
				},
			}
		);
	}

	const isValid = verifyDealerPassword(credentials.password);

	if (!isValid) {
		return new Response(
			JSON.stringify({ error: 'Invalid credentials' }),
			{
				status: 401,
				headers: {
					'Content-Type': 'application/json',
					'WWW-Authenticate': 'Basic realm="Dealer Access"',
				},
			}
		);
	}

	const session = getSession();

	return new Response(
		JSON.stringify({
			authenticated: true,
			sessionId: session?.id ?? null,
		}),
		{ status: 200, headers: { 'Content-Type': 'application/json' } }
	);
}
