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
		let raw: string;
		try {
			raw = await this.app.vault.read(file);
		} catch {
			this.showError("Could not read file.", null);
			return;
		}

		const parsed = parseGdriveShortcut(raw, file.extension);
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

	private showError(message: string, url: string | null): void {
		this.clearWebview();
		this.clearError();
		showGdocsError(this.contentEl, message, url);
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
