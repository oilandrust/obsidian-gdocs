import { Plugin, TFile, WorkspaceLeaf, type OpenViewState } from "obsidian";
import { VIEW_TYPE_GDOCS } from "./constants";
import { registerGdocsEmbeds } from "./gdocs-embed";
import { GDocsView } from "./gdocs-view";
import { parseGdriveShortcut } from "./parse-gdrive-shortcut";
import { readGdriveShortcutFile } from "./read-gdrive-shortcut-file";
import {
	DEFAULT_SETTINGS,
	GDocsSettingTab,
	parseGDocsSettings,
	type GDocsSettings,
} from "./settings";

export default class GDocsPlugin extends Plugin {
	settings: GDocsSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerOpenFilePatch();

		this.registerView(
			VIEW_TYPE_GDOCS,
			(leaf) => new GDocsView(leaf, this),
		);

		const extensions = this.getActiveExtensions();
		if (extensions.length > 0) {
			this.registerExtensions(extensions, VIEW_TYPE_GDOCS);
		}

		registerGdocsEmbeds(this);

		this.addSettingTab(new GDocsSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		const loaded: unknown = await this.loadData();
		this.settings = parseGDocsSettings(loaded);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	getActiveExtensions(): string[] {
		return this.settings.extensions.filter((ext) => ext.length > 0);
	}

	private registerOpenFilePatch(): void {
		const self = this;
		const originalOpenFile = WorkspaceLeaf.prototype.openFile;

		WorkspaceLeaf.prototype.openFile = async function (
			this: WorkspaceLeaf,
			file: TFile,
			openState?: OpenViewState,
		): Promise<void> {
			if (
				self.settings.openBehavior === "browser" &&
				file instanceof TFile &&
				self.settings.extensions.includes(file.extension?.toLowerCase())
			) {
				const readResult = await readGdriveShortcutFile(self.app, file);
				if (readResult.ok) {
					const parsed = parseGdriveShortcut(readResult.raw, file.extension);
					if (parsed.ok) {
						window.open(parsed.url, "_blank");
						if (this.getViewState().type === "empty") {
							this.detach();
						}
						return;
					}
				}
			}
			return originalOpenFile.call(this, file, openState);
		};

		this.register(() => {
			WorkspaceLeaf.prototype.openFile = originalOpenFile;
		});
	}
}
