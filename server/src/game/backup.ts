import type { BackupFile } from '@shared/types';
import { getBackupData } from './session-store';

const BACKUP_DIR = process.env.BACKUP_DIR ?? './backups';

/**
 * Write backup data to a JSON file
 */
export async function writeBackup(data: ReturnType<typeof getBackupData>): Promise<string | null> {
	if (!data) return null;

	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const filename = `session-${data.session.id.slice(0, 8)}-${timestamp}.json`;
	const filepath = `${BACKUP_DIR}/${filename}`;

	try {
		await Bun.write(filepath, JSON.stringify(data, null, 2));
		console.log(`Backup saved: ${filepath}`);
		return filename;
	} catch (error) {
		console.error('Failed to write backup:', error);
		return null;
	}
}

/**
 * Read the latest backup file
 */
export async function readLatestBackup(): Promise<BackupFile | null> {
	try {
		const glob = new Bun.Glob('session-*.json');
		const files: string[] = [];

		for await (const file of glob.scan({ cwd: BACKUP_DIR })) {
			files.push(file);
		}

		if (files.length === 0) return null;

		// Sort by filename (which includes timestamp) to get latest
		files.sort().reverse();
		const latestFile = files[0];

		const filepath = `${BACKUP_DIR}/${latestFile}`;
		const content = await Bun.file(filepath).text();
		return JSON.parse(content) as BackupFile;
	} catch (error) {
		console.error('Failed to read backup:', error);
		return null;
	}
}

/**
 * Get backup metadata
 */
export async function getBackupInfo(): Promise<{ filename: string; timestamp: string } | null> {
	try {
		const glob = new Bun.Glob('session-*.json');
		const files: string[] = [];

		for await (const file of glob.scan({ cwd: BACKUP_DIR })) {
			files.push(file);
		}

		if (files.length === 0) return null;

		files.sort().reverse();
		const latestFile = files[0];

		// Extract timestamp from filename
		const match = latestFile.match(/session-[^-]+-(.+)\.json/);
		const timestamp = match ? match[1].replace(/-/g, ':').replace('T', ' ') : '';

		return {
			filename: latestFile,
			timestamp,
		};
	} catch (error) {
		console.error('Failed to get backup info:', error);
		return null;
	}
}
