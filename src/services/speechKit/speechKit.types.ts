export interface ISpeechKit {
	transcription(filepath: string): Promise<string>;
}
