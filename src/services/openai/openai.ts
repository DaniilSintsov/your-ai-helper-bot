import OpenAI from 'openai';
import { createReadStream } from 'fs';
import { IOpenai } from './openai.types.js';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class Openai implements IOpenai {
	private openai: OpenAI;

	constructor({ apiKey, apiBase }: Record<string, string>) {
		this.openai = new OpenAI({
			apiKey,
			baseURL: apiBase,
		});
	}

	public async chat(messages: ChatCompletionMessageParam[]): Promise<string> {
		try {
			const response = await this.openai.chat.completions.create({
				messages,
				model: 'gpt-3.5-turbo',
			});
			const result: string | null = response.choices[0].message.content;

			if (result) return result;

			throw new Error('Empty chat completion');
		} catch (error: unknown) {
			throw new Error(
				`Error while creating chat completion ${error instanceof Error ? error.message : error}`,
			);
		}
	}

	public async transcription(filepath: string): Promise<string> {
		try {
			const response = await this.openai.audio.transcriptions.create({
				file: createReadStream(filepath),
				model: 'whisper-1',
			});

			if (response.text) return response.text;

			throw new Error('Empty transcription');
		} catch (error: unknown) {
			throw new Error(
				`Error while creating transcription ${error instanceof Error ? error.message : error}`,
			);
		}
	}
}
