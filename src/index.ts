import 'dotenv/config';
import { code } from 'telegraf/format';
import { message } from 'telegraf/filters';
import { Telegraf, session } from 'telegraf';
import { ICtxWithSession } from './index.types.js';
import { Openai } from './services/openai/Openai.js';
import { ChatRoles, IOpenai } from './services/openai/Openai.types.js';
import { OggConverter } from './services/oggConverter/OggConverter.js';
import { INITIAL_SESSION, START_REPLY } from './constants/botInitials.js';
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
	await ctx.reply(START_REPLY);
});

bot.command('new', async ctx => {
	(ctx as unknown as ICtxWithSession).session = INITIAL_SESSION;
	await ctx.reply('Жду вашего сообщения');
});

bot.on(message('voice'), async ctx => {
	const extendedCtx = ctx as unknown as ICtxWithSession;
	extendedCtx.session ??= INITIAL_SESSION;

	try {
		await ctx.reply(code('Ваш запрос обрабатывается...'));
		const link: URL = await ctx.telegram.getFileLink(
			ctx.message.voice.file_id
		);
		const userId: string = String(ctx.message.from.id);
		const ogg: IOggConverter = new OggConverter();

		const oggPath: string | undefined = await ogg.create(link.href, userId);
		if (!oggPath) return;

		const mp3Path: string | undefined = await ogg.toMp3(oggPath, userId);
		if (!mp3Path) return;

		const text: string | undefined = await openai.transcription(mp3Path);
		if (!text) return;

		await ctx.reply(text);
	} catch (error) {
		console.error(
			'Error while handling voice message',
			(error as Error).message
		);
	}
});

bot.on(message('text'), async ctx => {
	const extendedCtx = ctx as unknown as ICtxWithSession;
	extendedCtx.session ??= INITIAL_SESSION;

	try {
		await ctx.reply(code('Ваш запрос обрабатывается...'));

		extendedCtx.session.messages.push({
			role: ChatRoles.USER,
			content: ctx.message.text
		});
		const response = await openai.chat(extendedCtx.session.messages);
		if (!response) return;

		extendedCtx.session.messages.push({
			role: ChatRoles.ASSISTANT,
			content: response
		});
		ctx.replyWithMarkdown(response);
	} catch (error) {
		console.error(
			'Error while handling text message',
			(error as Error).message
		);
	}
});

bot.launch();

// If the nodejs process has terminated, stop the bot
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
