import { ICtxWithSession } from '../../types.js';

export interface IMessageController {
	text(ctx: ICtxWithSession): Promise<void>;

	voice(ctx: ICtxWithSession): Promise<void>;
}
