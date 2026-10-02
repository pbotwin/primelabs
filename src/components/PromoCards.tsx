import { useRef } from "react";
import { ArrowUpRight, MessageCircle, Truck } from "lucide-react";
import { useDragScroll } from "../hooks/useDragScroll";
import { STORE } from "../config/store";
import type { Product } from "../types";

type PromoCardsProps = {
  bundle: Product;
  onBundle: () => void;
  onContact: () => void;
  t: (key: string) => string;
};

export function PromoCards({
  bundle,
  onBundle,
  onContact,
  t,
}: PromoCardsProps) {
  const trackRef = useRef<HTMLElement>(null);
  useDragScroll(trackRef);
  return (
    <section
      ref={trackRef}
      className="promo-cards shell"
      aria-label={t("featuredProducts")}
    >
      <div className="promo-card promo-card--delivery">
        <span className="promo-card__value">
          {STORE.freeDeliveryThreshold}₾<small>+</small>
        </span>
        <div>
          <h2>{t("promoDeliveryTitle")}</h2>
          <p>{t("promoDeliveryText")}</p>
        </div>
        <Truck className="promo-card__icon" aria-hidden="true" />
      </div>
      <button className="promo-card promo-card--bundle" onClick={onBundle}>
        <span className="promo-card__value">{bundle.price}₾</span>
        <div>
          <h2>{t("promoBundleTitle")}</h2>
          <p>{t("promoBundleText")}</p>
        </div>
        <img src={bundle.image} alt="" />
        <ArrowUpRight className="promo-card__arrow" aria-hidden="true" />
      </button>
      <button className="promo-card promo-card--advice" onClick={onContact}>
        <MessageCircle className="promo-card__badge" aria-hidden="true" />
        <div>
          <h2>{t("promoAdviceTitle")}</h2>
          <p>{t("promoAdviceText")}</p>
        </div>
        <ArrowUpRight className="promo-card__arrow" aria-hidden="true" />
      </button>
    </section>
  );
}
