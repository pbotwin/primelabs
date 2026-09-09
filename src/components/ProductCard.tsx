import { Check, Heart, Plus } from "lucide-react";
import type { CopyKey } from "../data/translations";
import type { Product } from "../types";
interface Props {
  product: Product;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  onAdd: () => void;
  added: boolean;
  t: (key: CopyKey) => string;
}
export function ProductCard({
  product,
  saved,
  onSave,
  onOpen,
  onAdd,
  added,
  t,
}: Props) {
  const discount = product.previousPrice
    ? Math.round((1 - product.price / product.previousPrice) * 100)
    : 0;
  return (
    <article className="product-card">
      <div className="product-media">
        <button
          className="product-open-media"
          onClick={onOpen}
          aria-label={product.name}
        >
          <img
            src={product.image}
            onError={(event) => {
              event.currentTarget.src = "./vitamins.webp";
            }}
            alt={`${product.brand} ${product.name}`}
            loading="lazy"
          />
        </button>
        {product.badge && (
          <span className={`badge ${product.badge}`}>{t(product.badge)}</span>
        )}
        {discount > 0 && <span className="discount">−{discount}%</span>}
        <button
          className={saved ? "save active" : "save"}
          onClick={onSave}
          aria-label={`${t("saved")}: ${product.name}`}
          aria-pressed={saved}
        >
          <Heart fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-copy">
        <p className="brand">{product.brand}</p>
        <h3>
          <button className="product-title" onClick={onOpen}>
            {product.name}
          </button>
        </h3>
        <p className="subtitle">
          {product.variants.length ? t(product.category) : product.subtitle}
        </p>
        <div className="card-meta">
          <span className={product.inStock ? "available" : "unavailable"}>
            <i /> {product.inStock ? t("inStockShort") : t("outOfStock")}
          </span>
          {product.variants.length > 0 && (
            <span>
              {product.variants.length} {t("options")}
            </span>
          )}
        </div>
        <div className="product-bottom">
          <div className="price">
            {product.from && <small>{t("from")}</small>}
            <strong>₾{product.price.toFixed(2)}</strong>
            {product.previousPrice && (
              <del>₾{product.previousPrice.toFixed(2)}</del>
            )}
          </div>
          <button
            className={added ? "buy added" : "buy"}
            onClick={onAdd}
            aria-label={`${t("buy")}: ${product.name}`}
          >
            <span>{added ? t("added") : t("buy")}</span>
            {added ? <Check /> : <Plus />}
          </button>
        </div>
      </div>
    </article>
  );
}
