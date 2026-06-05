import { App, PluginSettingTab, Setting } from "obsidian";
import type GDocsPlugin from "./main";
import { DEFAULT_GDRIVE_EXTENSIONS } from "./constants";

export interface GDocsSettings {
	extensions: string[];
}

export const DEFAULT_SETTINGS: GDocsSettings = {
	extensions: [...DEFAULT_GDRIVE_EXTENSIONS],
};

export class GDocsSettingTab extends PluginSettingTab {
	plugin: GDocsPlugin;

	constructor(app: App, plugin: GDocsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName("GDocs settings").setHeading();

		new Setting(containerEl)
			.setName("Supported extensions")
			.setDesc(DEFAULT_GDRIVE_EXTENSIONS.map((e) => "." + e).join(", "));
	}
}
