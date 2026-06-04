import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Inline parser checks (mirrors src/parse-gdrive-shortcut.ts logic for CI-less smoke test)
function parse(raw) {
	const trimmed = raw.replace(/^\uFEFF/, "").trim();
	const data = JSON.parse(trimmed);
	if (typeof data.url === "string" && /^https?:\/\//.test(data.url.trim())) {
		return { ok: true, url: data.url.trim() };
	}
	return { ok: false };
}

const dir = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(dir, "fixtures", "sample.gsheet"), "utf8");
const r = parse(fixture);
if (!r.ok) {
	console.error("parse failed");
	process.exit(1);
}
console.log("parse-gdrive-shortcut smoke test passed");
