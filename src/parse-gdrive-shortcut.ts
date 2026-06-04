export type ParseResult =
	| { ok: true; url: string }
	| { ok: false; error: string };

interface GdriveShortcutJson {
	url?: string;
	resource_id?: string;
	doc_id?: string;
}

/** Google Drive for Desktop format (doc_id + file extension). */
const EXTENSION_URL_TEMPLATES: Record<string, string> = {
	gdoc: "https://docs.google.com/document/d/{id}/edit",
	gsheet: "https://docs.google.com/spreadsheets/d/{id}/edit",
	gslides: "https://docs.google.com/presentation/d/{id}/edit",
	gdraw: "https://docs.google.com/drawings/d/{id}/edit",
	gform: "https://docs.google.com/forms/d/{id}/viewform",
	gtable: "https://docs.google.com/spreadsheets/d/{id}/edit",
	gscript: "https://script.google.com/home/projects/{id}/edit",
	gjam: "https://jamboard.google.com/d/{id}",
};

const RESOURCE_URL_TEMPLATES: Record<string, string> = {
	document: "https://docs.google.com/document/d/{id}/edit",
	spreadsheet: "https://docs.google.com/spreadsheets/d/{id}/edit",
	presentation: "https://docs.google.com/presentation/d/{id}/edit",
	drawing: "https://docs.google.com/drawings/d/{id}/edit",
	form: "https://docs.google.com/forms/d/{id}/viewform",
	freebird: "https://jamboard.google.com/d/{id}",
	jam: "https://jamboard.google.com/d/{id}",
	script: "https://script.google.com/d/{id}/edit",
	table: "https://docs.google.com/spreadsheets/d/{id}/edit",
};

function normalizeUrl(url: string): string | null {
	const trimmed = url.trim();
	if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
		return trimmed;
	}
	return null;
}

function urlFromResourceId(resourceId: string): string | null {
	const colon = resourceId.indexOf(":");
	if (colon <= 0) {
		return null;
	}
	const kind = resourceId.slice(0, colon).toLowerCase();
	const id = resourceId.slice(colon + 1).trim();
	if (!id) {
		return null;
	}
	const template = RESOURCE_URL_TEMPLATES[kind];
	if (template) {
		return template.replace("{id}", id);
	}
	return `https://drive.google.com/open?id=${encodeURIComponent(id)}`;
}

function urlFromDocId(docId: string, extension?: string): string | null {
	const id = docId.trim();
	if (!id) {
		return null;
	}
	if (extension) {
		const template = EXTENSION_URL_TEMPLATES[extension.toLowerCase()];
		if (template) {
			return template.replace("{id}", id);
		}
	}
	return `https://drive.google.com/open?id=${encodeURIComponent(id)}`;
}

export function parseGdriveShortcut(raw: string, extension?: string): ParseResult {
	const trimmed = raw.replace(/^\uFEFF/, "").trim();
	if (!trimmed) {
		return { ok: false, error: "File is empty." };
	}

	let data: GdriveShortcutJson;
	try {
		data = JSON.parse(trimmed) as GdriveShortcutJson;
	} catch {
		return { ok: false, error: "Invalid JSON. Expected a Google Drive shortcut file." };
	}

	if (typeof data.url === "string") {
		const url = normalizeUrl(data.url);
		if (url) {
			return { ok: true, url };
		}
	}

	if (typeof data.resource_id === "string") {
		const url = urlFromResourceId(data.resource_id);
		if (url) {
			return { ok: true, url };
		}
	}

	if (typeof data.doc_id === "string") {
		const url = urlFromDocId(data.doc_id, extension);
		if (url) {
			return { ok: true, url };
		}
	}

	return {
		ok: false,
		error: "No valid url, doc_id, or resource_id found in shortcut file.",
	};
}
