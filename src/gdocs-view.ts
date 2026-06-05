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

		const container = this.contentEl.createDiv({ cls: "gdocs-webview-container" });
		const webview = activeDocument.createElement("webview");
		webview.setAttribute("src", url);
		webview.setAttribute("webpreferences", "nativeWindowOpen=no");
		webview.className = "gdocs-webview";
		webview.addEventListener("new-window", (event: WebviewNewWindowEvent) => {
			event.preventDefault();
			const targetUrl = (event as WebviewNewWindowEvent).url;
			if (targetUrl) {
				webview.setAttribute("src", targetUrl);
			}
		});
		container.appendChild(webview);
		this.embeddedWebview = webview;
	}

	private showError(message: string, url: string | null): void {
		this.clearWebview();
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

	private showMobileFallback(url: string): void {
		this.clearWebview();
		this.clearError();
		const wrap = this.contentEl.createDiv({ cls: "gdocs-error" });
		wrap.createDiv({
			cls: "gdocs-error-title",
			text: "Embedded browser is not available on mobile",
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
}

interface WebviewNewWindowEvent extends Event {
	url?: string;
	preventDefault(): void;
}
