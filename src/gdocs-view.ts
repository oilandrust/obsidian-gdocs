import {
	FileView,
	Notice,
	Platform,
	WorkspaceLeaf,
	type TFile,
} from "obsidian";
import type GDocsPlugin from "./main";
import { VIEW_TYPE_GDOCS } from "./constants";
import { parseGdriveShortcut } from "./parse-gdrive-shortcut";

export class GDocsView extends FileView {
	plugin: GDocsPlugin;

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

	async onLoadFile(file: TFile): Promise<void> {
		this.clearError();
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

		await this.openUrl(parsed.url);
		return;
	}

	async onUnloadFile(_file: TFile): Promise<void> {
		this.clearError();
	}

	private clearError(): void {
		this.contentEl.empty();
	}

	private showError(message: string, url: string | null): void {
		this.clearError();
		const wrap = this.contentEl.createDiv({ cls: "gdocs-error" });
		wrap.createDiv({ cls: "gdocs-error-title", text: "Could not open Google shortcut" });
		wrap.createDiv({ cls: "gdocs-error-detail", text: message });
		if (url) {
			wrap.createDiv({ cls: "gdocs-error-url", text: url });
		}
		wrap.createEl("p", {
			text: "You can open the shortcut file as plain text from the file menu to inspect its contents.",
		});
	}

	private async openUrl(url: string): Promise<void> {
		if (Platform.isMobile) {
			this.showMobileFallback(url);
			return;
		}

		if (!this.isWebViewerEnabled()) {
			if (this.plugin.settings.openInBrowserIfNoWebViewer) {
				window.open(url, "_blank");
				return;
			}
			this.showError(
				"Web Viewer is disabled. Enable it under Settings → Core plugins → Web viewer, or turn on “Open in system browser when Web Viewer is off” in GDocs settings.",
				url,
			);
			return;
		}

		try {
			await this.leaf.setViewState({
				type: "webviewer",
				state: { url, navigate: true },
				active: true,
			});
		} catch {
			if (this.plugin.settings.openInBrowserIfNoWebViewer) {
				window.open(url, "_blank");
			} else {
				this.showError("Failed to open Web Viewer.", url);
			}
		}
	}

	private showMobileFallback(url: string): void {
		this.clearError();
		const wrap = this.contentEl.createDiv({ cls: "gdocs-error" });
		wrap.createDiv({
			cls: "gdocs-error-title",
			text: "Web Viewer is not available on mobile",
		});
		wrap.createDiv({
			cls: "gdocs-error-detail",
			text: "Copy the link below and open it in your browser.",
		});
		wrap.createDiv({ cls: "gdocs-error-url", text: url });

		const actions = wrap.createDiv({ cls: "gdocs-mobile-actions" });
		actions.createEl("button", { text: "Copy link" }).addEventListener("click", () => {
			void navigator.clipboard.writeText(url);
			new Notice("Link copied to clipboard");
		});
		actions.createEl("button", { text: "Open in browser" }).addEventListener("click", () => {
			window.open(url, "_blank");
		});
	}

	private isWebViewerEnabled(): boolean {
		const internal = (
			this.app as AppWithInternalPlugins
		).internalPlugins?.getPluginById("web-viewer");
		return internal?.enabled === true;
	}
}

interface AppWithInternalPlugins {
	internalPlugins?: {
		getPluginById(id: string): { enabled: boolean } | undefined;
	};
}
