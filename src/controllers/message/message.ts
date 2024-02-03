import { ICtxWithSession, TYPES } from '../../types.js';
import { IMessageController } from './message.types.js';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ERROR_REPLIES, INITIAL_SESSION } from '../../constants/botInitials.js';
import { ILoader } from '../../services/loader/loader.types.js';
import { Loader } from '../../services/loader/loader.js';
import { ChatRoles, IOpenai } from '../../services/openai/openai.types.js';
import { italic } from 'telegraf/format';
import { IOggConverter } from '../../services/oggConverter/oggConverter.types.js';
import { OggConverter } from '../../services/oggConverter/oggConverter.js';

@injectable()
export class MessageController implements IMessageController {
	constructor(@inject(TYPES.Openai) private readonly openai: IOpenai) {}

	async voice(ctx: ICtxWithSession): Promise<void> {
		ctx.session ??= INITIAL_SESSION;

		const loader: ILoader = new Loader(ctx);
		await loader.show();

		try {
			if (!ctx.message || !('voice' in ctx.message) || !('from' in ctx.message)) {
				throw new Error('Voice message not found');
			}

			const link: URL = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
			const userId: string = String(ctx.message.from.id);
			const ogg: IOggConverter = new OggConverter();

			const oggPath: string = await ogg.create(link.href, userId);
			const mp3Path: string = await ogg.toMp3(oggPath, userId);
			const text: string = await this.openai.transcription(mp3Path);

			await loader.hide();

			await ctx.reply(text);
		} catch (error: unknown) {
			await loader.hide();
			await ctx.reply(italic(ERROR_REPLIES.transcription));

			if (error instanceof Error) {
				console.error('Error while handling voice message', error.message);
			}
		}
	}

	async text(ctx: ICtxWithSession): Promise<void> {
		ctx.session ??= INITIAL_SESSION;

		const loader: ILoader = new Loader(ctx);
		await loader.show();

		try {
			if (ctx.message && 'text' in ctx.message) {
				ctx.session.messages.push({
					role: ChatRoles.USER,
					content: ctx.message?.text,
				});
			}
			const response: string = await this.openai.chat(ctx.session.messages);

			ctx.session.messages.push({
				role: ChatRoles.ASSISTANT,
				content: response,
			});

			await loader.hide();
			await ctx.replyWithMarkdown(response);
		} catch (error: unknown) {
			await loader.hide();
			await ctx.reply(italic(ERROR_REPLIES.chat));

			if (error instanceof Error) {
				console.error('Error while handling text message', error.message);
			}
		}
	}
}
