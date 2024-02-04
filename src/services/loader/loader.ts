import { LOADER_ICONS, LOADER_INTERVAL, STANDARD_REPLIES } from '../../constants/botInitials.js';
import { Message } from 'telegraf/types';
import { italic } from 'telegraf/format';
import { ILoader } from './loader.types.js';
import { ICtxWithSession } from '../../types.js';
import { ILogger } from '../logger/logger.types.js';

export class Loader implements ILoader {
	private icons: string[] = LOADER_ICONS;
	private textForMessage: string = STANDARD_REPLIES.loader;
	private textMessage: Message | null = null;
	private iconMessage: Message | null = null;
	private interval: NodeJS.Timeout | null = null;

	constructor(
		private ctx: ICtxWithSession,
		private readonly logger: ILogger,
	) {}

	async show(): Promise<void> {
		let index = 0;

		this.textMessage = await this.ctx.reply(italic(this.textForMessage));
		this.iconMessage = await this.ctx.reply(this.icons[index]);

		this.interval = setInterval(async () => {
			index = index < this.icons.length - 1 ? index + 1 : 0;

			if (this.ctx.chat?.id && this.iconMessage?.message_id) {
				try {
					await this.ctx.telegram.editMessageText(
						this.ctx.chat?.id,
						this.iconMessage?.message_id,
						undefined,
						this.icons[index],
					);
				} catch (error: unknown) {
					this.logger.error(
						`Error while showing loader ${error instanceof Error && error.message}`,
					);
				}
			}
		}, LOADER_INTERVAL);
	}

	async hide(): Promise<void> {
		try {
			if (this.interval) clearInterval(this.interval);
			if (this.ctx.chat?.id && this.iconMessage?.message_id && this.textMessage?.message_id) {
				await this.ctx.telegram.deleteMessage(
					this.ctx.chat?.id,
					this.iconMessage?.message_id,
				);
				await this.ctx.telegram.deleteMessage(
					this.ctx.chat?.id,
					this.textMessage?.message_id,
				);
			}
		} catch (error: unknown) {
			this.logger.error(
				`Error while hiding loader ${error instanceof Error && error.message}`,
			);
		}
	}
}
