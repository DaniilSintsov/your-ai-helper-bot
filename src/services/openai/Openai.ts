import OpenAI from 'openai';
import { IOpenai } from './Openai.types.js';
import { createReadStream } from 'fs';
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

	async chat(messages: ChatCompletionMessageParam[]): Promise<string | null> {
		try {
			const response = await this.openai.chat.completions.create({
				messages,
				model: 'gpt-3.5-turbo'
			});
			return response.choices[0].message.content;
		} catch (error) {
			console.error(
				'Error while handling text request',
				(error as Error).message
			);
			return null;
		}
	}

	async transcription(filepath: string): Promise<string | undefined> {
		try {
			const response = await this.openai.audio.transcriptions.create({
				file: createReadStream(filepath),
				model: 'whisper-1'
			});

			console.log(response.text);

			return response.text;
		} catch (error) {
			console.error(
				'Error while creating transcription',
				(error as Error).message
			);
			return undefined;
		}
	}
}
