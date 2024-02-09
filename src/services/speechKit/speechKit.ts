import { ISpeechKit } from './speechKit.types.js';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { createReadStream } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';
import { IConfigService } from '../config/config.types.js';
import { TYPES } from '../../types.js';

@injectable()
export class SpeechKit implements ISpeechKit {
	private readonly apiKey: string;
	private readonly apiBase: string;

	constructor(@inject(TYPES.ConfigService) private readonly configService: IConfigService) {
		this.apiKey = this.configService.get('SPEECH_KIT_API_KEY');
		this.apiBase = this.configService.get('SPEECH_KIT_API_BASE');
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
