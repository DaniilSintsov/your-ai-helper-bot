import { ICtxWithSession } from '../../types.js';

export interface IMessageService {
	handleText(ctx: ICtxWithSession): Promise<string>;

	handleVoice(ctx: ICtxWithSession): Promise<IHandleVoiceReturn>;
}

export interface IHandleVoiceReturn {
	transcription: string;
	response: string;
}
