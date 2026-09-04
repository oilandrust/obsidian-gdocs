import { App, PluginSettingTab, Setting } from "obsidian";
import type GDocsPlugin from "./main";
import { DEFAULT_GDRIVE_EXTENSIONS } from "./constants";

export type OpenBehavior = "browser" | "embedded";

export interface GDocsSettings {
	openBehavior: OpenBehavior;
	enableWebviewToolbar: boolean;
	persistSession: boolean;
	customUserAgent: string;
	extensions: string[];
}

export const DEFAULT_SETTINGS: GDocsSettings = {
	openBehavior: "browser",
	enableWebviewToolbar: true,
	persistSession: true,
	customUserAgent: "",
	extensions: [...DEFAULT_GDRIVE_EXTENSIONS],
};

export function parseGDocsSettings(data: unknown): GDocsSettings {
	if (data === null || typeof data !== "object") {
		return { ...DEFAULT_SETTINGS };
	}
	const record = data as Record<string, unknown>;
	const openBehavior: OpenBehavior =
		record.openBehavior === "embedded" ? "embedded" : "browser";
	const enableWebviewToolbar =
		typeof record.enableWebviewToolbar === "boolean"
			? record.enableWebviewToolbar
			: DEFAULT_SETTINGS.enableWebviewToolbar;
	const persistSession =
		typeof record.persistSession === "boolean"
			? record.persistSession
			: DEFAULT_SETTINGS.persistSession;
	const customUserAgent =
		typeof record.customUserAgent === "string"
			? record.customUserAgent
			: DEFAULT_SETTINGS.customUserAgent;

	const rawExtensions = Array.isArray(record.extensions) ? record.extensions : [];
	const extensions = rawExtensions.filter(
		(ext): ext is string => typeof ext === "string" && ext.length > 0,
	);

	return {
		openBehavior,
		enableWebviewToolbar,
		persistSession,
		customUserAgent,
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
				"Choose how Google Drive shortcut files (.gdoc, .gsheet, etc.) open. Google restricts account login inside embedded desktop webviews (resulting in 401 Unauthorized). Opening in your default browser provides seamless authentication and full Google Workspace capabilities.",
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("browser", "System default browser (Recommended)")
					.addOption("embedded", "Embedded Webview")
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
			.setName("Custom User-Agent")
			.setDesc(
				"Optional: Override the User-Agent header for the embedded webview. Leave blank to use Obsidian's default.",
			)
			.addText((text) =>
				text
					.setPlaceholder("Mozilla/5.0 ...")
					.setValue(this.plugin.settings.customUserAgent)
					.onChange(async (value) => {
						this.plugin.settings.customUserAgent = value.trim();
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Supported extensions")
			.setDesc(DEFAULT_GDRIVE_EXTENSIONS.map((e) => "." + e).join(", "));
	}
}
