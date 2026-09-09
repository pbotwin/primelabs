# PrimeLabs React codebase audit

Audit date: 2026-09-09

## Executive assessment

The project is a compact, strictly typed React storefront with a small dependency surface and a working static deployment pipeline. It has no critical security findings. The audit reduced root-component responsibilities, split the global stylesheet without changing cascade order, hardened persisted state and dialogs, and made form handoffs honest and functional. The main remaining limits are the static catalog, fragmented translation sources, and missing automated browser tests.

This audit included the application source, product data, configuration, deployment workflow, TypeScript settings, lint rules, local persistence, responsive styling, and interaction state.

## Critical problems

No critical problems were found. The project does not render user-controlled HTML, expose frontend secrets, store authentication data, or use unsafe dynamic code execution.

## Architecture problems

### Medium — `App.tsx` has too many responsibilities

Affected file: `src/App.tsx`

The root component owns catalog queries, filters, pagination, featured-slider state, cart normalization, recent products, saved products, modal state, and several large sections of markup. This makes unrelated features easy to break during UI work.

Refactor completed:

- Catalog matching and sorting moved to `src/utils/catalog.ts`.
- Featured, recently viewed, benefits, and saved-products presentation moved to focused components.
- Store-wide constants moved to `src/config/store.ts`.

`App.tsx` is now 623 lines rather than 871. Recommended next step: extract catalog controls after their filter API is stable. Keep their state in `App` until prop volume becomes a real problem; a global state library is not justified yet.

### Medium — styling is centralized in one oversized cascade

Affected directory: `src/styles/`

The stylesheet contains repeated definitions for `.hero`, `.shop`, `.product-grid`, `.product-card`, `.category`, dialogs, and multiple overlapping media queries. Late overrides have caused real responsive regressions. The issue is organization and selector ownership rather than CSS performance.

Refactor completed: Sass is now part of the build and styling was split into seven ordered SCSS files under `src/styles/`, separating base, storefront components, dialogs, header/search, catalog responsiveness, product-dialog layout, and motion. Import order in `main.tsx` preserves the prior cascade. Header, product-card, and featured-slider selectors now use BEM. Further selector cleanup should happen component by component with screenshot comparison.

### Low — translation ownership is fragmented

Affected files: `src/data/translations.ts`, `src/data/uiCopy.ts`, `src/components/NewsletterDialog.tsx`, `src/App.tsx`, `src/components/ProductDialog.tsx`, `src/components/CartDrawer.tsx`

Copy lives in two dictionaries plus component-local objects and inline language ternaries. Missing translations cannot be checked centrally.

Recommended fix: migrate inline and component-local copy into one typed dictionary by feature. Preserve `CopyKey` checking and avoid adding an i18n dependency until routing, pluralization, or more languages require it.

## React problems

### High — dialogs did not manage focus consistently

Affected files: `src/components/ProductDialog.tsx`, `src/components/CartDrawer.tsx`, `src/components/ContactDialog.tsx`, `src/components/NewsletterDialog.tsx`, formerly the saved-products markup in `src/App.tsx`

Only two dialogs handled Escape, none trapped focus, none restored focus, and multiple dialogs could independently remove the shared body scroll-lock class.

Refactor completed: `src/hooks/useModalDialog.ts` now owns Escape handling, initial focus, focus trapping, focus restoration, and reference-counted scroll locking. Every modal surface uses it.

### Medium — product variant selection could leak across products

Affected file: `src/components/ProductDialog.tsx`

The selected variant ID remained in state when a related product replaced the open product. Reused variant IDs could select an unintended variant.

Refactor completed: selection now stores both product ID and variant ID, so it is valid only for the product that created it. This avoids a state-reset effect and its extra render.

### Low — delayed state resets were not cleaned up

Affected files: `src/components/CartDrawer.tsx`, `src/components/ContactDialog.tsx`, `src/components/NewsletterDialog.tsx`

Close handlers scheduled untracked timers solely to reset local view state. Reopening quickly could briefly show stale state.

Refactor completed: close handlers reset synchronously after requesting closure.

### Low — modal state can represent multiple open overlays

Affected file: `src/App.tsx`

Each overlay uses a separate boolean or nullable value. The UI normally opens one at a time, but the state model permits overlap.

Recommended fix: replace the booleans with a small discriminated `activeOverlay` union when the next modal feature is added. Doing so now would touch many stable handlers for limited benefit.

## Styling and BEM problems

### Medium — naming follows a flat global convention rather than consistent BEM

Affected file: `src/styles.css`

Names such as `.dialog-copy`, `.product-bottom`, `.save-detail`, `.featured-main-current`, and generic `.active` modifiers do not communicate ownership consistently. Highly reusable names such as `.active`, `.primary`, and `.previous` depend on selector context.

Refactor completed for the primary interactive blocks: `site-header`, `product-card`, and `featured` now use block, element, and modifier selectors such as `product-card__media`, `product-card__save--active`, and `featured__slide--active`. Remaining legacy selectors should migrate only when their owning component is changed.

### Low — repeated media-query blocks obscure effective values

Affected file: `src/styles.css`

The same breakpoint appears throughout the file and later blocks override earlier component values.

Recommended fix: within each extracted component stylesheet, keep base rules followed by that component's breakpoint overrides.

## TypeScript problems

### Low — sort state previously accepted any string

Affected files: `src/App.tsx`, `src/utils/catalog.ts`

The sort state was inferred as `string`, although only three values are valid.

Refactor completed: `CatalogSort` is a readable union and the filtering utility accepts it explicitly.

### Low — persisted JSON was trusted as `T`

Affected file: `src/hooks/useLocalStorage.ts`

`JSON.parse` was asserted to the requested generic type. Old or manually edited browser data could violate the type at runtime.

