import 'dotenv/config';
import { message } from 'telegraf/filters';
import { Telegraf } from 'telegraf';

if (!process.env.BOT_TOKEN) {
	throw new Error('BOT_TOKEN is not defined');
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on(message('voice'), ctx =>
	ctx.reply(JSON.stringify(ctx.message.voice, null, 2))
);

bot.on(message('text'), ctx => ctx.reply(ctx.message.text));

bot.command('start', async ctx => {
	await ctx.reply(JSON.stringify(ctx.message, null, 2));
});

bot.launch();

// If the nodejs process has terminated, stop the bot
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
