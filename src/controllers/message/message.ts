import { ICtxWithSession, TYPES } from '../../types.js';
import { IMessageController } from './message.types.js';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import {
	ANIMATED_LOADER_FILE,
	ERROR_REPLIES,
	INITIAL_SESSION,
	STANDARD_REPLIES,
} from '../../constants/botInitials.js';
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
		const loader: ILoader = new Loader({
			ctx,
			logger: this.logger,
			textForMessage: STANDARD_REPLIES.loader,
			fileForAnimatedMessage: ANIMATED_LOADER_FILE,
		});

		try {
			ctx.session ??= INITIAL_SESSION;
			await loader.show();
			const { response, transcription } = await this.messageService.handleVoice(ctx);
			await loader.hide();
			await ctx.reply(
				`_${STANDARD_REPLIES.transcriptionCaption}_:\n\`\`\`\n${transcription}\n\`\`\``,
				{
					parse_mode: 'Markdown',
				},
			);
			await ctx.reply(response, { parse_mode: 'Markdown' });
		} catch (error: unknown) {
			await loader.hide();
			await ctx.reply(italic(ERROR_REPLIES.transcription));

			if (error instanceof Error) {
				this.logger.error(error.message);
			}
		}
	}

	async text(ctx: ICtxWithSession): Promise<void> {
		const loader: ILoader = new Loader({
			ctx,
			logger: this.logger,
			textForMessage: STANDARD_REPLIES.loader,
			fileForAnimatedMessage: ANIMATED_LOADER_FILE,
		});

		try {
			ctx.session ??= INITIAL_SESSION;
			await loader.show();
			const response: string = await this.messageService.handleText(ctx);
			await loader.hide();
			await ctx.reply(response, { parse_mode: 'Markdown' });
		} catch (error: unknown) {
			await loader.hide();
			await ctx.reply(italic(ERROR_REPLIES.chat));

			if (error instanceof Error) {
				this.logger.error(error.message);
			}
		}
	}
}
