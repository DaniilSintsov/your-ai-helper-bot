import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { Context } from 'telegraf';

export interface ICtxWithSession extends Context {
	session: ISession;
}

export interface ISession {
	messages: ChatCompletionMessageParam[];
}
