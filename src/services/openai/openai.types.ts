import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export interface IOpenai {
	transcription(filepath: string): Promise<string>;

	chat(messages: ChatCompletionMessageParam[]): Promise<string>;
}

export enum ChatRoles {
	ASSISTANT = 'assistant',
	USER = 'user',
	SYSTEM = 'system',
}
