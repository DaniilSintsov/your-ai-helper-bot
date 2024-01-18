import { unlink } from 'fs/promises';

export async function removeFile(path: string): Promise<void> {
	try {
		await unlink(path);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error('Error while removing file', error.message);
		}
	}
}
