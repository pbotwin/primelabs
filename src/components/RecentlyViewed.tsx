import type { CopyKey } from "../data/translations";
import type { Language, Product } from "../types";
import { ProductCard } from "./ProductCard";

type RecentlyViewedProps = {
  language: Language;
  products: Product[];
  recentIds: string[];
  savedIds: string[];
  addedProductId: string;
  onClear: () => void;
  onSave: (productId: string) => void;
  onOpen: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  t: (key: CopyKey) => string;
};

export function RecentlyViewed({
  language,
  products,
  recentIds,
  savedIds,
  addedProductId,
  onClear,
  onSave,
  onOpen,
  onQuickAdd,
  t,
}: RecentlyViewedProps) {
  const recentProducts = products
    .filter((product) => recentIds.includes(product.id))
    .sort(
      (first, second) =>
        recentIds.indexOf(first.id) - recentIds.indexOf(second.id),
    )
    .slice(0, 4);

  if (recentProducts.length === 0) return null;

  return (
    <section className="recently-viewed shell" aria-labelledby="recent-title">
      <div className="recent-heading">
        <div>
          <span>{language === "ka" ? "შენი ისტორია" : "Your history"}</span>
          <h2 id="recent-title">
            {language === "ka" ? "ბოლოს ნანახი" : "Recently viewed"}
          </h2>
        </div>
        <button onClick={onClear}>{t("reset")}</button>
      </div>
      <div className="recent-grid">
        {recentProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            saved={savedIds.includes(product.id)}
            onSave={() => onSave(product.id)}
            onOpen={() => onOpen(product)}
            onAdd={() => onQuickAdd(product)}
            added={addedProductId === product.id}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
