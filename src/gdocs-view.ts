import {
	FileView,
	Platform,
	WorkspaceLeaf,
	type TFile,
} from "obsidian";
import type GDocsPlugin from "./main";
import { VIEW_TYPE_GDOCS } from "./constants";
import { parseGdriveShortcut } from "./parse-gdrive-shortcut";
import {
	GDRIVE_READ_HELP,
	readGdriveShortcutFile,
} from "./read-gdrive-shortcut-file";
import {
	mountGdocsWebview,
	showGdocsError,
	showGdocsMobileFallback,
} from "./gdocs-webview";

export class GDocsView extends FileView {
	plugin: GDocsPlugin;
	private embeddedWebview: HTMLElement | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: GDocsPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_GDOCS;
	}

	getDisplayText(): string {
		return this.file?.basename ?? "Google Drive";
	}

	canAcceptExtension(extension: string): boolean {
		return this.plugin.settings.extensions.includes(extension.toLowerCase());
	}

	async onOpen(): Promise<void> {
		this.contentEl.addClass("gdocs-view-host");
	}

	async onLoadFile(file: TFile): Promise<void> {
		const readResult = await readGdriveShortcutFile(this.app, file);
		if (!readResult.ok) {
			this.showError(readResult.error, null, readResult.detail, GDRIVE_READ_HELP);
			return;
		}

		const parsed = parseGdriveShortcut(readResult.raw, file.extension);
		if (!parsed.ok) {
			this.showError(parsed.error, null);
			return;
		}

		if (Platform.isMobile) {
			this.showMobileFallback(parsed.url);
			return;
		}

		this.embedWebview(parsed.url);
	}

	async onUnloadFile(_file: TFile): Promise<void> {
		this.clearWebview();
		this.clearError();
	}

	private clearWebview(): void {
		this.embeddedWebview?.remove();
		this.embeddedWebview = null;
	}

	private clearError(): void {
		this.contentEl.empty();
	}

	private embedWebview(url: string): void {
		this.clearWebview();
		this.clearError();
		this.embeddedWebview = mountGdocsWebview(this.contentEl, url);
	}

	private showError(
		message: string,
		url: string | null,
		detail?: string,
		help?: string,
	): void {
		this.clearWebview();
		this.clearError();
		showGdocsError(this.contentEl, message, url, detail, help);
		this.contentEl.createEl("p", {
			text: "You can open the shortcut file as plain text from the file menu to inspect its contents.",
		});
	}

	private showMobileFallback(url: string): void {
		this.clearWebview();
		this.clearError();
		showGdocsMobileFallback(this.contentEl, url);
	}
}
