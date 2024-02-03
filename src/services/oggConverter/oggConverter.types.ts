export interface IOggConverter {
	create(url: string, filename: string): Promise<string>;

	toMp3(oggPath: string, outputFilename: string): Promise<string>;
}
