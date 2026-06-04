# GDocs

Obsidian plugin that opens Google Drive shortcut files in Obsidian's **Web Viewer**.

Repository: https://github.com/oilandrust/obsidian-gdocs

When Google Drive for Desktop (or similar sync) stores Docs, Sheets, and other Workspace files in your vault, they appear as small JSON files (`.gdoc`, `.gsheet`, etc.). GDocs registers those extensions, shows them in the file explorer with their extension, and opens the linked Google URL in a tab when you click them.

## Requirements

- **Obsidian 1.8+** (desktop for Web Viewer)
- **Web Viewer** core plugin enabled: Settings → Core plugins → **Web viewer**
- Google Drive shortcut files in your vault (from Drive for Desktop, rclone, Synology Drive, etc.)

## Supported extensions

| Extension | Google app |
|-----------|------------|
| `.gdoc` | Docs |
| `.gsheet` | Sheets |
| `.gslides` | Slides |
| `.gdraw` | Drawings |
| `.gform` | Forms |
| `.gtable` | Tables |
| `.gscript` | Apps Script |
| `.gjam` | Jamboard |

## Installation

### From Obsidian (Community plugins)

After the plugin is approved in the directory:

1. Open **Settings → Community plugins**.
2. Turn off **Restricted mode** if needed, then **Browse**.
3. Search for **GDocs** and install.
4. Enable **GDocs** and the **Web viewer** core plugin, then reload Obsidian.

### Manual / development

1. Clone this repo into your vault's `.obsidian/plugins/gdocs` folder, or symlink it there.
2. Install dependencies and build:

```bash
npm install
npm run build
```

3. Enable **GDocs** under Settings → Community plugins.
4. Reload Obsidian.

For development, run `npm run dev` to watch and rebuild.

## Usage

Click any `.gdoc`, `.gsheet`, or other supported shortcut in the file explorer. The plugin reads `doc_id`, `url`, or `resource_id` from the JSON shortcut and opens the document in Web Viewer.

If Web Viewer is disabled, GDocs can open the link in your system browser instead (see plugin settings).

### Mobile

Web Viewer is not available on mobile. GDocs shows the URL with **Copy link** and **Open in browser** buttons.

## Shortcut file format

Shortcut files are JSON. Google Drive for Desktop typically uses:

```json
{
  "doc_id": "1VxFROKm0zoJV2iH678wO94hZ0PY9fN_gAGOxhZacc8w",
  "email": "you@example.com"
}
```

GDocs builds the Docs/Sheets URL from `doc_id` and the file extension (`.gdoc`, `.gsheet`, etc.).

Older or third-party sync tools may use:

```json
{
  "url": "https://docs.google.com/spreadsheets/d/…/edit",
  "resource_id": "spreadsheet:…"
}
```

## Troubleshooting

- **Files not visible in the explorer**  
  Check Settings → Files & links → **Detect all file extensions**, and ensure `.gdoc` / `.gsheet` are not listed under **Excluded files**.

- **Opens in browser instead of Obsidian**  
  Enable the Web Viewer core plugin, or turn on “Open in system browser when Web Viewer is off” in GDocs settings.

- **Warning about moving shortcut files**  
  Do not move `.gdoc` / `.gsheet` files out of a syncing Google Drive folder; Google may delete the online document.

## License

MIT
