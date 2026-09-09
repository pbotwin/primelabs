# PrimeLabs storefront

A responsive React + TypeScript storefront for PrimeLabs. It supports Georgian and English, category and brand filters, language-independent search, price filtering and sorting, saved products, in-app product details, a persistent cart, and WhatsApp checkout.

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
- `npm run format` — format source and configuration files
- `npm run check` — formatting, lint, TypeScript, and production build
- `npm run preview` — preview the production build

## Structure

```text
src/
├── components/       UI components and dialogs
├── config/           Store-wide operational constants
├── data/             Product catalog and translations
├── hooks/            Shared persistence and dialog hooks
├── utils/            Typed catalog filtering logic
├── App.tsx           Page composition and storefront state
├── styles/           Ordered SCSS with BEM component selectors
└── types.ts          Shared domain types
```

Products open inside the application. Cart checkout prepares an order in WhatsApp, contact prepares a WhatsApp message, and newsletter signup prepares an email request because the static GitHub Pages deployment has no backend.

## Verification

`npm run check` is required before deployment. Manual release checks should cover 360, 390, 768, and 1440-pixel viewports, catalog filtering, search, pagination, product variants, saved products, all dialogs, and cart checkout.

The engineering audit and prioritized technical debt are documented in [`docs/CODEBASE_AUDIT.md`](docs/CODEBASE_AUDIT.md).

## Deploy to GitHub Pages

The repository includes `.github/workflows/deploy.yml` and is configured for repository-subpath assets.

1. Open **Settings → Pages** in the GitHub repository.
2. Select **GitHub Actions** under **Build and deployment**.
3. Push to `main`.
4. Wait for the **Deploy to GitHub Pages** workflow to finish.

The site is published at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
