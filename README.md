# GDocs

Open and embed Google Drive shortcut files in Obsidian. Particularly suited for those who store and sync their vault in Google Drive.

When Google Drive for Desktop (or similar sync) stores Docs, Sheets, and other Workspace files in your vault, they appear as small JSON files (`.gdoc`, `.gsheet`, etc.). GDocs registers those extensions, shows them in the file explorer with their extension, and displays the linked Google document when you:

- **Click a shortcut** in the file explorer (embedded browser in the editor tab).
- **Embed a shortcut in a note** with `![[My Sheet.gsheet]]` (inline in reading mode and Live Preview).

## Say Hi!
- If you are using it and are happy about it or find issues, please write to me. I would love to hear from you. o.rouiller@gmail.com

## Requirements

- **Obsidian 1.8+** (desktop for embedded browser)
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

## Usage

Click any `.gdoc`, `.gsheet`, or other supported shortcut in the file explorer. The plugin reads `doc_id`, `url`, or `resource_id` from the JSON shortcut and shows the document in the **current tab**.

- **Normal click** — opens in the active tab (like switching between notes).
- **Cmd/Ctrl+click or middle-click** — opens in a new tab (standard Obsidian behavior).

The document is rendered in an embedded browser inside the file tab. This is separate from the core Web Viewer plugin (no shared toolbar or login session).

### Embeds in notes

Embed a shortcut in any markdown note with a wikilink:

```markdown
![[My Sheet.gsheet]]
![[Projects/Report.gdoc]]
```

The embedded document appears inline in reading mode and Live Preview (desktop). Use the same `![[]]` syntax as images or PDFs.

### Mobile

Embedded browser is not available on mobile. GDocs shows the URL with **Copy link** and **Open in browser** buttons.

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

- **Warning about moving shortcut files**  
  Do not move `.gdoc` / `.gsheet` files out of a syncing Google Drive folder; Google may delete the online document.

- **“Could not read shortcut file from disk”**  
  Google Drive shortcut files (`.gdoc`, `.gsheet`, etc.) are tiny JSON pointers, not the document itself. When your vault lives in Google Drive, the OS may block reading them if they are cloud-only or not fully synced.

  Try:
  1. In Finder (macOS) or File Explorer (Windows), right-click the shortcut → **Available offline** / download it, then reload Obsidian.
  2. Open the `.gdoc` in a text editor (Notepad, TextEdit). If you see JSON with `doc_id` or `url`, the file is readable and GDocs should work after a reload.
  3. On Windows, Google Drive sometimes exposes `.gdoc` files as placeholders that standard file reads cannot open; keeping the vault in **Mirror files** mode and ensuring shortcuts are offline usually helps.
  4. Confirm the shortcut was not moved outside its original Google Drive folder.

## License

MIT
