import { App, PluginSettingTab, Setting } from "obsidian";
import type GDocsPlugin from "./main";
import { DEFAULT_GDRIVE_EXTENSIONS } from "./constants";

export type OpenBehavior = "embedded" | "browser";

export interface GDocsSettings {
	openBehavior: OpenBehavior;
	enableWebviewToolbar: boolean;
	persistSession: boolean;
	extensions: string[];
}

export const DEFAULT_SETTINGS: GDocsSettings = {
	openBehavior: "embedded",
	enableWebviewToolbar: true,
	persistSession: true,
	extensions: [...DEFAULT_GDRIVE_EXTENSIONS],
};

export function parseGDocsSettings(data: unknown): GDocsSettings {
	if (data === null || typeof data !== "object") {
		return { ...DEFAULT_SETTINGS };
	}
	const record = data as Record<string, unknown>;
	const openBehavior: OpenBehavior =
		record.openBehavior === "browser" ? "browser" : "embedded";
	const enableWebviewToolbar =
		typeof record.enableWebviewToolbar === "boolean"
			? record.enableWebviewToolbar
			: DEFAULT_SETTINGS.enableWebviewToolbar;
	const persistSession =
		typeof record.persistSession === "boolean"
			? record.persistSession
			: DEFAULT_SETTINGS.persistSession;

	const rawExtensions = Array.isArray(record.extensions) ? record.extensions : [];
	const extensions = rawExtensions.filter(
		(ext): ext is string => typeof ext === "string" && ext.length > 0,
	);

	return {
		openBehavior,
		enableWebviewToolbar,
		persistSession,
		extensions: extensions.length > 0 ? extensions : [...DEFAULT_GDRIVE_EXTENSIONS],
	};
}

export class GDocsSettingTab extends PluginSettingTab {
	plugin: GDocsPlugin;

	constructor(app: App, plugin: GDocsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName("Google Drive shortcuts").setHeading();

		new Setting(containerEl)
			.setName("Open behavior")
			.setDesc(
				"Choose how Google Drive shortcut files (.gdoc, .gsheet, etc.) open when clicked. By default, documents open inside Obsidian. If you experience Google 401 Unauthorized errors on private files or prefer full Google Workspace features, select System default browser.",
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("embedded", "Embedded Webview (Default)")
					.addOption("browser", "System default browser")
					.setValue(this.plugin.settings.openBehavior)
					.onChange(async (value) => {
						this.plugin.settings.openBehavior = value as OpenBehavior;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Show toolbar above embedded view")
			.setDesc(
				"Adds an action bar above the embedded webview with quick buttons to open in your default browser, refresh, and copy link.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableWebviewToolbar)
					.onChange(async (value) => {
						this.plugin.settings.enableWebviewToolbar = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Persist webview session partition")
			.setDesc(
				"Keeps cookies and cache across app restarts in the embedded webview (using partition='persist:gdocs').",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.persistSession)
					.onChange(async (value) => {
						this.plugin.settings.persistSession = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Supported extensions")
			.setDesc(DEFAULT_GDRIVE_EXTENSIONS.map((e) => "." + e).join(", "));
	}
}
