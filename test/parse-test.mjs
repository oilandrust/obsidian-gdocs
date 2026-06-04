import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Minimal inline test (parser is bundled for Obsidian; duplicate logic check via build + manual fixtures)
const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const sample = readFileSync(join(fixturesDir, "sample.gsheet"), "utf8");
const data = JSON.parse(sample);
if (!data.url?.startsWith("https://")) {
	console.error("Fixture invalid");
	process.exit(1);
}
console.log("Fixture OK:", data.url);
