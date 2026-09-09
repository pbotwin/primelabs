import { Heart, X } from "lucide-react";
import type { CopyKey } from "../data/translations";
import { useModalDialog } from "../hooks/useModalDialog";
import type { Product } from "../types";

type SavedProductsDialogProps = {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onOpenProduct: (product: Product) => void;
  onRemove: (productId: string) => void;
  t: (key: CopyKey) => string;
};

export function SavedProductsDialog({
  open,
  products,
  onClose,
  onOpenProduct,
  onRemove,
  t,
}: SavedProductsDialogProps) {
  const dialogRef = useModalDialog(open, onClose);
  if (!open) return null;

  return (
    <div
      className="saved-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        ref={dialogRef}
        className="saved-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-products-title"
        tabIndex={-1}
      >
        <header>
          <div>
            <span>{products.length}</span>
            <h2 id="saved-products-title">{t("saved")}</h2>
          </div>
          <button onClick={onClose} aria-label={t("close")}>
            <X />
          </button>
        </header>
        {products.length ? (
          <div className="saved-list">
            {products.map((product) => (
              <article key={product.id}>
                <button
                  className="saved-product"
                  onClick={() => onOpenProduct(product)}
                >
                  <img src={product.image} alt="" />
                  <span>
                    <small>{product.brand}</small>
                    <strong>{product.name}</strong>
                    <b>₾{product.price.toFixed(2)}</b>
                  </span>
                </button>
                <button
                  className="saved-remove"
                  onClick={() => onRemove(product.id)}
                  aria-label={`${t("saved")}: ${product.name}`}
                >
                  <Heart fill="currentColor" />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="saved-empty">
            <Heart />
            <h3>{t("empty")}</h3>
            <button className="button primary" onClick={onClose}>
              {t("shop")}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
