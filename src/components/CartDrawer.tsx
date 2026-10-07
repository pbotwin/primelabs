import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { STORE } from "../config/store";
import { uiCopy } from "../data/uiCopy";
import { useModalDialog } from "../hooks/useModalDialog";
import type { Language, Product, ProductVariant } from "../types";
import { CustomSelect } from "./CustomSelect";

const CITIES = [
  { id: "tbilisi", en: "Tbilisi", ka: "თბილისი" },
  { id: "batumi", en: "Batumi", ka: "ბათუმი" },
  { id: "kutaisi", en: "Kutaisi", ka: "ქუთაისი" },
  { id: "rustavi", en: "Rustavi", ka: "რუსთავი" },
  { id: "zugdidi", en: "Zugdidi", ka: "ზუგდიდი" },
  { id: "gori", en: "Gori", ka: "გორი" },
  { id: "poti", en: "Poti", ka: "ფოთი" },
  { id: "samtredia", en: "Samtredia", ka: "სამტრედია" },
  { id: "khashuri", en: "Khashuri", ka: "ხაშური" },
  { id: "senaki", en: "Senaki", ka: "სენაკი" },
  { id: "zestafoni", en: "Zestafoni", ka: "ზესტაფონი" },
  { id: "marneuli", en: "Marneuli", ka: "მარნეული" },
  { id: "telavi", en: "Telavi", ka: "თელავი" },
  { id: "akhaltsikhe", en: "Akhaltsikhe", ka: "ახალციხე" },
  { id: "kobuleti", en: "Kobuleti", ka: "ქობულეთი" },
  { id: "ozurgeti", en: "Ozurgeti", ka: "ოზურგეთი" },
  { id: "kaspi", en: "Kaspi", ka: "კასპი" },
  { id: "chiatura", en: "Chiatura", ka: "ჭიათურა" },
  { id: "tskaltubo", en: "Tskaltubo", ka: "წყალტუბო" },
  { id: "sagarejo", en: "Sagarejo", ka: "საგარეჯო" },
  { id: "gardabani", en: "Gardabani", ka: "გარდაბანი" },
  { id: "borjomi", en: "Borjomi", ka: "ბორჯომი" },
  { id: "mtskheta", en: "Mtskheta", ka: "მცხეთა" },
  { id: "other", en: "Other (manual input)", ka: "სხვა (მექანიკური შეყვანა)" },
];

