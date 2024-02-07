import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import 'dotenv/config';
import { ICtxWithSession, TYPES } from './types.js';
import { session, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { ICommandController } from './controllers/command/command.types.js';
import { IMessageController } from './controllers/message/message.types.js';
import { ILogger } from './services/logger/logger.types.js';

@injectable()
export class App {
	private bot: Telegraf<ICtxWithSession>;

	constructor(
		@inject(TYPES.CommandController) private readonly commandController: ICommandController,
		@inject(TYPES.MessageController) private readonly messageController: IMessageController,
		@inject(TYPES.Logger) private readonly logger: ILogger,
	) {
		if (!process.env.BOT_TOKEN) {
			throw new Error('BOT_TOKEN is not defined');
		}
		this.bot = new Telegraf<ICtxWithSession>(process.env.BOT_TOKEN);
	}

	private useMiddlewares(): void {
		this.bot.use(session());
	}

	private useCommands(): void {
		this.bot.command('start', this.commandController.start.bind(this.commandController));
		this.bot.command('new', this.commandController.newChat.bind(this.commandController));
	}

	private useMessages(): void {
		this.bot.on(message('text'), this.messageController.text.bind(this.messageController));
		this.bot.on(message('voice'), this.messageController.voice.bind(this.messageController));
		this.bot.on(message('sticker'), async ctx => {
			console.log(ctx);
		});
	}

	public async init(): Promise<void> {
		this.useMiddlewares();
		this.useCommands();
		this.useMessages();
		this.useMessages();
		this.bot.catch((error: unknown) =>
			this.logger.error(error instanceof Error ? error.message : error),
		);
		await this.bot.launch();
	}

	public async kill(eventName: NodeJS.Signals): Promise<void> {
		this.bot.stop(eventName);
	}
}
