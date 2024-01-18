import 'dotenv/config';
import {
	ERROR_REPLIES,
	INITIAL_SESSION,
	STANDARD_REPLIES
} from './constants/botInitials.js';
import { italic } from 'telegraf/format';
import { message } from 'telegraf/filters';
import { Telegraf, session } from 'telegraf';
import { ICtxWithSession } from './index.types.js';
import { Openai } from './services/openai/Openai.js';
import { Loader } from './services/loader/Loader.js';
import { ILoader } from './services/loader/Loader.types.js';
import { ChatRoles, IOpenai } from './services/openai/Openai.types.js';
import { OggConverter } from './services/oggConverter/OggConverter.js';
import { IOggConverter } from './services/oggConverter/OggConverter.types.js';

if (!process.env.BOT_TOKEN) {
	throw new Error('BOT_TOKEN is not defined');
}
if (!process.env.OPENAI_KEY) {
	throw new Error('OPENAI_KEY is not defined');
}
if (!process.env.OPENAI_API_BASE) {
	throw new Error('OPENAI_API_BASE is not defined');
}

const bot: Telegraf = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

const openai: IOpenai = new Openai(
	process.env.OPENAI_KEY as string,
	process.env.OPENAI_API_BASE as string
);

bot.command('start', async ctx => {
	(ctx as unknown as ICtxWithSession).session = INITIAL_SESSION;
	await ctx.reply(STANDARD_REPLIES.startCommand);
});

bot.command('new', async ctx => {
	(ctx as unknown as ICtxWithSession).session = INITIAL_SESSION;
	await ctx.reply(STANDARD_REPLIES.newCommand);
});

bot.on(message('voice'), async ctx => {
	const extendedCtx = ctx as unknown as ICtxWithSession;
	extendedCtx.session ??= INITIAL_SESSION;

	const loader: ILoader = new Loader(ctx);
	await loader.show();

	try {
		const link: URL = await ctx.telegram.getFileLink(
			ctx.message.voice.file_id
		);
		const userId: string = String(ctx.message.from.id);
		const ogg: IOggConverter = new OggConverter();

		const oggPath: string = await ogg.create(link.href, userId);
		const mp3Path: string = await ogg.toMp3(oggPath, userId);
		const text: string = await openai.transcription(mp3Path);

		await loader.hide();

		await ctx.reply(text);
	} catch (error: unknown) {
		await loader.hide();
		await ctx.reply(italic(ERROR_REPLIES.transcription));

		if (error instanceof Error) {
			console.error('Error while handling voice message', error.message);
		}
	}
});

bot.on(message('text'), async ctx => {
	const extendedCtx = ctx as unknown as ICtxWithSession;
	extendedCtx.session ??= INITIAL_SESSION;

	const loader: ILoader = new Loader(ctx);
	await loader.show();

	try {
		extendedCtx.session.messages.push({
			role: ChatRoles.USER,
			content: ctx.message.text
		});
		const response: string = await openai.chat(
			extendedCtx.session.messages
		);
		extendedCtx.session.messages.push({
			role: ChatRoles.ASSISTANT,
			content: response
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
});

bot.launch();

// If the nodejs process has terminated, stop the bot
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
