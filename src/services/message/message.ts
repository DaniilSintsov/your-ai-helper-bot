import { ICtxWithSession, TYPES } from '../../types.js';
import { IHandleVoiceReturn, IMessageService } from './message.types.js';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ChatRoles, IOpenai } from '../openai/openai.types.js';
import { IOggConverter } from '../oggConverter/oggConverter.types.js';
import { ISpeechKit } from '../speechKit/speechKit.types.js';

@injectable()
export class MessageService implements IMessageService {
	constructor(
		@inject(TYPES.Openai) private readonly openai: IOpenai,
		@inject(TYPES.OggConverter) private readonly oggConverter: IOggConverter,
		@inject(TYPES.SpeechKit) private readonly speechKit: ISpeechKit,
	) {}

	async handleText(ctx: ICtxWithSession): Promise<string> {
		try {
			if (!ctx.message || !('text' in ctx.message)) {
				throw new Error('Text message not found');
			}

			ctx.session.messages.push({
				role: ChatRoles.USER,
				content: ctx.message?.text,
			});
			const response: string = await this.openai.chat(ctx.session.messages);
			ctx.session.messages.push({
				role: ChatRoles.ASSISTANT,
				content: response,
			});
			return response;
		} catch (error: unknown) {
			throw new Error(
				`Error while handling text message ${error instanceof Error ? error.message : error}`,
			);
		}
	}

	async handleVoice(ctx: ICtxWithSession): Promise<IHandleVoiceReturn> {
		try {
			if (!ctx.message || !('voice' in ctx.message) || !('from' in ctx.message)) {
				throw new Error('Voice message not found');
			}

			const link: URL = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
			const userId: string = String(ctx.message.from.id);

			const oggPath: string = await this.oggConverter.createOgg(link.href, userId);
			const converted: string = await this.oggConverter.convert(
				oggPath,
				userId + 'converted',
				'ogg',
			);
			const transcription: string = await this.speechKit.transcription(converted);

			ctx.session.messages.push({
				role: ChatRoles.USER,
				content: transcription,
			});
			const response: string = await this.openai.chat(ctx.session.messages);
			ctx.session.messages.push({
				role: ChatRoles.ASSISTANT,
				content: response,
			});

			return { transcription, response };
		} catch (error: unknown) {
			throw new Error(
				`Error while handling voice message ${error instanceof Error ? error.message : error}`,
			);
		}
	}
}
