import { ILogger } from '../logger/logger.types.js';
import { ICtxWithSession } from '../../types.js';

export interface ILoader {
	show(): Promise<void>;

	hide(): Promise<void>;
}

export interface ILoaderConstructor {
	ctx: ICtxWithSession;
	logger: ILogger;
}
