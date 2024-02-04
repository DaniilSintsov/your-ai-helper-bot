import { ILogger } from './logger.types.js';
import { Logger } from 'tslog';
import 'reflect-metadata';
import { injectable } from 'inversify';

@injectable()
export class LoggerService implements ILogger {
	private readonly loggerConfig: { name: string };
	private logger: Logger<typeof this.loggerConfig>;

	constructor() {
		this.loggerConfig = { name: 'MainLogger' };
		this.logger = new Logger(this.loggerConfig);
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
