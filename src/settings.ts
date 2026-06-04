import { App, PluginSettingTab, Setting } from "obsidian";
import type GDocsPlugin from "./main";
import { DEFAULT_GDRIVE_EXTENSIONS } from "./constants";

export interface GDocsSettings {
	openInBrowserIfNoWebViewer: boolean;
	extensions: string[];
}

export const DEFAULT_SETTINGS: GDocsSettings = {
	openInBrowserIfNoWebViewer: true,
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

		containerEl.createEl("h2", { text: "GDocs settings" });

		new Setting(containerEl)
			.setName("Open in system browser when Web Viewer is off")
			.setDesc(
				"If the Web Viewer core plugin is disabled, open the Google document in your default browser instead of showing an error.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openInBrowserIfNoWebViewer)
					.onChange(async (value) => {
						this.plugin.settings.openInBrowserIfNoWebViewer = value;
						await this.plugin.saveSettings();
					}),
			);

		containerEl.createEl("p", {
			text: `Supported extensions: ${DEFAULT_GDRIVE_EXTENSIONS.map((e) => "." + e).join(", ")}`,
			cls: "setting-item-description",
		});
	}
}
