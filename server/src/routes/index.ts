import { handleSessionRoutes } from './session';
import { handleDealerRoutes } from './dealer';
import { handleBackupRoutes } from './backup';

export async function handleApiRequest(req: Request): Promise<Response> {
	const url = new URL(req.url);
	const path = url.pathname;

	// Session routes
	if (path.startsWith('/api/session')) {
		return handleSessionRoutes(req);
	}

	// Dealer routes
	if (path.startsWith('/api/dealer')) {
		return handleDealerRoutes(req);
	}

	// Backup routes
	if (path.startsWith('/api/backup')) {
		return handleBackupRoutes(req);
	}

	return new Response('Not found', { status: 404 });
}
