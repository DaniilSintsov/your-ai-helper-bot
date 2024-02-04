import { ICtxWithSession, TYPES } from '../../types.js';
import { IMessageController } from './message.types.js';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ERROR_REPLIES, INITIAL_SESSION } from '../../constants/botInitials.js';
import { ILoader } from '../../services/loader/loader.types.js';
import { Loader } from '../../services/loader/loader.js';
import { italic } from 'telegraf/format';
import { ILogger } from '../../services/logger/logger.types.js';
import { IMessageService } from '../../services/message/message.types.js';

@injectable()
export class MessageController implements IMessageController {
	constructor(
		@inject(TYPES.Logger) private readonly logger: ILogger,
		@inject(TYPES.MessageService) private readonly messageService: IMessageService,
	) {}

	async voice(ctx: ICtxWithSession): Promise<void> {
		ctx.session ??= INITIAL_SESSION;

		const loader: ILoader = new Loader(ctx, this.logger);
		await loader.show();

		try {
			const text: string = await this.messageService.handleVoice(ctx);
			loader.hide();
			await ctx.reply(text);
		} catch (error: unknown) {
			await loader.hide();
			await ctx.reply(italic(ERROR_REPLIES.transcription));

			if (error instanceof Error) {
				this.logger.error(error.message);
			}
		}
	}

	async text(ctx: ICtxWithSession): Promise<void> {
		ctx.session ??= INITIAL_SESSION;

		const loader: ILoader = new Loader(ctx, this.logger);
		await loader.show();

		try {
			const response: string = await this.messageService.handleText(ctx);
			await loader.hide();
			await ctx.replyWithMarkdown(response);
		} catch (error: unknown) {
			await loader.hide();
			await ctx.reply(italic(ERROR_REPLIES.chat));

			if (error instanceof Error) {
				this.logger.error(error.message);
			}
		}
	}
}
