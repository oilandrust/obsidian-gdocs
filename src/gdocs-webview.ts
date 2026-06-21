import { Notice } from "obsidian";

interface WebviewNewWindowEvent extends Event {
	url?: string;
	preventDefault(): void;
}

export function mountGdocsWebview(parent: HTMLElement, url: string): HTMLElement {
	const container = parent.createDiv({ cls: "gdocs-webview-container" });
	const webview = activeDocument.createElement("webview");
	webview.setAttribute("src", url);
	webview.setAttribute("webpreferences", "nativeWindowOpen=no");
	webview.className = "gdocs-webview";
	webview.addEventListener("new-window", (event: WebviewNewWindowEvent) => {
		event.preventDefault();
		const targetUrl = event.url;
		if (targetUrl) {
			webview.setAttribute("src", targetUrl);
		}
	});
	container.appendChild(webview);
	return webview;
}

export function showGdocsError(
	parent: HTMLElement,
	message: string,
	url: string | null,
	detail?: string,
	help?: string,
): void {
	const wrap = parent.createDiv({ cls: "gdocs-error" });
	wrap.createDiv({ cls: "gdocs-error-title", text: "Could not open Google shortcut" });
	wrap.createDiv({ cls: "gdocs-error-detail", text: message });
	if (detail) {
		wrap.createDiv({ cls: "gdocs-error-system", text: detail });
	}
	if (url) {
		wrap.createDiv({ cls: "gdocs-error-url", text: url });
	}
	if (help) {
		wrap.createEl("p", { cls: "gdocs-error-help", text: help });
	}
}

export function showGdocsMobileFallback(parent: HTMLElement, url: string): void {
	const wrap = parent.createDiv({ cls: "gdocs-error" });
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
