import { Message } from 'telegraf/types';
import { italic } from 'telegraf/format';
import { ILoader, ILoaderConstructor } from './loader.types.js';
import { ICtxWithSession } from '../../types.js';
import { ILogger } from '../logger/logger.types.js';
import { ANIMATED_LOADER_STICKER_ID, STANDARD_REPLIES } from '../../constants/botInitials.js';

export class Loader implements ILoader {
	private textMessage: Message | null = null;
	private animatedMessage: Message | null = null;
	private ctx: ICtxWithSession;
	private readonly logger: ILogger;

	constructor({ ctx, logger }: ILoaderConstructor) {
		this.ctx = ctx;
		this.logger = logger;
	}

	async show(): Promise<void> {
		try {
			this.textMessage = await this.ctx.reply(italic(STANDARD_REPLIES.loader));

			this.animatedMessage = await this.ctx.replyWithSticker(ANIMATED_LOADER_STICKER_ID);
		} catch (error: unknown) {
			this.logger.error(
				`Error while showing loader ${error instanceof Error ? error.message : error}`,
			);
		}
	}

	async hide(): Promise<void> {
		try {
			if (
				this.ctx.chat?.id &&
				this.animatedMessage?.message_id &&
				this.textMessage?.message_id
			) {
				await this.ctx.telegram.deleteMessage(
					this.ctx.chat?.id,
					this.animatedMessage?.message_id,
				);
				await this.ctx.telegram.deleteMessage(
					this.ctx.chat?.id,
					this.textMessage?.message_id,
				);
			}
		} catch (error: unknown) {
			this.logger.error(
				`Error while hiding loader ${error instanceof Error ? error.message : error}`,
			);
		}
	}
}
