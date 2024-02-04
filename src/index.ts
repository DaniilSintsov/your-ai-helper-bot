import 'reflect-metadata';
import { Container } from 'inversify';
import { App } from './app.js';
import { IBootstrapReturn, TYPES } from './types.js';
import { ILogger } from './services/logger/logger.types.js';
import { LoggerService } from './services/logger/logger.js';
import { IMessageController } from './controllers/message/message.types.js';
import { MessageController } from './controllers/message/message.js';
import { ICommandController } from './controllers/command/command.types.js';
import { CommandController } from './controllers/command/command.js';
import { IOpenai } from './services/openai/openai.types.js';
import { Openai } from './services/openai/openai.js';
import { IOggConverter } from './services/oggConverter/oggConverter.types.js';
import { OggConverter } from './services/oggConverter/oggConverter.js';
import { IMessageService } from './services/message/message.types.js';
import { MessageService } from './services/message/message.js';

function bootstrap(): IBootstrapReturn {
	const appContainer = new Container();
	appContainer.bind<ILogger>(TYPES.Logger).to(LoggerService);
	appContainer.bind<IOpenai>(TYPES.Openai).toDynamicValue(() => {
		if (!process.env.OPENAI_KEY) {
			throw new Error('OPENAI_KEY is not defined');
		}
		if (!process.env.OPENAI_API_BASE) {
			throw new Error('OPENAI_API_BASE is not defined');
		}
		return new Openai(process.env.OPENAI_KEY, process.env.OPENAI_API_BASE);
	});
	appContainer.bind<IOggConverter>(TYPES.OggConverter).to(OggConverter);
	appContainer.bind<IMessageController>(TYPES.MessageController).to(MessageController);
	appContainer.bind<IMessageService>(TYPES.MessageService).to(MessageService);
	appContainer.bind<ICommandController>(TYPES.CommandController).to(CommandController);
	appContainer.bind<App>(TYPES.App).to(App);

	const app: App = appContainer.get<App>(TYPES.App);
	app.init();

	return { app, appContainer };
}

export const { app, appContainer } = bootstrap();

process.once('SIGINT', () => app.kill('SIGINT'));
process.once('SIGTERM', () => app.kill('SIGTERM'));
