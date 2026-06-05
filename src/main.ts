import { Plugin } from "obsidian";
import { DEFAULT_GDRIVE_EXTENSIONS, VIEW_TYPE_GDOCS } from "./constants";
import { GDocsView } from "./gdocs-view";
import {
	DEFAULT_SETTINGS,
	GDocsSettingTab,
	type GDocsSettings,
} from "./settings";

export default class GDocsPlugin extends Plugin {
	settings: GDocsSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_GDOCS,
			(leaf) => new GDocsView(leaf, this),
		);

		const extensions = this.getActiveExtensions();
		if (extensions.length > 0) {
			this.registerExtensions(extensions, VIEW_TYPE_GDOCS);
		}

		this.addSettingTab(new GDocsSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		const loaded = await this.loadData();
		this.settings = { ...DEFAULT_SETTINGS, ...loaded };
		if (!Array.isArray(this.settings.extensions)) {
			this.settings.extensions = [...DEFAULT_GDRIVE_EXTENSIONS];
		}
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	getActiveExtensions(): string[] {
		return this.settings.extensions.filter((ext) => ext.length > 0);
	}
}
