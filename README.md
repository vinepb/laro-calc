# Latin America Ragnarok Online Calculator

GitHub Pages deployment target: `https://vinepb.github.io/laro-calc/#/`

## Requirements

- Node.js 18 LTS

## Run On Host

```bash
npm install
npm start
```

The Angular dev server runs on `http://localhost:4200/`.

## Build For GitHub Pages

This repo deploys from the same repository with GitHub Actions.

```bash
npm install
npm run build:pages
```

The production output is written to `dist/pages` with base href `/laro-calc/`.

## Deploy To GitHub Pages

1. Push `main` to the `vinepb/laro-calc` GitHub repository.
2. In GitHub, open `Settings > Pages`.
3. Set `Build and deployment > Source` to `GitHub Actions`.
4. The workflow in `.github/workflows/deploy-pages.yml` will deploy the site automatically on pushes to `main`.
5. You can also trigger the workflow manually from the `Actions` tab.

## Add Items With Divine Pride

The calculator has a local draft-first item import workflow for new equipment and cards.

1. Copy `.divine-pride.local.example.json` to `.divine-pride.local.json`.
2. Fill in your Divine Pride API key and keep `defaultServer` set to `latam` and `defaultLanguage` set to English unless you want different local defaults.
3. Prepare a draft:

```bash
npm run item:prepare -- --item 450407
npm run item:prepare -- --item "Convertible Critical Armor [1]"
npm run item:prepare -- --item 450407 --server LATAM --language en-US
```

4. Review the generated draft in `.codex/item-import/<item-id>/`.
5. Add or fix the calculator `script` in `candidate.item.json`.
6. In `review.md`, update the metadata block so:
   - `scriptStatus` is `reviewed` when the script is ready, or `scriptless-approved` if the item intentionally has no script
   - `applyBlocked` is `false`
   - resolved blocking warnings are removed
7. Apply the reviewed draft:

```bash
npm run item:apply -- --draft .codex/item-import/450407
```

8. Validate the result:

```bash
npm run item:validate -- --draft .codex/item-import/450407
```

The workflow uses the Divine Pride API as the authoritative item source, setting both `server` and `Accept-Language` on API requests. The Divine Pride website search page is only used to resolve an item ID when you pass a name instead of a numeric ID.

The workflow downloads the local item icon automatically and only writes into `src/assets/demo/data/item.json` after the draft has been reviewed.
