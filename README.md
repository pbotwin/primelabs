# PrimeLabs storefront

A responsive React + TypeScript storefront for PrimeLabs. The UI supports Georgian and English, category filters, search, price sorting, saved products, external product/cart links, and responsive layouts from small phones through large desktops.

## Development

```bash
npm install
npm run dev
```

Vite serves the app at `http://localhost:4187` when that port is available.

## Commands

- `npm run dev` — local development server with hot reload
- `npm run build` — TypeScript validation and production build
- `npm run lint` — ESLint validation
- `npm run check` — lint and build together
- `npm run preview` — preview the production build
- `node reference/react-verify.mjs` — browser checks while the development server is running on port 4188

## Structure

```text
src/
├── components/       Reusable UI components
├── data/             Product catalog and translations
├── hooks/            Shared React hooks
├── App.tsx           Page composition and catalog state
├── styles.css        Design tokens and responsive styles
└── types.ts          Shared domain types
```

Product links lead to the live PrimeLabs store. Several product images also load from the live store because local copies were not included in the source assets. Update `src/data/products.ts` to connect a different catalog source or local image set.

The active application entry point is `src/main.tsx`. Legacy static HTML, JavaScript, CSS, server, catalog, and verification sources have been removed.

## Verification

The browser script checks rendering and horizontal overflow at 390, 768, and 1440 pixels, plus category filtering, search, reset, and saved products. Screenshots from the most recent run are stored in `reference/react-390.png`, `reference/react-768.png`, and `reference/react-1440.png`.

## Deploy to GitHub Pages

The project is already configured for GitHub Pages, including repository subpath asset URLs and the workflow in `.github/workflows/deploy.yml`.

1. Create an empty GitHub repository.
2. Push this project to its `main` branch.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, select **GitHub Actions** as the source.
5. Open the repository's **Actions** tab and wait for “Deploy to GitHub Pages” to finish.

The site will be available at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. Every push to `main` automatically rebuilds and deploys it.

You can inspect the production output locally with:

```bash
npm run build
npm run preview
```
