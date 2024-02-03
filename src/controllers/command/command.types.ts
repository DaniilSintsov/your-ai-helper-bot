import { ICtxWithSession } from '../../types.js';

export interface ICommandController {
	start(ctx: ICtxWithSession): Promise<void>;

	newChat(ctx: ICtxWithSession): Promise<void>;
}
