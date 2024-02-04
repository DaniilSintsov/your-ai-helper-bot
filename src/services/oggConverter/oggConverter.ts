import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import installer from '@ffmpeg-installer/ffmpeg';
import { ConverterFormat, IOggConverter } from './oggConverter.types.js';
import { removeFile } from '../../helpers/removeFile.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types.js';
import { ILogger } from '../logger/logger.types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

@injectable()
export class OggConverter implements IOggConverter {
	constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {
		ffmpeg.setFfmpegPath(installer.path);
	}

	async convert(
		oggPath: string,
		outputFilename: string,
		outputFormat: ConverterFormat,
	): Promise<string> {
		try {
			const outputPath = resolve(dirname(oggPath), `${outputFilename}.${outputFormat}`);

			return new Promise((resolve, reject) => {
				ffmpeg(oggPath)
					.inputOption('-t 30')
					.output(outputPath)
					.on('end', () => {
						removeFile(oggPath, this.logger);
						resolve(outputPath);
					})
					.on('error', error => reject(error instanceof Error ? error.message : error))
					.run();
			});
		} catch (error: unknown) {
			throw new Error(
				`Error while converting to ${outputFormat} ${error instanceof Error ? error.message : error}`,
			);
		}
	}

	async createOgg(url: string, filename: string): Promise<string> {
		try {
			const oggPath: string = resolve(__dirname, '../../../voices', `${filename}.ogg`);
			const response = await axios({
				url,
				method: 'get',
				responseType: 'stream',
			});

			return new Promise(resolve => {
				const stream = createWriteStream(oggPath);
				response.data.pipe(stream);
				stream.on('finish', () => resolve(oggPath));
			});
		} catch (error: unknown) {
			throw new Error(
				`Error while creating ogg ${error instanceof Error ? error.message : error}`,
			);
		}
	}
}
