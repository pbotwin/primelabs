import { useRef } from "react";
import { useDragScroll } from "../hooks/useDragScroll";

type SubcategoryChipsProps = {
  items: { id: string; label: string; count: number }[];
  active: string;
  total: number;
  onSelect: (id: string) => void;
  t: (key: string) => string;
};

/* Quick subcategory switcher under the catalog title. */
export function SubcategoryChips({
  items,
  active,
  total,
  onSelect,
  t,
}: SubcategoryChipsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  useDragScroll(trackRef);
  if (!items.length) return null;
  return (
    <div
      ref={trackRef}
      className="subcategory-chips"
      role="group"
      aria-label={t("subcategories")}
    >
      {[{ id: "all", label: t("all"), count: total }, ...items].map((item) => (
        <button
          key={item.id}
          className={active === item.id ? "active" : undefined}
          aria-pressed={active === item.id}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
          <small>{item.count}</small>
        </button>
      ))}
    </div>
  );
}
