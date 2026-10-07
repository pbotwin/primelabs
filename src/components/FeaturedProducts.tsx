import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Language, Product } from "../types";

type FeaturedProductsProps = {
  slides: Product[];
  language: Language;
  onOpenProduct: (product: Product) => void;
  t: (key: string) => string;
};

/* At most this many slides (and dots). */
const MAX_SLIDES = 6;

export function FeaturedProducts({
  slides: allSlides,
  language,
  onOpenProduct,
  t,
}: FeaturedProductsProps) {
  const slides = allSlides.slice(0, MAX_SLIDES);
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  const swiped = useRef(false);

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
    <section className="featured" aria-label={t("featuredProducts")}>
      <div
        className="featured__slider"
        aria-roledescription="carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          swipeStartX.current = event.clientX;
          swiped.current = false;
          setPaused(true);
        }}
        onPointerUp={(event) => {
          const start = swipeStartX.current;
          swipeStartX.current = null;
          if (event.pointerType !== "mouse") setPaused(false);
          if (start === null || Math.abs(start - event.clientX) <= 45) return;
          swiped.current = true;
          if (start > event.clientX) showNext();
          else showPrevious();
        }}
        onPointerCancel={() => {
          swipeStartX.current = null;
          setPaused(false);
        }}
        onClickCapture={(event) => {
          if (!swiped.current) return;
          swiped.current = false;
          event.preventDefault();
          event.stopPropagation();
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
                  {discount
                    ? `−${discount}% ${t("sale")}`
                    : t(product.category)}
                </span>
                <h1>{product.name}</h1>
                <p>
                  <strong>
                    {product.from && language !== "ka" && (
                      <small className="featured__from">{t("from")} </small>
                    )}
                    ₾{product.price.toFixed(2)}
                    {product.from && language === "ka" && (
                      <small className="featured__from">-{t("from")}</small>
                    )}
                  </strong>
                  {!!product.previousPrice && (
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
    </section>
  );
}