interface Props {
  language: Language;
  open: boolean;
  items: {
    key: string;
    product: Product;
    variant?: ProductVariant;
    options?: Record<string, string>;
    quantity: number;
  }[];
  onClose: () => void;
  onQuantity: (id: string, quantity: number) => void;
  onComplete: () => void;
}
type Receipt = {
  phone: string;
  email: string;
  city: string;
  address: string;
  delivery: number;
  total: number;
};
export function CartDrawer({
  language,
  open,
  items,
  onClose,
  onQuantity,
  onComplete,
}: Props) {
  const [step, setStep] = useState<"bag" | "checkout" | "done">("bag");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [cityError, setCityError] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const close = () => {
    onClose();
    setStep("bag");
    setCity("");
    setCustomCity("");
    setCityError(false);
    setReceipt(null);
  };
  const dialogRef = useModalDialog(open, close);
  if (!open) return null;
  const u = uiCopy[language];
  const total = items.reduce(
    (sum, item) =>
      sum + (item.variant?.price ?? item.product.price) * item.quantity,
    0,
  );
  // Delivery: free over the threshold, otherwise Tbilisi or the regions.
  const cityName =
    city === "other"
      ? customCity.trim()
      : (CITIES.find((item) => item.id === city)?.[language] ?? "");
  const citySelected = cityName !== "";
  const inTbilisi =
    city === "tbilisi" ||
    (city === "other" &&
      ["tbilisi", "თბილისი"].includes(customCity.trim().toLowerCase()));
  const delivery = !citySelected
    ? null
    : total > STORE.freeDeliveryThreshold
      ? 0
      : inTbilisi
        ? STORE.deliveryTbilisi
        : STORE.deliveryRegions;
  const price = (amount: number) =>
    amount === 0 ? u.free : `₾${amount.toFixed(2)}`;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!citySelected || delivery === null) {
      setCityError(true);
      return;
    }
    const data = new FormData(event.currentTarget);
    const order: Receipt = {
      phone: String(data.get("phone")),
      email: String(data.get("email")),
      city: cityName,
      address: String(data.get("address")),
      delivery,
      total: total + delivery,
    };
    const lines = items.map(
      ({ product, variant, options, quantity }) =>
        `• ${product.name}${variant ? ` (${variant.name})` : ""}${
          options
            ? ` [${Object.entries(options)
                .map(([name, value]) => `${name}: ${value}`)
                .join(", ")}]`
            : ""
        } × ${quantity} — ₾${((variant?.price ?? product.price) * quantity).toFixed(2)}`,
    );
    const message = [
      "PrimeLabs order",
      ...lines,
      `Subtotal: ₾${total.toFixed(2)}`,
      `Delivery: ${delivery === 0 ? "Free" : `₾${delivery.toFixed(2)}`}`,
      `Total: ₾${order.total.toFixed(2)}`,
      `Phone: ${order.phone}`,
      `Email: ${order.email}`,
      `Address: ${order.address}, ${order.city}`,
    ].join("\n");
    window.open(
      `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    onComplete();
    setReceipt(order);
    setStep("done");
  };
  return (
    <div
      className="cart-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <aside
        ref={dialogRef}
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        tabIndex={-1}
      >
        <header>
          <div>
            <span>{u.yourOrder}</span>
            <h2 id="cart-title">
              {step === "checkout"
                ? u.checkout
                : step === "done"
                  ? u.orderComplete
                  : u.shoppingBag}
            </h2>
          </div>
          <button onClick={close} aria-label={u.close}>
            <X />
          </button>
        </header>
        {step === "done" ? (
          <div className="cart-empty cart-receipt">
            <CheckCircle2 />
            <h3>{u.orderReceived}</h3>
            <p>{u.orderMessage}</p>
            {receipt && (
              <dl className="cart-summary">
                <div>
                  <dt>{u.phone}</dt>
                  <dd>{receipt.phone}</dd>
                </div>
                <div>
                  <dt>{u.email}</dt>
                  <dd>{receipt.email}</dd>
                </div>
                <div>
                  <dt>{u.city}</dt>
                  <dd>{receipt.city}</dd>
                </div>
                <div>
                  <dt>{u.address}</dt>
                  <dd>{receipt.address}</dd>
                </div>
                <div>
                  <dt>{u.delivery}</dt>
                  <dd>{price(receipt.delivery)}</dd>
                </div>
                <div className="checkout-total">
                  <span>{u.grandTotal}</span>
                  <strong>₾{receipt.total.toFixed(2)}</strong>
                </div>
              </dl>
            )}
            <button className="button primary" onClick={close}>
              {u.continueShopping}
            </button>
          </div>
        ) : step === "checkout" ? (
          <form className="checkout-form" onSubmit={submit}>
            <label>
              {u.phone}
              <input
                name="phone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+995 5XX XX XX XX"
                pattern="[+0-9 \(\)\-]{9,}"
              />
            </label>
            <label>
              {u.email}
              <input
                name="email"
                required
                type="email"
                autoComplete="email"
                placeholder={u.emailPlaceholder}
              />
            </label>
            <CustomSelect
              label={u.city}
              name="city"
              required
              value={city}
              placeholder={u.selectCity}
              error={cityError ? u.cityRequired : undefined}
              options={CITIES.map((item) => ({
                value: item.id,
                label: item[language],
              }))}
              onChange={(value) => {
                setCity(value);
                if (value !== "other") setCustomCity("");
                setCityError(false);
              }}
            />
            {city === "other" && (
              <label>
                {u.specifyCity}
                <input
                  name="customCity"
                  required
                  value={customCity}
                  onChange={(event) => {
                    setCustomCity(event.target.value);
                    setCityError(false);
                  }}
                  placeholder={u.specifyCityPlaceholder}
                />
              </label>
            )}
            <label>
              {u.address}
              <input
                name="address"
                required
                autoComplete="street-address"
                placeholder={u.addressPlaceholder}
              />
            </label>
            <dl className="cart-summary">
              <div>
                <dt>{u.subtotal}</dt>
                <dd>₾{total.toFixed(2)}</dd>
              </div>
              <div>
                <dt>{u.delivery}</dt>
                <dd>
                  {delivery === null ? u.selectCityFirst : price(delivery)}
                </dd>
              </div>
            </dl>
            <div className="checkout-total">
              <span>{u.grandTotal}</span>
              <strong>
                {delivery === null ? "—" : `₾${(total + delivery).toFixed(2)}`}
              </strong>
            </div>
            <button className="button primary" type="submit">
              {u.placeOrder}
            </button>
            <button
              className="back-cart"
              type="button"
              onClick={() => setStep("bag")}
            >
              {u.backBag}
            </button>
          </form>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag />
            <h3>{u.emptyBag}</h3>
            <p>{u.emptyBagText}</p>
            <button className="button primary" onClick={close}>
              {u.browse}
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(({ key, product, variant, options, quantity }) => (
                <article key={key}>
                  <img
                    src={variant?.image ?? product.image}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.src = STORE.fallbackImage;
                    }}
                  />
                  <div>
                    <small>{product.brand}</small>
                    <h3>{product.name}</h3>
                    {variant && <em>{variant.name}</em>}
                    {options &&
                      Object.entries(options).map(([name, value]) => (
                        <em key={name}>
                          {name}: {value}
                        </em>
                      ))}
                    <strong>
                      ₾{(variant?.price ?? product.price).toFixed(2)}
                    </strong>
                    <div className="quantity">
                      <button
                        onClick={() => onQuantity(key, quantity - 1)}
                        aria-label="−"
                      >
                        {quantity === 1 ? <Trash2 /> : <Minus />}
                      </button>
                      <span>{quantity}</span>
                      <button
                        onClick={() => onQuantity(key, quantity + 1)}
                        aria-label="+"
                      >
                        <Plus />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <footer>
              <div className="delivery-progress">
                <span>
                  {total > STORE.freeDeliveryThreshold
                    ? language === "ka"
                      ? "უფასო მიწოდება გააქტიურებულია"
                      : "Free delivery unlocked"
                    : language === "ka"
                      ? `დაამატე ₾${(STORE.freeDeliveryThreshold - total).toFixed(0)} უფასო მიწოდებისთვის`
                      : `Add ₾${(STORE.freeDeliveryThreshold - total).toFixed(0)} for free delivery`}
                </span>
                <i>
                  <b
                    style={{
                      width: `${Math.min(100, (total / STORE.freeDeliveryThreshold) * 100)}%`,
                    }}
                  />
                </i>
              </div>
              <div>
                <span>{u.total}</span>
                <strong>₾{total.toFixed(2)}</strong>
              </div>
              <button
                className="button primary"
                onClick={() => setStep("checkout")}
              >
                {u.continueCheckout}
              </button>
              <p>{u.deliveryCalculated}</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
