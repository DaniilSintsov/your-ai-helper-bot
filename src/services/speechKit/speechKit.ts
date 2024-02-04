import { ISpeechKit } from './speechKit.types.js';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { createReadStream } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';

@injectable()
export class SpeechKit implements ISpeechKit {
	private readonly apiKey: string;
	private readonly apiBase: string;

	constructor({ apiKey, apiBase }: Record<string, string>) {
		this.apiKey = apiKey;
		this.apiBase = apiBase;
	}

	private getBuffer(filepath: string): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			try {
				const readStream = createReadStream(filepath);
				const chunks: Buffer[] = [];

				readStream.on('data', (chunk: Buffer) => {
					chunks.push(chunk);
				});

				readStream.on('end', () => {
					resolve(Buffer.concat(chunks));
				});
			} catch (error: unknown) {
				reject(error instanceof Error ? error.message : error);
			}
		});
	}

	async transcription(filepath: string): Promise<string> {
		try {
			const buffer: Buffer = await this.getBuffer(filepath);
			const axiosConfig: AxiosRequestConfig = {
				method: 'POST',
				url: this.apiBase,
				headers: {
					Authorization: `Api-Key ${this.apiKey}`,
				},
				data: buffer,
			};

			const { data } = await axios(axiosConfig);
			if (data?.result) return data.result;

			throw new Error('Empty transcription');
		} catch (error: unknown) {
			throw new Error(
				`Error while creating transcription ${error instanceof Error ? error.message : error}`,
			);
		}
	}
}
