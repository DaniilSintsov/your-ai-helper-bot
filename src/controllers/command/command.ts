import { ICommandController } from './command.types.js';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { ICtxWithSession } from '../../types.js';
import { INITIAL_SESSION, STANDARD_REPLIES } from '../../constants/botInitials.js';

@injectable()
export class CommandController implements ICommandController {
	async start(ctx: ICtxWithSession): Promise<void> {
		ctx.session = INITIAL_SESSION;
		await ctx.reply(STANDARD_REPLIES.startCommand);
	}

	async newChat(ctx: ICtxWithSession): Promise<void> {
		ctx.session = INITIAL_SESSION;
		await ctx.reply(STANDARD_REPLIES.newCommand);
	}
}
