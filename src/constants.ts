export const VIEW_TYPE_GDOCS = "gdocs-view";

export const DEFAULT_GDRIVE_EXTENSIONS = [
	"gdoc",
	"gsheet",
	"gslides",
	"gdraw",
	"gform",
	"gtable",
	"gscript",
	"gjam",
] as const;

export type GdriveExtension = (typeof DEFAULT_GDRIVE_EXTENSIONS)[number];

export function getGoogleAppName(extension?: string): string {
	switch (extension?.toLowerCase()) {
		case "gdoc":
			return "Google Docs";
		case "gsheet":
			return "Google Sheets";
		case "gslides":
			return "Google Slides";
		case "gdraw":
			return "Google Drawings";
		case "gform":
			return "Google Forms";
		case "gtable":
			return "Google Tables";
		case "gscript":
			return "Google Apps Script";
		case "gjam":
			return "Google Jamboard";
		default:
			return "Google Drive";
	}
}

