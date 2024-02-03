import { ILogger } from './logger.types.js';
import { Logger } from 'tslog';
import 'reflect-metadata';
import { injectable } from 'inversify';

@injectable()
export class LoggerService implements ILogger {
	private readonly logObj: { name: string };
	private logger: Logger<typeof this.logObj>;

	constructor() {
		this.logObj = { name: 'appLogger' };
		this.logger = new Logger(this.logObj);
	}

	log(...args: unknown[]): void {
		this.logger.info(...args);
	}

	error(...args: unknown[]): void {
		this.logger.error(...args);
	}

	warn(...args: unknown[]): void {
		this.logger.warn(...args);
	}
}
