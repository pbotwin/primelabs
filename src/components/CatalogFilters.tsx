import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Category } from "../types";
import type { CatalogSort } from "../utils/catalog";
import { CategoryVisual, type CategoryItem } from "./CategoryNav";
import { HorizontalScroller } from "./HorizontalScroller";
import { CustomSelect } from "./CustomSelect";

type CatalogFiltersProps = {
  subcategoryNavigation: ReactNode;
  categories: CategoryItem[];
  counts: Record<string, number>;
  category: Category;
  onCategory: (id: Category) => void;
  brands: string[];
  brand: string;
  onBrand: (brand: string) => void;
  minPrice: string;
  maxPrice: string;
  /* Applies both price limits at once ("" for no limit). */
  onPrice: (minimum: string, maximum: string) => void;
  allVariants: boolean;
  onAllVariants: (value: boolean) => void;
  query: string;
  onQuery: (value: string) => void;
  sort: CatalogSort;
  onSort: (value: CatalogSort) => void;
  t: (key: string) => string;
};

/* One compact row of catalog controls; wraps into a grid on small screens. */
export function CatalogFilters({
  subcategoryNavigation,
  categories,
  counts,
  category,
  onCategory,
  brands,
  brand,
  onBrand,
  minPrice,
  maxPrice,
  onPrice,
  allVariants,
  onAllVariants,
  query,
  onQuery,
  sort,
  onSort,
  t,
}: CatalogFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  // Typed price limits take effect when applied; the fields follow the
  // applied limits whenever those change (e.g. "clear filters").
  const [draftMin, setDraftMin] = useState(minPrice);
  const [draftMax, setDraftMax] = useState(maxPrice);
  const [applied, setApplied] = useState({ min: minPrice, max: maxPrice });
  if (applied.min !== minPrice || applied.max !== maxPrice) {
    setApplied({ min: minPrice, max: maxPrice });
    setDraftMin(minPrice);
    setDraftMax(maxPrice);
  }
  const priceApplied = minPrice !== "" || maxPrice !== "";
  return (
    <>
      <div className="catalog-filters__browse">
        <div className="catalog-filters__browse-row">
          <span>{t("categories")}</span>
          <HorizontalScroller
            className="catalog-browse-list"
            label={t("categories")}
            previousLabel={t("previous")}
            nextLabel={t("next")}
          >
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={category === item.id}
                className={category === item.id ? "active" : undefined}
                onClick={() => onCategory(item.id)}
              >
                <span className="catalog-browse-list__visual">
                  <CategoryVisual item={item} />
                </span>
                {t(item.id)} <small>{counts[item.id]}</small>
              </button>
            ))}
          </HorizontalScroller>
        </div>
        <div className="catalog-subcategory-row">{subcategoryNavigation}</div>
        <div className="catalog-filters__browse-row">
          <span>{t("brands")}</span>
          <HorizontalScroller
            className="catalog-browse-list"
            label={t("brands")}
            previousLabel={t("previous")}
            nextLabel={t("next")}
          >
            {[
              { value: "all", label: t("allBrands") },
              ...brands.map((item) => ({ value: item, label: item })),
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={brand === item.value}
                className={brand === item.value ? "active" : undefined}
                onClick={() => onBrand(item.value)}
              >
                <span className="catalog-browse-list__brand" aria-hidden="true">
                  {item.value === "all" ? (
                    <LayoutGrid />
                  ) : (
                    item.label
                      .split(/[ .]+/)
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")
                  )}
                </span>
                {item.label}
              </button>
            ))}
          </HorizontalScroller>
        </div>
      </div>
      <div
        className={`catalog-filters catalog-filters--compact${expanded ? " catalog-filters--expanded" : ""}`}
      >
        <div className="catalog-filters__desktop-brand">
          <CustomSelect<string>
            label={t("brands")}
            value={brand}
            options={[
              { value: "all", label: t("allBrands") },
              ...brands.map((item) => ({ value: item, label: item })),
            ]}
            onChange={onBrand}
          />
        </div>
        <div className="catalog-filters__price">
          <span>{t("price")}</span>
          <div>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="0 ₾"
              value={draftMin}
              onChange={(event) => setDraftMin(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onPrice(draftMin, draftMax);
              }}
              aria-label={`${t("price")} ${t("priceFrom")}`}
            />
            <i>–</i>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="500 ₾"
              value={draftMax}
              onChange={(event) => setDraftMax(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onPrice(draftMin, draftMax);
              }}
              aria-label={`${t("price")} ${t("priceTo")}`}
            />
          </div>
          <div className="catalog-filters__price-actions">
            <button
              type="button"
              className="catalog-filters__apply"
              onClick={() => onPrice(draftMin, draftMax)}
            >
              {t("applyFilter")}
            </button>
            {priceApplied && (
              <button
                type="button"
                className="catalog-filters__clear"
                onClick={() => onPrice("", "")}
              >
                {t("clearFilter")}
              </button>
            )}
          </div>
        </div>
        <label className="catalog-filters__variants">
          <span>{t("displayOptions")}</span>
          <span className="catalog-filters__checkbox">
            <input
              type="checkbox"
              checked={allVariants}
              onChange={(event) => onAllVariants(event.target.checked)}
            />
            <span>
              {t("showAllVariants")}
              <small>{t("showAllVariantsDesc")}</small>
            </span>
          </span>
        </label>
        <label id="catalog-extra-filters" className="catalog-filters__search">
          <span>{t("searchLabel")}</span>
          <span className="catalog-filters__search-field">
            <Search aria-hidden="true" />
            <input
              type="text"
              inputMode="search"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder={t("search")}
            />
            {query && (
              <button
                type="button"
                onClick={() => onQuery("")}
                aria-label={t("close")}
              >
                <X />
              </button>
            )}
          </span>
        </label>
        <CustomSelect<CatalogSort>
          label={t("sort")}
          value={sort}
          options={[
            { value: "featured", label: t("featured") },
            { value: "low", label: t("low") },
            { value: "high", label: t("high") },
            { value: "name", label: t("nameSort") },
          ]}
          onChange={onSort}
        />
        <button
          type="button"
          className="catalog-filters__more"
          aria-expanded={expanded}
          aria-controls="catalog-extra-filters"
          onClick={() => setExpanded((value) => !value)}
        >
          <SlidersHorizontal /> {t(expanded ? "closeFilters" : "moreFilters")}{" "}
          <ChevronDown />
        </button>
      </div>
    </>
  );
}
