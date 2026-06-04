# Submit GDocs to Obsidian Community

Repo: https://github.com/oilandrust/obsidian-gdocs

## Prerequisites (done in this repo)

- [x] `LICENSE`, `README.md`, `manifest.json`, `versions.json` on `main`
- [x] GitHub release `1.0.0` with `main.js`, `manifest.json`, `styles.css`

## Your steps (browser)

1. Sign in at https://community.obsidian.md with your Obsidian account.
2. Profile → link your GitHub account (`oilandrust`).
3. Sidebar → **Plugins** → **New plugin**.
4. Repository URL: `https://github.com/oilandrust/obsidian-gdocs`
5. Accept the developer policies and confirm ongoing support.
6. Click **Submit**.

## After submission

- Address any automated review feedback in the portal.
- Wait for manual review (may take several days).
- Once approved, install via **Settings → Community plugins → Browse** → **GDocs**.

## Future releases

1. Bump `version` in `manifest.json` and add entry to `versions.json`.
2. Commit and push to `main`.
3. Create and push a matching tag (workflow uploads assets):

```bash
git tag 1.0.1
git push origin 1.0.1
```

Or manually: `npm run build` then `gh release create 1.0.1 main.js manifest.json styles.css`.
