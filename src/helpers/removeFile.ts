import { unlink } from 'fs/promises';
import { ILogger } from '../services/logger/logger.types.js';

export async function removeFile(path: string, logger: ILogger): Promise<void> {
	try {
		await unlink(path);
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error('Error while removing file', error.message);
		}
	}
}
