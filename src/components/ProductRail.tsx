import { ArrowRight } from "lucide-react";
import type { Language, Product } from "../types";
import { HorizontalScroller } from "./HorizontalScroller";
import { ProductCard } from "./ProductCard";

type ProductRailProps = {
  id: string;
  title: string;
  products: Product[];
  savedIds: string[];
  addedProductId: string;
  onViewAll: () => void;
  onSave: (productId: string) => void;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
  language: Language;
  t: (key: string) => string;
};

/* A themed, horizontally scrolling row of products. */
export function ProductRail({
  id,
  title,
  products,
  savedIds,
  addedProductId,
  onViewAll,
  onSave,
  onOpen,
  onAdd,
  language,
  t,
}: ProductRailProps) {
  if (!products.length) return null;
  return (
    <section className="product-rail shell" aria-labelledby={`${id}-title`}>
      <div className="product-rail__heading">
        <h2 id={`${id}-title`}>{title}</h2>
        <button onClick={onViewAll}>
          {t("viewAll")} <ArrowRight />
        </button>
      </div>
      <HorizontalScroller
        className="product-rail__track"
        label={title}
        previousLabel={t("previous")}
        nextLabel={t("next")}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            saved={savedIds.includes(product.id)}
            onSave={() => onSave(product.id)}
            onOpen={() => onOpen(product)}
            onAdd={() => onAdd(product)}
            added={addedProductId === product.id}
            language={language}
            t={t}
          />
        ))}
      </HorizontalScroller>
    </section>
  );
}
