import { Message } from 'telegraf/types';
import { italic } from 'telegraf/format';
import { ILoader, ILoaderConstructor } from './loader.types.js';
import { ICtxWithSession } from '../../types.js';
import { ILogger } from '../logger/logger.types.js';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class Loader implements ILoader {
	private textMessage: Message | null = null;
	private animatedMessage: Message | null = null;
	private ctx: ICtxWithSession;
	private readonly textForMessage: string;
	private readonly fileForAnimatedMessage: string;
	private readonly logger: ILogger;

	constructor({ ctx, textForMessage, fileForAnimatedMessage, logger }: ILoaderConstructor) {
		this.ctx = ctx;
		this.textForMessage = textForMessage;
		this.fileForAnimatedMessage = fileForAnimatedMessage;
		this.logger = logger;
	}

	async show(): Promise<void> {
		try {
			this.textMessage = await this.ctx.reply(italic(this.textForMessage));
			this.animatedMessage = await this.ctx.replyWithSticker({
				source: resolve(__dirname, '../../../assets', this.fileForAnimatedMessage),
			});
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
