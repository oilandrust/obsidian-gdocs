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
