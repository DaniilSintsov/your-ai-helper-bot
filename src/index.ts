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
import { ISpeechKit } from './services/speechKit/speechKit.types.js';
import { SpeechKit } from './services/speechKit/speechKit.js';
import { IConfigService } from './services/config/config.types.js';
import { ConfigService } from './services/config/config.js';

function bootstrap(): IBootstrapReturn {
	const appContainer = new Container();
	appContainer.bind<ILogger>(TYPES.Logger).to(LoggerService).inSingletonScope();
	appContainer.bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	appContainer.bind<IOpenai>(TYPES.Openai).to(Openai).inSingletonScope();
	appContainer.bind<ISpeechKit>(TYPES.SpeechKit).to(SpeechKit).inSingletonScope();
	appContainer.bind<IOggConverter>(TYPES.OggConverter).to(OggConverter).inSingletonScope();
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

process.on('uncaughtException', error => {
	appContainer.get<ILogger>(TYPES.Logger).error(error);
	process.exit(1);
});
