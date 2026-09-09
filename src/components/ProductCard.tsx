import { Check, Heart, Plus } from "lucide-react";
import { STORE } from "../config/store";
import type { Product } from "../types";
interface Props {
  product: Product;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  onAdd: () => void;
  added: boolean;
  t: (key: string) => string;
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
      <button
        className="product-card__open"
        onClick={onOpen}
        aria-label={product.name}
      />
      <div className="product-card__media">
        <img
          src={product.image}
          onError={(event) => {
            event.currentTarget.src = STORE.fallbackImage;
          }}
          alt={`${product.brand} ${product.name}`}
          loading="lazy"
        />
        {product.badge && (
          <span className={`badge badge--${product.badge}`}>
            {t(product.badge)}
          </span>
        )}
        {discount > 0 && (
          <span className="product-card__discount">−{discount}%</span>
        )}
        <button
          className={
            saved
              ? "product-card__save product-card__save--active"
              : "product-card__save"
          }
          onClick={onSave}
          aria-label={`${t("saved")}: ${product.name}`}
          aria-pressed={saved}
          data-tooltip={t("saved")}
        >
          <Heart fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-card__content">
        <p className="product-card__brand">{product.brand}</p>
        <h3>{product.name}</h3>
        <p className="product-card__subtitle">
          {product.variants.length ? t(product.category) : product.subtitle}
        </p>
        <div className="product-card__meta">
          <span
            className={
              product.inStock
                ? "product-card__availability"
                : "product-card__availability product-card__availability--unavailable"
            }
          >
            <i /> {product.inStock ? t("inStockShort") : t("outOfStock")}
          </span>
          {product.variants.length > 0 && (
            <span>
              {product.variants.length} {t("options")}
            </span>
          )}
        </div>
        <div className="product-card__footer">
          <div className="product-card__price">
            {product.from && <small>{t("from")}</small>}
            <strong>₾{product.price.toFixed(2)}</strong>
            {product.previousPrice && (
              <del>₾{product.previousPrice.toFixed(2)}</del>
            )}
          </div>
          <button
            className={
              added
                ? "product-card__buy product-card__buy--added"
                : "product-card__buy"
            }
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
