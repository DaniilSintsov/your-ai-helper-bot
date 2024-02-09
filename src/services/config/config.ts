import { IConfigService } from './config.types.js';
import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types.js';
import { ILogger } from '../logger/logger.types.js';
import 'reflect-metadata';

@injectable()
export class ConfigService implements IConfigService {
	private readonly config: DotenvParseOutput;

	constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {
		const result: DotenvConfigOutput = config();
		if (result.error) {
			throw new Error(result.error.message);
		} else {
			this.logger.log('[ConfigService] Loaded configurations');
			this.config = result.parsed as DotenvParseOutput;
		}
	}

	get(key: string): string {
		const value = this.config[key];
		if (value) return value;
		throw new Error(`Key ${key} is not defined`);
	}
}
