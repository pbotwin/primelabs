import { useState } from "react";
import { ArrowRight, Check, Heart, ShieldCheck, X } from "lucide-react";
import { uiCopy } from "../data/uiCopy";
import { CustomSelect } from "./CustomSelect";
import { STORE } from "../config/store";
import { useModalDialog } from "../hooks/useModalDialog";
import type { Language, Product, ProductVariant } from "../types";
interface Props {
  language: Language;
  product: Product | null;
  saved: boolean;
  onSave: () => void;
  onAdd: (variant?: ProductVariant, options?: Record<string, string>) => void;
  onClose: () => void;
  relatedProducts: Product[];
  onRelated: (product: Product) => void;
  t: (key: string) => string;
}
export function ProductDialog({
  language,
  product,
  saved,
  onSave,
  onAdd,
  onClose,
  relatedProducts,
  onRelated,
  t,
}: Props) {
  const [variantSelection, setVariantSelection] = useState({
    productId: "",
    variantId: "",
  });
  // Photo shown and options chosen, both for the product currently open.
  const [gallery, setGallery] = useState({ productId: "", index: 0 });
  const [chosen, setChosen] = useState<{
    productId: string;
    values: Record<string, string>;
    missing: boolean;
  }>({ productId: "", values: {}, missing: false });
  const dialogRef = useModalDialog(Boolean(product), onClose);
  if (!product) return null;
  const u = uiCopy[language];
  const selectedVariant =
    product.variants.find(
      (variant) =>
        variantSelection.productId === product.id &&
        variant.id === variantSelection.variantId,
    ) ??
    product.variants.find((variant) => variant.inStock) ??
    product.variants[0];
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayPreviousPrice =
    selectedVariant?.previousPrice ?? product.previousPrice;
  const available = selectedVariant?.inStock ?? product.inStock;
  // The selected variant's photo first, then the product's own.
  const images = [
    ...new Set(
      [selectedVariant?.image, product.image].filter((image): image is string =>
        Boolean(image),
      ),
    ),
  ];
  const imageIndex =
    gallery.productId === product.id && gallery.index < images.length
      ? gallery.index
      : 0;
  const displayImage = images[imageIndex] ?? product.image;
  const options = product.options ?? [];
  const values = chosen.productId === product.id ? chosen.values : {};
  const missingRequired = options.some(
    (option) => option.required && !values[option.name],
  );
  const add = () => {
    if (missingRequired) {
      setChosen({ productId: product.id, values, missing: true });
      return;
    }
    onAdd(selectedVariant, Object.keys(values).length ? values : undefined);
  };
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="product-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
        tabIndex={-1}
      >
        <button className="dialog-close" onClick={onClose} aria-label={u.close}>
          <X />
        </button>
        <div className="dialog-scroll">
          <div className="dialog-media">
            <img
              src={displayImage}
              alt={`${product.brand} ${product.name}`}
              onError={(event) => {
                event.currentTarget.src = STORE.fallbackImage;
              }}
            />
            {product.badge && (
              <span className={`badge badge--${product.badge}`}>
                {t(product.badge)}
              </span>
            )}
            {images.length > 1 && (
              <div className="dialog-thumbs">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    className={index === imageIndex ? "active" : undefined}
                    aria-pressed={index === imageIndex}
                    onClick={() => setGallery({ productId: product.id, index })}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="dialog-copy">
            <p className="brand">{product.brand}</p>
            <h2 id="product-dialog-title">{product.name}</h2>
            <p className="dialog-subtitle">{product.subtitle}</p>
            <div className="dialog-price">
              <strong>₾{displayPrice.toFixed(2)}</strong>
              {!!displayPreviousPrice && (
                <del>₾{displayPreviousPrice.toFixed(2)}</del>
              )}
            </div>
            <div className={available ? "stock" : "stock out-of-stock"}>
              {available && <Check />}{" "}
              {available
                ? u.inStock
                : language === "ka"
                  ? "არ არის მარაგში"
                  : "Out of stock"}
            </div>
            <div className="dialog-detail-scroll">
              {product.variants.length > 0 && (
                <fieldset className="variant-picker">
                  <legend>
                    {language === "ka" ? "აირჩიე ვარიანტი" : "Select variant"}
                  </legend>
                  <div>
                    {product.variants.map((variant) => (
                      <button
                        type="button"
                        key={variant.id}
                        className={
                          selectedVariant?.id === variant.id ? "active" : ""
                        }
                        disabled={!variant.inStock}
                        onClick={() => {
                          setVariantSelection({
                            productId: product.id,
                            variantId: variant.id,
                          });
                          setGallery({ productId: product.id, index: 0 });
                        }}
                        aria-pressed={selectedVariant?.id === variant.id}
                      >
                        <span>{variant.name}</span>
                        <b>₾{variant.price.toFixed(2)}</b>
                        {!variant.inStock && (
                          <small>
                            {language === "ka"
                              ? "არ არის მარაგში"
                              : "Out of stock"}
                          </small>
                        )}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              {options.length > 0 && (
                <div className="option-picker">
                  {options.map((option) => (
                    <CustomSelect<string>
                      key={option.name}
                      label={option.required ? `${option.name} *` : option.name}
                      placeholder={`${t("select")} ${option.name}`}
                      value={values[option.name] ?? ""}
                      options={option.values.map((value) => ({
                        value,
                        label: value,
                      }))}
                      error={
                        chosen.missing &&
                        chosen.productId === product.id &&
                        option.required &&
                        !values[option.name]
                          ? `${t("select")} ${option.name}`
                          : undefined
                      }
                      onChange={(value) =>
                        setChosen({
                          productId: product.id,
                          values: { ...values, [option.name]: value },
                          missing: false,
                        })
                      }
                    />
                  ))}
                </div>
              )}
              <p className="dialog-description">
                {product.description[language] ||
                  product.description.en ||
                  product.description.ka ||
                  u.description}
              </p>
              <div className="product-facts">
                <details open>
                  <summary>
                    {language === "ka"
                      ? "პროდუქტის დეტალები"
                      : "Product details"}
                  </summary>
                  <dl>
                    <div>
                      <dt>{language === "ka" ? "ტიპი" : "Type"}</dt>
                      <dd>{product.subtitle}</dd>
                    </div>
                    <div>
                      <dt>{language === "ka" ? "კატეგორია" : "Category"}</dt>
                      <dd>{t(product.category)}</dd>
                    </div>
                    <div>
                      <dt>{language === "ka" ? "ბრენდი" : "Brand"}</dt>
                      <dd>{product.brand}</dd>
                    </div>
                  </dl>
                </details>
                <details>
                  <summary>
                    {language === "ka"
                      ? "მიღება და კონსულტაცია"
                      : "Use and guidance"}
                  </summary>
                  <p>
                    {language === "ka"
                      ? "გამოყენებამდე გაეცანი პროდუქტის შეფუთვაზე მითითებულ დოზირებას. შერჩევაში დახმარებისთვის მოგვწერე."
                      : "Follow the serving directions on the product packaging. Contact us if you need help choosing."}
                  </p>
                </details>
              </div>
              {relatedProducts.length > 0 && (
                <div className="related-products">
                  <h3>
                    {language === "ka"
                      ? "მსგავსი პროდუქტები"
                      : "Related products"}
                  </h3>
                  <div>
                    {relatedProducts.map((item) => (
                      <button key={item.id} onClick={() => onRelated(item)}>
                        <img src={item.image} alt="" />
                        <span>
                          <small>{item.brand}</small>
                          <b>{item.name}</b>
                        </span>
                        <strong>₾{item.price.toFixed(2)}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="dialog-purchase">
              <div className="dialog-actions">
                <button
                  className="button primary"
                  onClick={add}
                  disabled={!available}
                >
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
        </div>
      </section>
    </div>
  );
}
