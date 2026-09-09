import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { CopyKey } from "../data/translations";
import type { Product } from "../types";

type FeaturedProductsProps = {
  slides: Product[];
  supportingProducts: [Product, Product];
  onOpenProduct: (product: Product) => void;
  t: (key: CopyKey) => string;
};

export function FeaturedProducts({
  slides,
  supportingProducts,
  onOpenProduct,
  t,
}: FeaturedProductsProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const timer = window.setInterval(
      () => setActiveSlide((slide) => (slide + 1) % slides.length),
      5500,
    );
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const showPrevious = () =>
    setActiveSlide((slide) => (slide - 1 + slides.length) % slides.length);
  const showNext = () => setActiveSlide((slide) => (slide + 1) % slides.length);

  return (
    <section className="featured shell" aria-label={t("featuredProducts")}>
      <div
        className="featured__slider"
        aria-roledescription="carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
          setPaused(true);
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          const end = event.changedTouches[0]?.clientX;
          if (start !== null && end !== undefined && Math.abs(start - end) > 45)
            if (start > end) showNext();
            else showPrevious();
          touchStartX.current = null;
          setPaused(false);
        }}
      >
        {slides.map((product, index) => {
          const discount = product.previousPrice
            ? Math.round((1 - product.price / product.previousPrice) * 100)
            : 0;
          const active = activeSlide === index;
          return (
            <button
              key={product.id}
              className={
                active
                  ? "featured__slide featured__slide--active"
                  : "featured__slide"
              }
              onClick={() => onOpenProduct(product)}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
            >
              <div>
                <span className="featured__label">
                  {discount ? `−${discount}% ${t("sale")}` : product.brand}
                </span>
                <h1>{product.name}</h1>
                <p>
                  {product.from && <small>{t("from")}</small>}
                  <strong>₾{product.price.toFixed(2)}</strong>
                  {product.previousPrice && (
                    <del>₾{product.previousPrice.toFixed(2)}</del>
                  )}
                </p>
                <span className="featured__action">
                  {t("buy")} <ArrowRight />
                </span>
              </div>
              <img
                src={product.image}
                alt={`${product.brand} ${product.name}`}
              />
            </button>
          );
        })}
        <button
          className="featured__arrow featured__arrow--previous"
          onClick={showPrevious}
          aria-label={t("previousProduct")}
        >
          <ChevronLeft />
        </button>
        <button
          className="featured__arrow featured__arrow--next"
          onClick={showNext}
          aria-label={t("nextProduct")}
        >
          <ChevronRight />
        </button>
        <div className="featured__dots">
          {slides.map((product, index) => (
            <button
              key={product.id}
              className={
                activeSlide === index
                  ? "featured__dot featured__dot--active"
                  : "featured__dot"
              }
              onClick={() => setActiveSlide(index)}
              aria-label={`${t("slide")} ${index + 1}: ${product.name}`}
              aria-current={activeSlide === index ? "true" : undefined}
            />
          ))}
        </div>
        <span className="sr-only" aria-live="polite">
          {t("slide")} {activeSlide + 1} / {slides.length}
        </span>
      </div>
      <div className="featured__supporting">
        {supportingProducts.map((product) => (
          <button key={product.id} onClick={() => onOpenProduct(product)}>
            <img src={product.image} alt={`${product.brand} ${product.name}`} />
            <div>
              <span>{product.badge ? t(product.badge) : product.brand}</span>
              <h2>{product.name}</h2>
              <strong>₾{product.price.toFixed(2)}</strong>
            </div>
            <ArrowRight />
          </button>
        ))}
      </div>
    </section>
  );
}
