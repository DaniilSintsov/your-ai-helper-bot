import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { Context } from 'telegraf';
import { Container } from 'inversify';
import { App } from './app.js';

export const TYPES = {
	App: Symbol.for('App'),
	Logger: Symbol.for('Logger'),
	Loader: Symbol.for('Loader'),
	CommandController: Symbol.for('CommandController'),
	MessageController: Symbol.for('MessageController'),
	Openai: Symbol.for('Openai'),
};

export interface ICtxWithSession extends Context {
	session: ISession;
}

export interface ISession {
	messages: ChatCompletionMessageParam[];
}

export interface IBootstrapReturn {
	app: App;
	appContainer: Container;
}
