import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { uiCopy } from "../data/uiCopy";
import type { Language, Product } from "../types";
interface Props {
  language: Language;
  open: boolean;
  items: { product: Product; quantity: number }[];
  onClose: () => void;
  onQuantity: (id: string, quantity: number) => void;
  onComplete: () => void;
}
export function CartDrawer({
  language,
  open,
  items,
  onClose,
  onQuantity,
  onComplete,
}: Props) {
  const [step, setStep] = useState<"bag" | "checkout" | "done">("bag");
  if (!open) return null;
  const u = uiCopy[language];
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onComplete();
    setStep("done");
  };
  const close = () => {
    onClose();
    setTimeout(() => setStep("bag"), 250);
  };
  return (
    <div
      className="cart-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
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
          <div className="cart-empty">
            <CheckCircle2 />
            <h3>{u.orderReceived}</h3>
            <p>{u.orderMessage}</p>
            <button className="button primary" onClick={close}>
              {u.continueShopping}
            </button>
          </div>
        ) : step === "checkout" ? (
          <form className="checkout-form" onSubmit={submit}>
            <label>
              {u.fullName}
              <input
                required
                autoComplete="name"
                placeholder={u.namePlaceholder}
              />
            </label>
            <label>
              {u.phone}
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+995 5XX XX XX XX"
                pattern="[+0-9 ()-]{9,}"
              />
            </label>
            <label>
              {u.address}
              <input
                required
                autoComplete="street-address"
                placeholder={u.addressPlaceholder}
              />
            </label>
            <label>
              {u.city}
              <select required defaultValue="">
                <option value="" disabled>
                  {u.selectCity}
                </option>
                <option>Tbilisi</option>
                <option>Batumi</option>
                <option>Kutaisi</option>
                <option>{u.other}</option>
              </select>
            </label>
            <fieldset>
              <legend>{u.payment}</legend>
              <label className="payment">
                <input type="radio" name="payment" defaultChecked />{" "}
                {u.cashCard}
              </label>
            </fieldset>
            <div className="checkout-total">
              <span>{u.total}</span>
              <strong>₾{total.toFixed(2)}</strong>
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
              {items.map(({ product, quantity }) => (
                <article key={product.id}>
                  <img src={product.image} alt={product.name} />
                  <div>
                    <small>{product.brand}</small>
                    <h3>{product.name}</h3>
                    <strong>₾{product.price.toFixed(2)}</strong>
                    <div className="quantity">
                      <button
                        onClick={() => onQuantity(product.id, quantity - 1)}
                        aria-label="−"
                      >
                        {quantity === 1 ? <Trash2 /> : <Minus />}
                      </button>
                      <span>{quantity}</span>
                      <button
                        onClick={() => onQuantity(product.id, quantity + 1)}
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
