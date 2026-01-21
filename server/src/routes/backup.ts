import { getBackupData } from '../game/session-store';
import { writeBackup, readLatestBackup, getBackupInfo } from '../game/backup';
import { requireDealerAuth } from './auth';

export async function handleBackupRoutes(req: Request): Promise<Response> {
	const url = new URL(req.url);
	const path = url.pathname;
	const method = req.method;

	// POST /api/backup - Trigger manual backup
	if (path === '/api/backup' && method === 'POST') {
		return requireDealerAuth(req, handleTriggerBackup);
	}

	// GET /api/backup - Download latest backup
	if (path === '/api/backup' && method === 'GET') {
		return requireDealerAuth(req, handleGetBackup);
	}

	return new Response('Not found', { status: 404 });
}

async function handleTriggerBackup(): Promise<Response> {
	const data = getBackupData();

	if (!data) {
		return new Response(JSON.stringify({ error: 'No session data to backup' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const filename = await writeBackup(data);

	if (!filename) {
		return new Response(JSON.stringify({ error: 'Failed to create backup' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response(
		JSON.stringify({
			filename,
			timestamp: new Date().toISOString(),
		}),
		{ status: 200, headers: { 'Content-Type': 'application/json' } }
	);
}

async function handleGetBackup(): Promise<Response> {
	const backup = await readLatestBackup();

	if (!backup) {
		return new Response(JSON.stringify({ error: 'No backup available' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response(JSON.stringify(backup), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}
