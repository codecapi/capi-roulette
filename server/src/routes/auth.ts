import { verifyDealerPassword } from '../game/session-store';

/**
 * Parse HTTP Basic Auth header
 */
export function parseBasicAuth(authHeader: string | null): { username: string; password: string } | null {
	if (!authHeader || !authHeader.startsWith('Basic ')) {
		return null;
	}

	try {
		const base64 = authHeader.slice(6);
		const decoded = atob(base64);
		const [username, password] = decoded.split(':');
		return { username, password };
	} catch {
		return null;
	}
}

/**
 * Verify dealer authentication from request
 */
export function verifyDealerAuth(req: Request): boolean {
	const authHeader = req.headers.get('Authorization');
	const credentials = parseBasicAuth(authHeader);

	if (!credentials) {
		return false;
	}

	// For dealer auth, we only care about the password
	return verifyDealerPassword(credentials.password);
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(): Response {
	return new Response(JSON.stringify({ error: 'Unauthorized' }), {
		status: 401,
		headers: {
			'Content-Type': 'application/json',
			'WWW-Authenticate': 'Basic realm="Dealer Access"',
		},
	});
}

/**
 * Middleware to require dealer auth
 */
export function requireDealerAuth(
	req: Request,
	handler: (req: Request) => Promise<Response> | Response
): Promise<Response> | Response {
	if (!verifyDealerAuth(req)) {
		return unauthorizedResponse();
	}
	return handler(req);
}
