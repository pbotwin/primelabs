import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type HorizontalScrollerProps = {
  children: ReactNode;
  className: string;
  label: string;
  previousLabel: string;
  nextLabel: string;
};

export function HorizontalScroller({
  children,
  className,
  label,
  previousLabel,
  nextLabel,
}: HorizontalScrollerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [availableDirection, setAvailableDirection] = useState({
    previous: false,
    next: false,
  });

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const updateControls = () => {
      const maximumScroll = content.scrollWidth - content.clientWidth;
      const nextDirection = {
        previous: content.scrollLeft > 4,
        next: maximumScroll > 4 && content.scrollLeft < maximumScroll - 4,
      };

      setAvailableDirection((current) =>
        current.previous === nextDirection.previous &&
        current.next === nextDirection.next
          ? current
          : nextDirection,
      );
    };

    updateControls();
    content.addEventListener("scroll", updateControls, { passive: true });
    const resizeObserver = new ResizeObserver(updateControls);
    resizeObserver.observe(content);

    return () => {
      content.removeEventListener("scroll", updateControls);
      resizeObserver.disconnect();
    };
  }, [children]);

  const scroll = (direction: -1 | 1) => {
    const content = contentRef.current;
    if (!content) return;

    content.scrollBy({
      left: direction * Math.max(160, content.clientWidth * 0.7),
      behavior: "smooth",
    });
  };

  return (
    <div className="horizontal-scroller">
      <div className={className} ref={contentRef} aria-label={label}>
        {children}
      </div>
      {availableDirection.previous && (
        <button
          type="button"
          className="horizontal-scroller__control horizontal-scroller__control--previous"
          onClick={() => scroll(-1)}
          aria-label={previousLabel}
        >
          <ChevronLeft />
        </button>
      )}
      {availableDirection.next && (
        <button
          type="button"
          className="horizontal-scroller__control horizontal-scroller__control--next"
          onClick={() => scroll(1)}
          aria-label={nextLabel}
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
}
