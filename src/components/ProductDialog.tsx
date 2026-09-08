import { useEffect } from "react";
import { ArrowRight, Check, Heart, ShieldCheck, X } from "lucide-react";
import type { CopyKey } from "../data/translations";
import { uiCopy } from "../data/uiCopy";
import type { Language, Product } from "../types";
interface Props {
  language: Language;
  product: Product | null;
  saved: boolean;
  onSave: () => void;
  onAdd: () => void;
  onClose: () => void;
  t: (key: CopyKey) => string;
}
export function ProductDialog({
  language,
  product,
  saved,
  onSave,
  onAdd,
  onClose,
  t,
}: Props) {
  useEffect(() => {
    if (!product) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("modal-open");
    addEventListener("keydown", close);
    return () => {
      document.body.classList.remove("modal-open");
      removeEventListener("keydown", close);
    };
  }, [product, onClose]);
  if (!product) return null;
  const u = uiCopy[language];
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="product-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
      >
        <button className="dialog-close" onClick={onClose} aria-label={u.close}>
          <X />
        </button>
        <div className="dialog-scroll">
          <div className="dialog-media">
            <img src={product.image} alt={`${product.brand} ${product.name}`} />
            {product.badge && (
              <span className={`badge ${product.badge}`}>
                {t(product.badge)}
              </span>
            )}
          </div>
          <div className="dialog-copy">
            <p className="brand">{product.brand}</p>
            <h2 id="product-dialog-title">{product.name}</h2>
            <p className="dialog-subtitle">{product.subtitle}</p>
            <div className="dialog-price">
              <strong>₾{product.price.toFixed(2)}</strong>
              {product.previousPrice && (
                <del>₾{product.previousPrice.toFixed(2)}</del>
              )}
            </div>
            <div className="stock">
              <Check /> {u.inStock}
            </div>
            <p className="dialog-description">{u.description}</p>
            <div className="dialog-actions">
              <button className="button primary" onClick={onAdd}>
                {t("buy")} <ArrowRight />
              </button>
              <button
                className={
                  saved ? "button save-detail active" : "button save-detail"
                }
                onClick={onSave}
              >
                <Heart fill={saved ? "currentColor" : "none"} />
                {t("saved")}
              </button>
            </div>
            <p className="secure-note">
              <ShieldCheck /> {u.secure}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
