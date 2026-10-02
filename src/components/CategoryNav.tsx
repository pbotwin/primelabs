import { ChevronRight, LayoutGrid, type LucideIcon } from "lucide-react";
import type { Category } from "../types";

export type CategoryItem = { id: Category; image?: string; icon?: LucideIcon };

type CategoryNavProps = {
  categories: CategoryItem[];
  counts: Record<string, number>;
  onCategory: (id: Category) => void;
  t: (key: string) => string;
};

export function CategoryVisual({ item }: { item: CategoryItem }) {
  if (item.image) return <img src={item.image} alt="" />;
  const Icon = item.icon ?? LayoutGrid;
  return <Icon aria-hidden="true" />;
}

type SubcategoryLink = { id: string; label: string; count: number };

/* Desktop category list: beside the promo banner on the homepage, and as
   the catalog page's navigation, where the active category also lists its
   subcategories. */
export function CategorySidebar({
  categories,
  counts,
  onCategory,
  active,
  activeSubcategories = [],
  activeSubcategory = "all",
  onSubcategory,
  limit,
  onAll,
  t,
}: CategoryNavProps & {
  /* Show only the first categories, then a link to all of them. */
  limit?: number;
  onAll?: () => void;
  active?: Category;
  activeSubcategories?: SubcategoryLink[];
  activeSubcategory?: string;
  onSubcategory?: (id: string) => void;
}) {
  const listed = categories
    .filter((item) => active !== undefined || item.id !== "all")
    .slice(0, limit);
  const hiddenCount =
    categories.filter((item) => item.id !== "all").length - listed.length;
  return (
    <nav className="category-sidebar" aria-label={t("categories")}>
      {listed.map((item) => {
        const isActive = active === item.id;
        return (
          <div key={item.id} className="category-sidebar__group">
            <button
              className={isActive ? "active" : undefined}
              aria-current={
                isActive && activeSubcategory === "all" ? "page" : undefined
              }
              onClick={() => onCategory(item.id)}
            >
              <span className="category-sidebar__visual">
                <CategoryVisual item={item} />
              </span>
              <b>{item.id === "all" ? t("allCategories") : t(item.id)}</b>
              <small>{counts[item.id]}</small>
              <ChevronRight aria-hidden="true" />
            </button>
            {isActive && activeSubcategories.length > 0 && (
              <div className="category-sidebar__subs">
                {activeSubcategories.map((sub) => (
                  <button
                    key={sub.id}
                    className={
                      activeSubcategory === sub.id ? "active" : undefined
                    }
                    aria-current={
                      activeSubcategory === sub.id ? "page" : undefined
                    }
                    onClick={() => onSubcategory?.(sub.id)}
                  >
                    <span>{sub.label}</span>
                    <small>{sub.count}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {onAll && hiddenCount > 0 && (
        <button className="category-sidebar__all" onClick={onAll}>
          <span className="category-sidebar__visual">
            <LayoutGrid aria-hidden="true" />
          </span>
          <b>{t("allCategories")}</b>
          <small>+{hiddenCount}</small>
          <ChevronRight aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}

/* Image tiles; the first, dark tile opens the whole catalog. */
export function CategoryTiles({
  categories,
  counts,
  onCategory,
  t,
}: CategoryNavProps) {
  return (
    <section
      className="category-tiles shell"
      id="category-tiles"
      aria-label={t("categories")}
    >
      <div className="category-tiles__track">
        {categories.slice(0, 14).map((item) => (
          <button
            key={item.id}
            className={
              item.id === "all"
                ? "category-tile category-tile--all"
                : "category-tile"
            }
            onClick={() => onCategory(item.id)}
          >
            <span className="category-tile__visual">
              <CategoryVisual item={item} />
            </span>
            <b>{item.id === "all" ? t("allCategories") : t(item.id)}</b>
            <small>{counts[item.id]}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
