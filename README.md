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
