export interface ILoader {
	show(): Promise<void>;
	hide(): Promise<void>;
}
