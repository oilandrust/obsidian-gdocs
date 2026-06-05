
## Installation

### From Obsidian (Community plugins)

After the plugin is approved in the directory:

1. Open **Settings → Community plugins**.
2. Turn off **Restricted mode** if needed, then **Browse**.
3. Search for **GDocs** and install.
4. Enable **GDocs**, then reload Obsidian.

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
