import OpenAI from 'openai';
import { createReadStream } from 'fs';
import { IOpenai } from './Openai.types.js';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export class Openai implements IOpenai {
	private openai: OpenAI;

	constructor(apiKey: string, apiBase: string) {
		const openai = new OpenAI({
			apiKey,
			baseURL: apiBase
		});

		this.openai = openai;
	}

	async chat(messages: ChatCompletionMessageParam[]): Promise<string> {
		try {
			const response = await this.openai.chat.completions.create({
				messages,
				model: 'gpt-3.5-turbo'
			});
			const result: string | null = response.choices[0].message.content;

			if (result) return result;

			throw new Error('Empty chat completion');
		} catch (error) {
			throw new Error(
				`Error while creating chat completion ${
					(error as Error).message
				}`
			);
		}
	}

	async transcription(filepath: string): Promise<string> {
		try {
			const response = await this.openai.audio.transcriptions.create({
				file: createReadStream(filepath),
				model: 'whisper-1'
			});

			if (response.text) return response.text;

			throw new Error('Empty transcription');
		} catch (error) {
			throw new Error(
				`Error while creating transcription ${(error as Error).message}`
			);
		}
	}
}
