import type { App, TFile } from "obsidian";

export type ReadShortcutResult =
	| { ok: true; raw: string }
	| { ok: false; error: string; detail?: string };

function decodeBinary(data: ArrayBuffer): string {
	return new TextDecoder("utf-8").decode(data);
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function tryRead(label: string, read: () => Promise<string>): Promise<string> {
	const maxAttempts = 3;
	let lastError: unknown;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			const raw = await read();
			if (raw.length > 0) {
				return raw;
			}
			lastError = new Error(`${label} returned empty content`);
		} catch (error) {
			lastError = error;
		}

		if (attempt < maxAttempts - 1) {
			await sleep(300);
		}
	}

	throw lastError;
}

async function readViaAdapter(app: App, file: TFile): Promise<string> {
	const { adapter } = app.vault;

	if (typeof adapter.readBinary === "function") {
		const binary = await adapter.readBinary(file.path);
		return decodeBinary(binary);
	}

	return adapter.read(file.path);
}

/**
 * Read a Google Drive shortcut file from disk. Google Drive vault paths
 * (File Provider on macOS, virtual drive on Windows) can fail a plain
 * vault.read(); try adapter reads before giving up.
 */
export async function readGdriveShortcutFile(
	app: App,
	file: TFile,
): Promise<ReadShortcutResult> {
	const attempts: Array<{ label: string; read: () => Promise<string> }> = [
		{ label: "vault.read", read: () => app.vault.read(file) },
		{ label: "adapter.read", read: () => readViaAdapter(app, file) },
	];

	let lastError: unknown;
	for (const attempt of attempts) {
		try {
			const raw = await tryRead(attempt.label, attempt.read);
			return { ok: true, raw };
		} catch (error) {
			lastError = error;
		}
	}

	const detail = formatReadError(lastError);
	return {
		ok: false,
		error: "Could not read shortcut file from disk.",
		detail,
	};
}

function formatReadError(error: unknown): string {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return String(error);
}

export const GDRIVE_READ_HELP = [
	"Google Drive shortcut files are small JSON pointers. If the file is cloud-only or not fully synced, the OS may block reading it.",
	"Try: right-click the .gdoc in Finder/Explorer → make it Available offline (or download it), then reload Obsidian.",
	"On Windows, Google Drive may expose .gdoc files as placeholders that some apps cannot read; opening the file in Notepad confirms whether the JSON is accessible.",
	"If the shortcut was moved outside its original Google Drive folder, the pointer may be broken.",
].join(" ");
