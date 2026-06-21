import { App, Component, Platform, type TFile } from "obsidian";
import type GDocsPlugin from "./main";
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

interface EmbedInfo {
	containerEl: HTMLElement;
}

type GDocsEmbedCreator = (info: EmbedInfo, file: TFile, subpath: string) => Component;

interface EmbedRegistry {
	registerExtension?: (extension: string, creator: GDocsEmbedCreator) => void;
	registerExtensions?: (extensions: string[], creator: GDocsEmbedCreator) => void;
	unregisterExtension?: (extension: string) => void;
	unregisterExtensions?: (extensions: string[]) => void;
}

function getEmbedRegistry(app: App): EmbedRegistry | undefined {
	return (app as App & { embedRegistry?: EmbedRegistry }).embedRegistry;
}

export class GDocsEmbed extends Component {
	private webview: HTMLElement | null = null;

	constructor(
		private info: EmbedInfo,
		private app: App,
		private file: TFile,
	) {
		super();
		this.info.containerEl.addClass("gdocs-embed");
		this.registerDomEvent(this.info.containerEl, "click", (evt) => {
			evt.stopImmediatePropagation();
		});
	}

	onload(): void {
		super.onload();
		void this.loadFile();
	}

	async loadFile(): Promise<void> {
		const { containerEl } = this.info;
		containerEl.empty();
		containerEl.createDiv({
			cls: "gdocs-embed-loading",
			text: `Loading ${this.file.name}…`,
		});

		const readResult = await readGdriveShortcutFile(this.app, this.file);
		containerEl.empty();

		if (!readResult.ok) {
			showGdocsError(
				containerEl,
				readResult.error,
				null,
				readResult.detail,
				GDRIVE_READ_HELP,
			);
			return;
		}

		const parsed = parseGdriveShortcut(readResult.raw, this.file.extension);
		containerEl.empty();

		if (!parsed.ok) {
			showGdocsError(containerEl, parsed.error, null);
			return;
		}

		if (Platform.isMobile) {
			showGdocsMobileFallback(containerEl, parsed.url);
			return;
		}

		this.webview = mountGdocsWebview(containerEl, parsed.url);
	}

	onunload(): void {
		this.webview?.remove();
		this.webview = null;
		super.onunload();
	}
}

export function registerGdocsEmbeds(plugin: GDocsPlugin): void {
	const registry = getEmbedRegistry(plugin.app);
	if (!registry) {
		return;
	}

	const extensions = plugin.getActiveExtensions();
	if (extensions.length === 0) {
		return;
	}

	const createEmbed: GDocsEmbedCreator = (info, file) =>
		new GDocsEmbed(info, plugin.app, file);

	if (typeof registry.registerExtensions === "function") {
		registry.registerExtensions(extensions, createEmbed);
		plugin.register(() => registry.unregisterExtensions?.(extensions));
		return;
	}

	if (typeof registry.registerExtension === "function") {
		for (const ext of extensions) {
			registry.registerExtension(ext, createEmbed);
			plugin.register(() => registry.unregisterExtension?.(ext));
		}
	}
}
