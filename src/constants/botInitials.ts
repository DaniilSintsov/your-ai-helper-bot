import { ISession } from '../types.js';

export const INITIAL_SESSION: ISession = {
	messages: [],
};

export const STANDARD_REPLIES: Record<string, string> = {
	startCommand:
		'Привет. Я твой AI помощник. Помогу тебе решить твои проблемы, используя мощи нейросетей. Мне можно задавать вопросы текстом и голосом. Попробуй прямо сейчас!',
	newCommand: 'Новый чат создан. Жду твоего сообщения',
	loader: 'Обрабатываю запрос...',
	transcriptionCaption: 'Ваш запрос',
};

export const ERROR_REPLIES: Record<string, string> = {
	chat: 'Что-то пошло не так. Попробуйте ещё раз позже',
	transcription: 'Что-то пошло не так. Попробуйте ещё раз позже',
};

export const ANIMATED_LOADER_FILE: string = 'AnimatedSticker.tgs';
