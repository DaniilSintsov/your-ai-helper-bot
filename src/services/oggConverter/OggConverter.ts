import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import installer from '@ffmpeg-installer/ffmpeg';
import { IOggConverter } from './OggConverter.types.js';
import { removeFile } from '../../helpers/removeFile.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class OggConverter implements IOggConverter {
	constructor() {
		ffmpeg.setFfmpegPath(installer.path);
	}

	async toMp3(oggPath: string, outputFilename: string): Promise<string> {
		try {
			const outputPath = resolve(
				dirname(oggPath),
				`${outputFilename}.mp3`
			);

			return new Promise((resolve, reject) => {
				ffmpeg(oggPath)
					.inputOption('-t 30')
					.output(outputPath)
					.on('end', () => {
						removeFile(oggPath);
						resolve(outputPath);
					})
					.on('error', error => reject((error as Error).message))
					.run();
			});
		} catch (error) {
			throw new Error(
				`Error while creating mp3 ${(error as Error).message}`
			);
		}
	}

	async create(url: string, filename: string): Promise<string> {
		try {
			const oggPath: string = resolve(
				__dirname,
				'../../../voices',
				`${filename}.ogg`
			);
			const response = await axios({
				url,
				method: 'get',
				responseType: 'stream'
			});

			return new Promise(resolve => {
				const stream = createWriteStream(oggPath);
				response.data.pipe(stream);
				stream.on('finish', () => resolve(oggPath));
			});
		} catch (error) {
			throw new Error(
				`Error while creating ogg ${(error as Error).message}`
			);
		}
	}
}
