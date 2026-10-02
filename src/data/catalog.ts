import type { Product } from "../types";
import { createDemoCatalog } from "./demoProducts";
import { products as storeProducts } from "./products";
import { subcategoryLabels, type Label } from "./taxonomy";

/* During local development (npm run dev) a large generated catalog is added
   for testing categories, filters, rails, and paging; open the site with
   "?real" to see only the store's products. Production builds never include
   the demo products. */
export const DEMO_CATALOG =
  import.meta.env.DEV &&
  !new URLSearchParams(window.location.search).has("real");

const MISSING_PHOTO = "./logo.svg";

const escapeXml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character] ?? character,
  );

const shorten = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;

/* Products imported without a photo get a neutral package illustration with
   their brand and name, instead of a bare logo. */
export function placeholderImage(product: Pick<Product, "brand" | "name">) {
  const initials = product.brand
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<rect width="600" height="600" fill="#f5f2f6"/>
<rect x="200" y="58" width="200" height="62" rx="16" fill="#2a2230"/>
<rect x="168" y="106" width="264" height="330" rx="40" fill="#171219"/>
<rect x="168" y="204" width="264" height="132" fill="#e600f5"/>
<text x="300" y="295" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="800" fill="#fff">${escapeXml(initials)}</text>
<text x="300" y="508" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="800" fill="#171219">${escapeXml(shorten(product.brand.toUpperCase(), 20))}</text>
<text x="300" y="556" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#5d5662">${escapeXml(shorten(product.name, 26))}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const hasPhoto = (product: Product) =>
  !product.image.startsWith("data:image/svg");

/* Fills in missing photos, and treats a product with options as in stock
   only when at least one option can actually be bought. */
const normalize = (items: Product[]) =>
  items.map((product) => ({
    ...product,
    image:
      product.image === MISSING_PHOTO
        ? placeholderImage(product)
        : product.image,
    inStock:
      product.inStock &&
      (product.variants.length === 0 ||
        product.variants.some((variant) => variant.inStock)),
  }));

/* Display names for category and subcategory ids not in translations.ts. */
const demo = DEMO_CATALOG ? createDemoCatalog() : null;

export const labels: Record<string, Label> = {
  ...subcategoryLabels,
  ...demo?.labels,
};

export const products = normalize(
  demo ? [...storeProducts, ...demo.products] : storeProducts,
);