Refactor completed: `useLocalStorage` accepts a validator, invalid data falls back safely, and language, cart, saved, and recent values use focused validators in `src/utils/storageValidators.ts`. Valid storage events also synchronize state across tabs.

No unsafe `any` usage was found. Strict TypeScript is enabled and shared product types are centralized.

## API and data-layer problems

### High — forms previously claimed success without a delivery mechanism

Affected files: `src/components/ContactDialog.tsx`, `src/components/NewsletterDialog.tsx`

Both forms previously changed to a success screen without submitting data anywhere.

Refactor completed: contact now prepares a real WhatsApp message, while newsletter prepares an email request and accurately tells the user to send it. A future backend should replace these handoffs with a typed service that exposes pending, success, and failure states.

### Low — static catalog data is a large source module

Affected file: `src/data/products.ts`

The 1,900+ line catalog increases the JavaScript bundle and requires a deployment for inventory updates. It is acceptable for the current static GitHub Pages architecture.

Recommended later fix: move catalog data to JSON or a read-only commerce API when inventory becomes dynamic. Transform and validate responses outside components.

## State-management problems

### Low — cart derivation scans products and cart entries

Affected file: `src/App.tsx`

`cartItems` is derived during each root render. With 67 products this is inexpensive and does not justify a state library or memoization-heavy rewrite.

Recommendation: keep local state. Extract cart operations into a hook only when checkout logic or persistence grows.

### Cleanup — saved IDs can contain obsolete product IDs

Affected file: `src/App.tsx`

The UI derives `validSaved`, so stale IDs are safely hidden but remain in storage.

Recommended later fix: prune saved IDs during an explicit catalog migration rather than writing from an effect on every load.

## Performance problems

### Low — search text is rebuilt for each product on each query change

Affected files: `src/utils/catalog.ts`, `src/data/products.ts`

This is measurable only as the catalog grows; 67 products is not currently a performance problem. `content-visibility` already limits off-screen card work.

Recommended later fix: precompute a normalized search index when catalog size reaches hundreds of items or profiling shows input latency.

### Cleanup — large local font payload

Affected directory: `assets/`

The Inter variable font is roughly 877 KB before transfer compression. Font subsetting could improve first load, especially on mobile.

Recommended later fix: subset Latin and Georgian glyphs and keep WOFF2 outputs only.

## Accessibility and semantics

### High — modal keyboard behavior was incomplete

Resolved by `src/hooks/useModalDialog.ts`, as described above.

### Medium — carousel status was not announced

Affected file: `src/components/FeaturedProducts.tsx`

The carousel exposed its role description and labeled controls, but it had no concise translated name or live status for slide changes.

Refactor completed: the extracted component uses translated labels and a visually hidden polite slide status.

### Low — several labels remain English-only

Affected files: `src/App.tsx`, `src/components/SavedProductsDialog.tsx`

Examples include “Skip to products,” “Product pages,” slide control labels, and the saved-dialog close label.

Recommended fix: add these labels to the central copy dictionary during translation consolidation.

## Error handling and security

### Medium — root rendering had no recovery UI

Affected file: `src/main.tsx`

An unexpected render failure previously left a blank page.

Refactor completed: `src/components/AppErrorBoundary.tsx` provides a minimal reload screen and reports details to the console. The root element is now checked explicitly instead of asserted non-null.

### Low — image fallback behavior was inconsistent

Affected files: `src/components/ProductCard.tsx`, `src/components/ProductDialog.tsx`, `src/components/CartDrawer.tsx`

Only catalog cards handled broken product images.

Refactor completed: all shopping surfaces use the centralized fallback image in `src/config/store.ts`.

No `dangerouslySetInnerHTML`, embedded credentials, authentication tokens, or user-controlled executable URLs were found. External links that open new contexts use safe opener behavior.

## Maintainability and cleanup

### Medium — dependency ranges used `latest`

Affected files: `package.json`, `package-lock.json`

A fresh dependency resolution could silently install breaking majors.

Refactor completed: direct dependencies are pinned to the audited installed versions and the lockfile is synchronized.

### Low — formatting rules were implicit

Affected file: `.prettierrc.json`

The repository relied on Prettier defaults.

Refactor completed: the effective conventions are now explicit.

### Low — README contains stale behavior

Affected file: `README.md`

It says product links lead to the live PrimeLabs site, which is no longer true, and describes the browser verification script as if it were maintained production coverage.

Recommended fix: update the feature and verification sections after the audit refactor is finalized.

## Scores after this refactor

| Area                    |  Score |
| ----------------------- | -----: |
| Overall project quality | 8.3/10 |
| Architecture            | 8.0/10 |
| React quality           | 8.6/10 |
| Readability             | 8.1/10 |
| Maintainability         | 8.2/10 |
| Styling/BEM consistency | 7.8/10 |
| TypeScript safety       | 9.0/10 |
| Performance             | 8.1/10 |

## Prioritized technical debt

### Immediately

- Verify all modal focus, Escape, backdrop, and scroll-lock behavior on desktop and mobile.
- Verify contact WhatsApp and newsletter email handoffs on real devices.
- Keep the full lint, type-check, format, and production build pipeline passing.

### Before the next release

- Extract catalog controls from `App.tsx` after their filter API stabilizes.
- Consolidate all English and Georgian UI labels into one typed copy source.
- Continue migrating dialog and catalog-filter selectors to BEM when those components change.
- Replace the stale ignored browser script with maintained, repeatable smoke tests.
- Update README claims to match in-app product details and current pagination.

### Later

- Move catalog inventory to a typed external source when updates need to happen without deployments.
- Precompute search text only if catalog growth creates measured input latency.
- Subset local fonts and serve WOFF2 assets.
- Consider a discriminated overlay state when more modal flows are introduced.
