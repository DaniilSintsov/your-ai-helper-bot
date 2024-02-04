export interface IOggConverter {
	createOgg(url: string, filename: string): Promise<string>;

	convert(
		oggPath: string,
		outputFilename: string,
		outputFormat: ConverterFormat,
	): Promise<string>;
}

export type ConverterFormat = 'mp3' | 'ogg';
