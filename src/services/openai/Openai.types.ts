import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export interface IOpenai {
	transcription(filepath: string): Promise<string | undefined>;
	chat(messages: ChatCompletionMessageParam[]): Promise<string | null>;
}

export enum ChatRoles {
	ASSISTANT = 'assistant',
	USER = 'user',
	SYSTEM = 'system'
}
